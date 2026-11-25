/**
 * Keycraft QWERTY V2 — Precision Typing Engine (Combos, Timed Sprints & Speed Timeline)
 */

import { WORD_CORPORA, QUOTES_CORPUS, CODE_SNIPPETS } from './data/curriculum.js';

export class TypingEngine {
  constructor({ onUpdate, onComplete, onKeyResult, onComboMilestone }) {
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.onKeyResult = onKeyResult;
    this.onComboMilestone = onComboMilestone;

    this.text = '';
    this.meta = {};
    this.states = [];
    this.hadError = [];
    this.cursor = 0;
    this.blockedOnCurrent = false;

    this.durationLimitMs = 0; // 0 = finish when text ends; >0 = timed sprint
    this.startTime = null;
    this.lastStrokeTime = null;
    this.endTime = null;
    this.timerId = null;

    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeline = [];
    this.lastTimelineSec = 0;
    this.sessionWeakCounts = {};
    this.isFinished = false;
  }

  load(text, meta = {}) {
    this.stopTimer();
    const clean = (text || '').replace(/\r\n/g, '\n').trim();
    this.text = clean.length > 0 ? clean : 'asdf jkl;';
    this.meta = meta;
    this.durationLimitMs = meta.durationLimitMs || 0;

    this.states = new Array(this.text.length).fill('pending');
    this.hadError = new Array(this.text.length).fill(false);
    this.cursor = 0;
    this.blockedOnCurrent = false;

    this.startTime = null;
    this.lastStrokeTime = null;
    this.endTime = null;

    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeline = [];
    this.lastTimelineSec = 0;
    this.sessionWeakCounts = {};
    this.isFinished = false;

    this.onUpdate?.(false);
  }

  startTimer() {
    if (this.timerId) return;
    this.timerId = globalThis.setInterval(() => {
      if (this.isFinished || !this.startTime) return;
      const elapsed = performance.now() - this.startTime;
      const wholeSec = Math.floor(elapsed / 1000);
      if (wholeSec > this.lastTimelineSec) {
        this.lastTimelineSec = wholeSec;
        const m = this.getMetrics();
        this.timeline.push({ sec: wholeSec, wpm: m.wpm });
      }
      if (this.durationLimitMs > 0 && elapsed >= this.durationLimitMs) {
        this.finish();
        return;
      }
      this.onUpdate?.(true);
    }, 150);
  }

