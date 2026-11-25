/**
 * Precision Typing Engine & Adaptive Weakness Drill Generator
 */

import { WORD_CORPORA, QUOTES_CORPUS, CODE_SNIPPETS } from './data/curriculum.js';

export class TypingEngine {
  constructor({ onUpdate, onComplete, onKeyResult }) {
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.onKeyResult = onKeyResult;

    this.text = '';
    this.meta = {};
    this.states = [];
    this.hadError = [];
    this.cursor = 0;
    this.blockedOnCurrent = false;

    this.startTime = null;
    this.lastStrokeTime = null;
    this.endTime = null;
    this.timerId = null;

    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.sessionWeakCounts = {};
    this.isFinished = false;
  }

  load(text, meta = {}) {
    this.stopTimer();
    const clean = (text || '').replace(/\r\n/g, '\n').trim();
    this.text = clean.length > 0 ? clean : 'asdf jkl;';
    this.meta = meta;
    this.states = new Array(this.text.length).fill('pending');
    this.hadError = new Array(this.text.length).fill(false);
    this.cursor = 0;
    this.blockedOnCurrent = false;

    this.startTime = null;
    this.lastStrokeTime = null;
    this.endTime = null;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.sessionWeakCounts = {};
    this.isFinished = false;

    this.onUpdate?.();
  }

  startTimer() {
    if (this.timerId) return;
    this.timerId = globalThis.setInterval(() => {
      if (!this.isFinished && this.startTime) {
        this.onUpdate?.(true);
      }
    }, 200);
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
        this.onUpdate?.();
      }
      return;
    }
    if (this.cursor > 0) {
      this.cursor -= 1;
      this.states[this.cursor] = 'pending';
      this.blockedOnCurrent = false;
      this.onUpdate?.();
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
    } else if (expected !== ' ' && expected !== '\n') {
      this.sessionWeakCounts[expected] = (this.sessionWeakCounts[expected] || 0) + 1;
    }

    this.onKeyResult?.({
      expected,
      typed: typedChar,
      isCorrect: isMatch,
      latencyMs,
    });

    if (errorMode === 'stop') {
      if (isMatch) {
        this.states[this.cursor] = this.hadError[this.cursor] ? 'corrected' : 'correct';
        this.blockedOnCurrent = false;
        this.advanceCursorAfterMatch(expected);
      } else {
        this.hadError[this.cursor] = true;
        this.blockedOnCurrent = true;
      }
    } else {
      // Fluid mode
      if (isMatch) {
        this.states[this.cursor] = this.hadError[this.cursor] ? 'corrected' : 'correct';
        this.advanceCursorAfterMatch(expected);
      } else {
        this.hadError[this.cursor] = true;
        this.states[this.cursor] = 'wrong';
        this.cursor += 1;
      }
    }

    if (this.cursor >= this.text.length) {
      this.finish();
    } else {
      this.onUpdate?.();
    }
  }

  advanceCursorAfterMatch(matchedChar) {
    this.cursor += 1;
    // In multi-line code snippets, auto-advance leading indentation spaces after Enter
    if (matchedChar === '\n' && this.meta.isCode) {
      while (this.cursor < this.text.length && this.text[this.cursor] === ' ') {
        this.states[this.cursor] = 'correct';
        this.cursor += 1;
      }
    }
  }

  finish() {
    this.isFinished = true;
    this.endTime = performance.now();
    this.stopTimer();
    this.onUpdate?.();
    this.onComplete?.(this.getMetrics());
  }

  getMetrics() {
    const now = this.endTime || (this.startTime ? performance.now() : 0);
    const elapsedMs = this.startTime ? Math.max(250, now - this.startTime) : 0;
    const minutes = elapsedMs / 60000;

    let validChars = 0;
    for (let i = 0; i < this.cursor; i++) {
      if (this.states[i] === 'correct' || this.states[i] === 'corrected') {
        validChars += 1;
      }
    }

    const wpm =
      elapsedMs >= 900 && validChars >= 2 ? Math.round(validChars / 5 / minutes) : 0;
    const rawWpm =
      elapsedMs >= 900 && this.totalKeystrokes >= 2
        ? Math.round(this.totalKeystrokes / 5 / minutes)
        : 0;
    const accuracy =
      this.totalKeystrokes > 0
        ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
        : 100;
    const progress =
      this.text.length > 0 ? Math.round((this.cursor / this.text.length) * 100) : 0;

    const sessionWeakList = Object.entries(this.sessionWeakCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([ch, count]) => ({ ch, count }));

    return {
      wpm,
      rawWpm,
      accuracy,
      progress,
      elapsedMs,
      charsTyped: validChars,
      sessionWeakList,
    };
  }
}

