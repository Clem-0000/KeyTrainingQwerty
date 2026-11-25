/**
 * Persistent LocalStorage State: Preferences, Lesson Mastery, Per-Key Telemetry & Confusions
 */

const STORAGE_KEY = 'keycraft_qwerty_v1';

const DEFAULT_STATE = {
  prefs: {
    theme: 'light',
    soundProfile: 'thock',
    layoutVariant: 'us-ansi', // 'us-ansi' | 'us-intl'
    scanCodeEmulation: false,
    errorMode: 'stop', // 'stop' | 'fluid'
    showZones: true,
    showAzertyDiff: false,
    blindMode: false,
    currentLessonId: 'l01',
    wordsCorpus: 'english',
    wordsCount: 30,
  },
  lessons: {},
  keyStats: {},
  confusions: {},
  sessions: [],
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
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return {
        ...structuredClone(DEFAULT_STATE),
        ...parsed,
        prefs: { ...DEFAULT_STATE.prefs, ...(parsed.prefs || {}) },
        totals: { ...DEFAULT_STATE.totals, ...(parsed.totals || {}) },
      };
    } catch {
      return structuredClone(DEFAULT_STATE);
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // Ignore quota errors in restricted storage contexts
    }
  }

  updatePref(key, value) {
    this.state.prefs[key] = value;
    this.save();
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

  recordSession({ mode, label, lessonId, targetWpm, wpm, accuracy, durationMs, charsTyped }) {
    const today = new Date().toISOString().slice(0, 10);
    const { totals } = this.state;

    totals.timeMs += durationMs;
    totals.charsTyped += charsTyped;
    if (accuracy >= 90 && wpm > totals.bestWpm) {
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

    let stars = 0;
    if (lessonId) {
      const goal = targetWpm || 25;
      if (accuracy >= 98 && wpm >= goal + 6) stars = 3;
      else if (accuracy >= 94 && wpm >= goal * 0.85) stars = 2;
      else if (accuracy >= 86) stars = 1;

      const prevLesson = this.state.lessons[lessonId] || {
        stars: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        attempts: 0,
      };

      this.state.lessons[lessonId] = {
        stars: Math.max(prevLesson.stars, stars),
        bestWpm: Math.max(prevLesson.bestWpm, wpm),
        bestAccuracy: Math.max(prevLesson.bestAccuracy, accuracy),
        attempts: prevLesson.attempts + 1,
      };
    }

    this.state.sessions.unshift({
      date: new Date().toISOString(),
      mode,
      label,
      wpm,
      accuracy,
      durationMs,
    });
    if (this.state.sessions.length > 40) {
      this.state.sessions.length = 40;
    }

    this.save();
    return stars;
  }

  getWeakestKeys(limit = 5) {
    const entries = Object.entries(this.state.keyStats)
      .filter(([, s]) => s.hits + s.errors >= 4)
      .map(([char, s]) => {
        const total = s.hits + s.errors;
        const errorRate = s.errors / total;
        const avgMs = s.samples > 0 ? s.totalMs / s.samples : 260;
        // Weighted weakness score combining error rate and hesitation latency
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
      .filter((item) => item.score > 3.5)
      .sort((a, b) => b.score - a.score);

    return entries.slice(0, limit);
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

  resetStats() {
    this.state.lessons = {};
    this.state.keyStats = {};
    this.state.confusions = {};
    this.state.sessions = [];
    this.state.totals = structuredClone(DEFAULT_STATE.totals);
    this.save();
  }
}

export const store = new Store();
