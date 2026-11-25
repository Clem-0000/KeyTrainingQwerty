/**
 * Keycraft QWERTY V2 — Persistent Gamified Store (XP, 5-Star Stages, Badges, Daily Goal & Heatmap)
 */

import { BADGES, computeXpReward, getRankInfo } from './data/gamification.js?v=20261125-3';

const STORAGE_KEY = 'keycraft_qwerty_v2';

const DEFAULT_STATE = {
  prefs: {
    theme: 'light',
    soundProfile: 'thock',
    layoutVariant: 'us-ansi',
    scanCodeEmulation: false,
    errorMode: 'stop',
    showZones: true,
    showHands: true,
    showAzertyDiff: false,
    blindMode: false,
    currentStageId: 's01',
  },
  xp: 0,
  stages: {},
  badges: {},
  keyStats: {},
  confusions: {},
  sessions: [],
  daily: {
    date: null,
    timeMs: 0,
    goalMs: 300000, // 5 minutes/day
  },
  totals: {
    timeMs: 0,
    charsTyped: 0,
    bestWpm: 0,
    lastDay: null,
    streakDays: 0,
  },
};

export class Store {
  constructor() {
    this.state = this.load();
    this.syncDailyDate();
  }

  load() {
    try {
      if (typeof localStorage === 'undefined') return structuredClone(DEFAULT_STATE);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(DEFAULT_STATE),
        ...parsed,
        prefs: { ...DEFAULT_STATE.prefs, ...(parsed.prefs || {}) },
        daily: { ...DEFAULT_STATE.daily, ...(parsed.daily || {}) },
        totals: { ...DEFAULT_STATE.totals, ...(parsed.totals || {}) },
      };
    } catch {
      return structuredClone(DEFAULT_STATE);
    }
  }

  save() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch {
      // Ignore storage quota errors
    }
  }

  syncDailyDate() {
    const today = new Date().toISOString().slice(0, 10);
    if (this.state.daily.date !== today) {
      this.state.daily.date = today;
      this.state.daily.timeMs = 0;
    }
  }

  updatePref(key, value) {
    this.state.prefs[key] = value;
    this.save();
  }

  getTotalStars() {
    return Object.values(this.state.stages).reduce((sum, s) => sum + (s.stars || 0), 0);
  }

  getRecommendedStage(allStages) {
    for (const stage of allStages) {
      const rec = this.state.stages[stage.id];
      if (!rec || rec.stars < 3) {
        return stage;
      }
    }
    return allStages[allStages.length - 1];
  }

  recordKeystroke(expectedChar, typedChar, isCorrect, latencyMs) {
    if (!expectedChar || expectedChar === '\n' || expectedChar === ' ') return;
    const key = expectedChar.toLowerCase();
    if (!this.state.keyStats[key]) {
      this.state.keyStats[key] = { hits: 0, errors: 0, totalMs: 0, samples: 0 };
    }
    const stat = this.state.keyStats[key];
    if (isCorrect) {
      stat.hits += 1;
      if (latencyMs > 25 && latencyMs < 2400) {
        stat.totalMs += latencyMs;
        stat.samples += 1;
      }
    } else {
      stat.errors += 1;
      if (typedChar && typedChar.length === 1 && typedChar !== ' ') {
        const pair = `${expectedChar}→${typedChar}`;
        this.state.confusions[pair] = (this.state.confusions[pair] || 0) + 1;
      }
    }
  }

  recordOutcome({
    label,
    stageId = null,
    stars = 3,
    wpm = 0,
    accuracy = 100,
    durationMs = 0,
    charsTyped = 0,
    maxCombo = 0,
    isBoss = false,
    blindMode = false,
    arcadeWin = false,
  }) {
    this.syncDailyDate();
    const prevRank = getRankInfo(this.state.xp);

    const today = new Date().toISOString().slice(0, 10);
    const { totals, daily } = this.state;

    totals.timeMs += durationMs;
    daily.timeMs += durationMs;
    totals.charsTyped += charsTyped;

    if (accuracy >= 92 && wpm > totals.bestWpm) {
      totals.bestWpm = wpm;
    }

    if (totals.lastDay !== today) {
      if (totals.lastDay) {
        const prev = new Date(totals.lastDay);
        const curr = new Date(today);
        const diffDays = Math.round((curr - prev) / 86400000);
        totals.streakDays = diffDays === 1 ? totals.streakDays + 1 : 1;
      } else {
        totals.streakDays = 1;
      }
      totals.lastDay = today;
    }

    let isFirstClear = false;
    if (stageId) {
      const prevStage = this.state.stages[stageId];
      isFirstClear = !prevStage;
      this.state.stages[stageId] = {
        stars: Math.max(prevStage?.stars || 0, stars),
        bestWpm: Math.max(prevStage?.bestWpm || 0, wpm),
        bestAcc: Math.max(prevStage?.bestAcc || 0, accuracy),
        attempts: (prevStage?.attempts || 0) + 1,
      };
    }

    const xpReward = computeXpReward({
      stars,
      accuracy,
      maxCombo,
      isBoss,
      isFirstClear,
    });
    this.state.xp += xpReward.total;
    const newRank = getRankInfo(this.state.xp);
    const leveledUp = newRank.level > prevRank.level;

    this.state.sessions.unshift({
      date: new Date().toISOString(),
      label,
      wpm,
      accuracy,
      stars,
    });
    if (this.state.sessions.length > 35) {
      this.state.sessions.length = 35;
    }

    // Evaluate newly unlocked Badges
    const ctx = { accuracy, charsTyped, maxCombo, stars, blindMode, arcadeWin };
    const newlyUnlockedBadges = [];
    for (const badge of BADGES) {
      if (!this.state.badges[badge.id] && badge.check(this.state, ctx)) {
        this.state.badges[badge.id] = Date.now();
        newlyUnlockedBadges.push(badge);
      }
    }

    this.save();
    return {
      xpReward,
      leveledUp,
      newRank,
      newlyUnlockedBadges,
    };
  }

  /**
   * Placement Diagnostic: unlocks & grants 3 stars on earlier worlds matching tested speed
   */
  applyPlacementResult(wpm, accuracy, allStages) {
    if (accuracy < 82) return 0;
    let maxWorldToValidate = 0;
    if (wpm >= 48 && accuracy >= 94) maxWorldToValidate = 4;
    else if (wpm >= 35 && accuracy >= 92) maxWorldToValidate = 3;
    else if (wpm >= 25 && accuracy >= 90) maxWorldToValidate = 2;
    else if (wpm >= 18) maxWorldToValidate = 1;

    let count = 0;
    for (const st of allStages) {
      if (st.worldNumber <= maxWorldToValidate) {
        const prev = this.state.stages[st.id];
        if (!prev || prev.stars < 3) {
          this.state.stages[st.id] = {
            stars: 3,
            bestWpm: Math.max(prev?.bestWpm || 0, wpm),
            bestAcc: Math.max(prev?.bestAcc || 0, accuracy),
            attempts: (prev?.attempts || 0) + 1,
          };
          count += 1;
        }
      }
    }
    if (count > 0) {
      this.state.xp += count * 25;
      const nextRec = this.getRecommendedStage(allStages);
      this.state.prefs.currentStageId = nextRec.id;
      this.save();
    }
    return count;
  }

  getWeakestKeys(limit = 5) {
    return Object.entries(this.state.keyStats)
      .filter(([, s]) => s.hits + s.errors >= 4)
      .map(([char, s]) => {
        const total = s.hits + s.errors;
        const errorRate = s.errors / total;
        const avgMs = s.samples > 0 ? s.totalMs / s.samples : 250;
        const score = errorRate * 100 + Math.max(0, (avgMs - 190) / 14);
        return {
          char,
          hits: s.hits,
          errors: s.errors,
          accuracy: Math.round((s.hits / total) * 100),
          avgMs: Math.round(avgMs),
          score,
        };
      })
      .filter((x) => x.score > 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  getTopConfusions(limit = 6) {
    return Object.entries(this.state.confusions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([pair, count]) => {
        const [expected, typed] = pair.split('→');
        return { expected, typed, count };
      });
  }

  resetAll() {
    const theme = this.state.prefs.theme;
    this.state = structuredClone(DEFAULT_STATE);
    this.state.prefs.theme = theme;
    this.syncDailyDate();
    this.save();
  }
}

export const store = new Store();