/**
 * Generates randomized fluent word sequences, quotes, code snippets, or adaptive weakness drills.
 */
export function buildPracticePrompt({ mode, corpus = 'english', wordCount = 30, weakKeys = [] }) {
  if (mode === 'quotes') {
    const quote = QUOTES_CORPUS[Math.floor(Math.random() * QUOTES_CORPUS.length)];
    return {
      text: quote,
      title: 'Citation fluide',
      kicker: 'Cadence & Ponctuation',
      tip: 'Gardez une respiration calme et anticipez le mot suivant du regard.',
      isCode: false,
    };
  }

  if (mode === 'code') {
    const item = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    return {
      text: item.code,
      title: `Extrait ${item.lang}`,
      kicker: 'Code & Symboles QWERTY',
      tip: 'Utilisez Enter ↵ en fin de ligne : l’indentation suivante est automatique.',
      isCode: true,
    };
  }

  if (mode === 'adaptive') {
    if (!weakKeys || weakKeys.length === 0) {
      // Calibration drill testing key QWERTY & AZERTY-diff positions
      const cal = sampleWords(WORD_CORPORA.azerty_traps, 22);
      return {
        text: cal.join(' '),
        title: 'Calibrage diagnostique QWERTY',
        kicker: 'Drill Intelligent',
        tip: 'Tapez quelques lignes pour que le moteur identifie vos touches les plus hésitantes.',
        isCode: false,
      };
    }

    const targets = weakKeys.map((w) => w.char);
    const pool = [
      ...WORD_CORPORA.english,
      ...WORD_CORPORA.french_ascii,
      ...WORD_CORPORA.azerty_traps,
    ];
    const matching = pool.filter((w) => targets.some((t) => w.toLowerCase().includes(t)));
    const chosen = [];
    const source = matching.length >= 6 ? matching : pool;

    for (let i = 0; i < 24; i++) {
      let word = source[Math.floor(Math.random() * source.length)];
      // If a punctuation/symbol is among weak keys, weave it naturally
      const punctTargets = targets.filter((t) => !/[a-z0-9]/i.test(t));
      if (punctTargets.length > 0 && i % 3 === 1) {
        const p = punctTargets[i % punctTargets.length];
        if ([';', ',', '.', '?', '!'].includes(p)) word = `${word}${p}`;
        else if (p === '[') word = `[${word}]`;
        else if (p === '{') word = `{${word}}`;
        else if (p === '(') word = `(${word})`;
      }
      chosen.push(word);
    }

    return {
      text: chosen.join(' '),
      title: `Ciblage : ${targets.map((t) => t.toUpperCase()).join(' · ')}`,
      kicker: 'Drill Adaptatif Personnalisé',
      tip: 'Séance générée sur mesure à partir de vos erreurs et temps de réaction récents.',
      isCode: false,
    };
  }

  // Default: 'words' mode
  const list = WORD_CORPORA[corpus] || WORD_CORPORA.english;
  const words = sampleWords(list, wordCount);
  const labels = {
    english: 'Anglais fréquent',
    french_ascii: 'Français fluide (sans accents)',
    french_accents: 'Français accentué (US-International)',
    azerty_traps: 'Spécial pièges AZERTY → QWERTY',
  };

  return {
    text: words.join(' '),
    title: `${labels[corpus] || 'Mots'} — ${wordCount} mots`,
    kicker: 'Fluidité & Endurance',
    tip:
      corpus === 'french_accents'
        ? "Mode US-International : utilisez ' + e pour é, ` + e pour è, ^ + e pour ê, ' + c pour ç."
        : 'Ne cherchez pas la vitesse maximale : visez 97 %+ de précision sans regarder vos mains.',
    isCode: false,
  };
}

function sampleWords(list, count) {
  const result = [];
  let prev = '';
  for (let i = 0; i < count; i++) {
    let pick = list[Math.floor(Math.random() * list.length)];
    if (pick === prev && list.length > 1) {
      pick = list[(list.indexOf(pick) + 1) % list.length];
    }
    result.push(pick);
    prev = pick;
  }
  return result;
}