  stopTimer() {
    if (this.timerId) {
      globalThis.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  get currentTargetChar() {
    if (this.isFinished || this.cursor >= this.text.length) return null;
    return this.text[this.cursor];
  }

  handleBackspace(errorMode) {
    if (this.isFinished) return;
    if (errorMode === 'stop') {
      if (this.blockedOnCurrent) {
        this.blockedOnCurrent = false;
        this.onUpdate?.(false);
      }
      return;
    }
    if (this.cursor > 0) {
      this.cursor -= 1;
      this.states[this.cursor] = 'pending';
      this.blockedOnCurrent = false;
      this.onUpdate?.(false);
    }
  }

  handleChar(typedChar, errorMode = 'stop') {
    if (this.isFinished || this.cursor >= this.text.length) return;

    const now = performance.now();
    if (!this.startTime) {
      this.startTime = now;
      this.lastStrokeTime = now;
      this.startTimer();
    }

    const latencyMs = now - (this.lastStrokeTime || now);
    this.lastStrokeTime = now;

    const expected = this.text[this.cursor];
    const isMatch = typedChar === expected;

    this.totalKeystrokes += 1;
    if (isMatch) {
      this.correctKeystrokes += 1;
      this.combo += 1;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      if ([15, 30, 50, 75, 100].includes(this.combo)) {
        const tier = [15, 30, 50, 75, 100].indexOf(this.combo) + 1;
        this.onComboMilestone?.(this.combo, tier);
      }
    } else {
      this.combo = 0;
      if (expected !== ' ' && expected !== '\n') {
        this.sessionWeakCounts[expected] = (this.sessionWeakCounts[expected] || 0) + 1;
      }
    }

    this.onKeyResult?.({
      expected,
      typed: typedChar,
      isCorrect: isMatch,
      latencyMs,
    });

    if (errorMode === 'stop') {
      if (isMatch) {
        this.states[this.cursor] = this.hadError[this.cursor] ? 'fixed' : 'ok';
        this.blockedOnCurrent = false;
        this.advanceCursorAfterMatch(expected);
      } else {
        this.hadError[this.cursor] = true;
        this.blockedOnCurrent = true;
      }
    } else {
      if (isMatch) {
        this.states[this.cursor] = this.hadError[this.cursor] ? 'fixed' : 'ok';
        this.advanceCursorAfterMatch(expected);
      } else {
        this.hadError[this.cursor] = true;
        this.states[this.cursor] = 'err';
        this.cursor += 1;
      }
    }

    if (this.cursor >= this.text.length) {
      this.finish();
    } else {
      this.onUpdate?.(false);
    }
  }

  advanceCursorAfterMatch(matchedChar) {
    this.cursor += 1;
    if (matchedChar === '\n' && this.meta.isCode) {
      while (this.cursor < this.text.length && this.text[this.cursor] === ' ') {
        this.states[this.cursor] = 'ok';
        this.cursor += 1;
      }
    }
  }

  finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.endTime = performance.now();
    this.stopTimer();
    const finalMetrics = this.getMetrics();
    this.timeline.push({
      sec: Math.max(1, Math.round(finalMetrics.elapsedMs / 1000)),
      wpm: finalMetrics.wpm,
    });
    this.onUpdate?.(false);
    this.onComplete?.(finalMetrics);
  }

  getMetrics() {
    const now = this.endTime || (this.startTime ? performance.now() : 0);
    const rawElapsed = this.startTime ? Math.max(250, now - this.startTime) : 0;
    const elapsedMs =
      this.durationLimitMs > 0 ? Math.min(this.durationLimitMs, rawElapsed) : rawElapsed;
    const minutes = elapsedMs / 60000;

    let validChars = 0;
    for (let i = 0; i < this.cursor; i++) {
      if (this.states[i] === 'ok' || this.states[i] === 'fixed') {
        validChars += 1;
      }
    }

    const wpm = elapsedMs >= 800 && validChars >= 2 ? Math.round(validChars / 5 / minutes) : 0;
    const rawWpm =
      elapsedMs >= 800 && this.totalKeystrokes >= 2
        ? Math.round(this.totalKeystrokes / 5 / minutes)
        : 0;
    const accuracy =
      this.totalKeystrokes > 0
        ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
        : 100;

    const progress =
      this.durationLimitMs > 0
        ? Math.min(100, Math.round((elapsedMs / this.durationLimitMs) * 100))
        : this.text.length > 0
          ? Math.round((this.cursor / this.text.length) * 100)
          : 0;

    const remainingSec =
      this.durationLimitMs > 0
        ? Math.max(0, Math.ceil((this.durationLimitMs - elapsedMs) / 1000))
        : null;

    const sessionWeakList = Object.entries(this.sessionWeakCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([ch, count]) => ({ ch, count }));

    return {
      wpm,
      rawWpm,
      accuracy,
      progress,
      remainingSec,
      elapsedMs,
      charsTyped: validChars,
      combo: this.combo,
      maxCombo: this.maxCombo,
      timeline: this.timeline,
      sessionWeakList,
    };
  }
}

export function buildPracticePrompt({
  mode,
  corpus = 'english',
  durationSec = 0,
  weakKeys = [],
}) {
  if (mode === 'quotes') {
    const quote = QUOTES_CORPUS[Math.floor(Math.random() * QUOTES_CORPUS.length)];
    return {
      text: quote,
      title: 'Citation fluide',
      sub: 'Cadence & Ponctuation naturelle',
      targetWpm: 32,
      isCode: false,
      durationLimitMs: 0,
    };
  }

  if (mode === 'code') {
    const item = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    return {
      text: item.code,
      title: `Code ${item.lang}`,
      sub: 'Symboles & Syntaxe développeur',
      targetWpm: 26,
      isCode: true,
      durationLimitMs: 0,
    };
  }

  if (mode === 'adaptive') {
    if (!weakKeys || weakKeys.length === 0) {
      return {
        text: sampleWords(WORD_CORPORA.azerty_traps, 24).join(' '),
        title: 'Drill Intelligent · Diagnostic',
        sub: 'Tapez cette série pour détecter vos touches les plus hésitantes',
        targetWpm: 26,
        isCode: false,
        durationLimitMs: 0,
      };
    }
    const targets = weakKeys.map((w) => w.char);
    const pool = [
      ...WORD_CORPORA.english,
      ...WORD_CORPORA.french_ascii,
      ...WORD_CORPORA.azerty_traps,
    ];
    const matching = pool.filter((w) => targets.some((t) => w.toLowerCase().includes(t)));
    const src = matching.length >= 5 ? matching : pool;
    const words = sampleWords(src, 25);
    return {
      text: words.join(' '),
      title: `Drill Adaptatif · [ ${targets.map((t) => t.toUpperCase()).join(' · ')} ]`,
      sub: 'Généré sur mesure à partir de vos erreurs et temps de réaction',
      targetWpm: 28,
      isCode: false,
      durationLimitMs: 0,
    };
  }

  // Timed Sprint or Word flow
  const list = WORD_CORPORA[corpus] || WORD_CORPORA.english;
  const wordCount = durationSec > 0 ? Math.max(70, durationSec * 3) : 28;
  const labels = {
    english: 'Anglais fréquent',
    french_ascii: 'Français fluide',
    french_accents: 'Français US-International',
    azerty_traps: 'Spécial pièges AZERTY',
  };

  return {
    text: sampleWords(list, wordCount).join(' '),
    title:
      durationSec > 0
        ? `Chrono ${durationSec}s · ${labels[corpus] || 'Mots'}`
        : `${labels[corpus] || 'Mots'} · 28 mots`,
    sub:
      durationSec > 0
        ? `Tapez le maximum de mots justes en ${durationSec} secondes !`
        : 'Fluidité régulière sans quitter l’écran des yeux',
    targetWpm: 32,
    isCode: false,
    durationLimitMs: durationSec > 0 ? durationSec * 1000 : 0,
  };
}

function sampleWords(list, count) {
  const out = [];
  let prev = '';
  for (let i = 0; i < count; i++) {
    let pick = list[Math.floor(Math.random() * list.length)];
    if (pick === prev && list.length > 1) {
      pick = list[(list.indexOf(pick) + 1) % list.length];
    }
    out.push(pick);
    prev = pick;
  }
  return out;
}
