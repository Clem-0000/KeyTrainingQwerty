/**
 * Keycraft QWERTY — Main Studio Controller
 */

import {
  ANSI_ROWS,
  FINGER_INFO,
  resolveKeyGuidance,
  emulateQwertyCharFromCode,
} from './data/keyboard.js';
import { CURRICULUM_MODULES, ALL_LESSONS } from './data/curriculum.js';
import { soundEngine } from './audio.js';
import { store } from './storage.js';
import { TypingEngine, buildPracticePrompt } from './engine.js';

class KeycraftApp {
  constructor() {
    this.activeView = 'studio';
    this.practiceMode = 'lesson'; // 'lesson' | 'adaptive' | 'words' | 'quotes' | 'code' | 'custom'
    this.lessonPromptIndex = 0;
    this.deadKeyPending = false;
    this.lastPressedCode = null;
    this.typingIdleTimer = null;

    this.keyElements = new Map();
    this.heatmapKeyElements = new Map();
    this.charSpans = [];

    this.cacheDom();
    this.engine = new TypingEngine({
      onUpdate: (timerOnly) => this.renderStageUpdate(timerOnly),
      onComplete: (metrics) => this.handleSessionComplete(metrics),
      onKeyResult: (res) => this.handleKeyResult(res),
    });

    this.initThemeAndPrefs();
    this.buildVisualKeyboard(this.dom.ansiKeyboard, this.keyElements, true);
    this.buildVisualKeyboard(this.dom.heatmapKeyboard, this.heatmapKeyElements, false);
    this.bindEvents();
    this.updateCurriculumBadge();
    this.loadCurrentModeSession();
  }

  cacheDom() {
    const $ = (id) => document.getElementById(id);
    this.dom = {
      navTabs: document.querySelectorAll('.nav-tab'),
      views: {
        studio: $('view-studio'),
        curriculum: $('view-curriculum'),
        analytics: $('view-analytics'),
        guide: $('view-guide'),
      },
      brandHomeLink: $('brand-home-link'),
      curriculumBadge: $('curriculum-progress-badge'),
      soundSelect: $('sound-profile-select'),
      themeBtn: $('theme-toggle-btn'),
      themeLabel: $('theme-toggle-label'),

      modeBtns: document.querySelectorAll('.mode-btn'),
      wordsCorpusGroup: $('words-corpus-group'),
      wordsCountGroup: $('words-count-group'),
      corpusBtns: document.querySelectorAll('[data-corpus]'),
      countBtns: document.querySelectorAll('[data-count]'),
      errModeBtns: document.querySelectorAll('[data-errmode]'),

      stageKicker: $('stage-kicker'),
      stageTitle: $('stage-title'),
      stageTip: $('stage-tip'),
      prevLessonBtn: $('prev-lesson-btn'),
      restartPromptBtn: $('restart-prompt-btn'),
      nextLessonBtn: $('next-lesson-btn'),

      liveWpm: $('live-wpm'),
      liveAccuracy: $('live-accuracy'),
      liveProgress: $('live-progress'),
      liveStreak: $('live-streak'),

      customPanel: $('custom-text-panel'),
      customInput: $('custom-text-input'),
      applyCustomBtn: $('apply-custom-text-btn'),

      resultBanner: $('session-result-banner'),
      resultHeading: $('result-heading'),
      resultFeedback: $('result-feedback'),
      resultStars: $('result-stars'),
      resWpm: $('res-wpm'),
      resAcc: $('res-acc'),
      resRaw: $('res-raw'),
      resTime: $('res-time'),
      resWeakSummary: $('res-weak-summary'),
      resDrillWeakBtn: $('res-drill-weak-btn'),
      resRetryBtn: $('res-retry-btn'),
      resNextBtn: $('res-next-btn'),

      stageWrap: $('typing-stage-wrap'),
      progressBar: $('stage-progress-bar'),
      calloutKey: $('callout-key'),
      calloutFinger: $('callout-finger'),
      deadkeyIndicator: $('deadkey-indicator'),
      promptViewport: $('prompt-viewport'),
      promptText: $('prompt-text'),
      capslockWarning: $('capslock-warning'),
      typingCapture: $('typing-capture'),

      layoutVariantSelect: $('layout-variant-select'),
      toggleZonesBtn: $('toggle-zones-btn'),
      toggleAzertyBtn: $('toggle-azerty-btn'),
      toggleBlindBtn: $('toggle-blind-btn'),
      toggleScancodeBtn: $('toggle-scancode-btn'),
      ansiKeyboard: $('ansi-keyboard'),
      handFingerShapes: document.querySelectorAll('[data-hand-finger]'),

      curriculumContainer: $('curriculum-modules-container'),
      curriculumStarsSummary: $('curriculum-stars-summary'),

      analyticsLaunchDrillBtn: $('analytics-launch-drill-btn'),
      resetStatsBtn: $('reset-stats-btn'),
      statBestWpm: $('stat-best-wpm'),
      statTotalChars: $('stat-total-chars'),
      statTotalTime: $('stat-total-time'),
      statMasteredKeys: $('stat-mastered-keys'),
      heatmapKeyboard: $('heatmap-keyboard'),
      heatmapHoverDetail: $('heatmap-hover-detail'),
      confusionList: $('confusion-list'),
      historyList: $('history-list'),

      guideStartIntlBtn: $('guide-start-intl-lesson-btn'),
    };
  }

  initThemeAndPrefs() {
    const { prefs } = store.state;
    this.applyTheme(prefs.theme);

    soundEngine.setProfile(prefs.soundProfile);
    this.dom.soundSelect.value = prefs.soundProfile;
    this.dom.layoutVariantSelect.value = prefs.layoutVariant;

    this.syncToggleBtn(this.dom.toggleZonesBtn, prefs.showZones);
    this.syncToggleBtn(this.dom.toggleAzertyBtn, prefs.showAzertyDiff);
    this.syncToggleBtn(this.dom.toggleBlindBtn, prefs.blindMode);
    this.syncToggleBtn(this.dom.toggleScancodeBtn, prefs.scanCodeEmulation);

    this.dom.ansiKeyboard.classList.toggle('show-zones', prefs.showZones);
    this.dom.ansiKeyboard.classList.toggle('show-azerty-diff', prefs.showAzertyDiff);
    this.dom.ansiKeyboard.classList.toggle('is-blind', prefs.blindMode);

    this.dom.errModeBtns.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.errmode === prefs.errorMode);
    });
    this.dom.corpusBtns.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.corpus === prefs.wordsCorpus);
    });
    this.dom.countBtns.forEach((btn) => {
      btn.classList.toggle('is-active', Number(btn.dataset.count) === prefs.wordsCount);
    });

    this.dom.liveStreak.textContent = String(store.state.totals.streakDays || 0);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.dom.themeLabel.textContent = theme === 'dark' ? 'Mode clair' : 'Mode sombre';
  }

  syncToggleBtn(btn, active) {
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  }

  buildVisualKeyboard(container, mapRef, interactiveHints) {
    container.innerHTML = '';
    for (const row of ANSI_ROWS) {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';

      for (const key of row) {
        const el = document.createElement('div');
        el.className = `keycap${key.mod ? ' is-mod' : ''}`;
        el.style.gridColumn = `span ${key.cols}`;
        el.dataset.code = key.code;
        el.dataset.finger = key.finger;

        if (key.mod || key.code === 'Space') {
          const labelSpan = document.createElement('span');
          labelSpan.className = 'key-mod-label';
          labelSpan.textContent = key.label || '';
          if (key.code === 'Space') {
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.fontSize = '0.72rem';
            el.style.color = 'var(--key-legend-muted)';
          }
          el.appendChild(labelSpan);
        } else {
          const isLetter = /^[a-z]$/i.test(key.normal);
          const topRow = document.createElement('div');
          topRow.className = 'key-top-row';

          const topLeft = document.createElement('span');
          topLeft.textContent = isLetter ? '' : key.shift || '';
          topRow.appendChild(topLeft);

          if (interactiveHints && key.azerty) {
            const azBadge = document.createElement('span');
            azBadge.className = 'key-azerty-diff';
            azBadge.textContent = `ex-${key.azerty}`;
            topRow.appendChild(azBadge);
          }

          const bottomRow = document.createElement('div');
          bottomRow.className = 'key-bottom-row';

          const mainLegend = document.createElement('span');
          mainLegend.textContent = isLetter ? key.normal.toUpperCase() : key.normal;
          bottomRow.appendChild(mainLegend);

          if (interactiveHints && key.altGr) {
            const altSpan = document.createElement('span');
            altSpan.className = 'key-altgr';
            altSpan.textContent = key.altGr;
            bottomRow.appendChild(altSpan);
          }

          el.appendChild(topRow);
          el.appendChild(bottomRow);

          if (key.homing) {
            const bar = document.createElement('span');
            bar.className = 'key-homing-bar';
            el.appendChild(bar);
          }
        }

        if (!interactiveHints && key.normal && key.code !== 'Space') {
          el.style.cursor = 'pointer';
          el.addEventListener('mouseenter', () => this.inspectHeatmapKey(key));
        }

        rowEl.appendChild(el);
        mapRef.set(key.code, el);
      }

      container.appendChild(rowEl);
    }
  }

  bindEvents() {
    // Primary Navigation
    this.dom.navTabs.forEach((tab) => {
      tab.addEventListener('click', () => this.switchView(tab.dataset.view));
    });
    this.dom.brandHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchView('studio');
    });

    // Header Controls
    this.dom.themeBtn.addEventListener('click', () => {
      const next = store.state.prefs.theme === 'dark' ? 'light' : 'dark';
      store.updatePref('theme', next);
      this.applyTheme(next);
    });

    this.dom.soundSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      store.updatePref('soundProfile', val);
      soundEngine.setProfile(val);
      soundEngine.playKey(false);
      this.focusCapture();
    });

    // Studio Mode Selection
    this.dom.modeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setPracticeMode(btn.dataset.mode);
      });
    });

    this.dom.corpusBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const corpus = btn.dataset.corpus;
        store.updatePref('wordsCorpus', corpus);
        this.dom.corpusBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        if (corpus === 'french_accents' && store.state.prefs.layoutVariant !== 'us-intl') {
          store.updatePref('layoutVariant', 'us-intl');
          this.dom.layoutVariantSelect.value = 'us-intl';
        }
        this.loadCurrentModeSession();
      });
    });

    this.dom.countBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const count = Number(btn.dataset.count);
        store.updatePref('wordsCount', count);
        this.dom.countBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        this.loadCurrentModeSession();
      });
    });

    this.dom.errModeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        store.updatePref('errorMode', btn.dataset.errmode);
        this.dom.errModeBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        this.focusCapture();
      });
    });

    // Stage Navigation Buttons
    this.dom.prevLessonBtn.addEventListener('click', () => this.stepLesson(-1));
    this.dom.nextLessonBtn.addEventListener('click', () => this.advanceNext());
    this.dom.restartPromptBtn.addEventListener('click', () => this.restartSession());

    // Custom Text
    this.dom.applyCustomBtn.addEventListener('click', () => {
      const custom = this.dom.customInput.value.trim();
      if (custom) {
        this.startPrompt(custom, {
          kicker: 'Texte personnalisé',
          title: 'Entraînement sur mesure',
          tip: 'Concentrez-vous sur la fluidité et le retour systématique sur F et J.',
          isCode: custom.includes('\n') || /[{};()=>]/.test(custom),
        });
      }
    });

    // Result Banner Actions
    this.dom.resRetryBtn.addEventListener('click', () => this.restartSession());
    this.dom.resNextBtn.addEventListener('click', () => this.advanceNext());
    this.dom.resDrillWeakBtn.addEventListener('click', () => {
      this.setPracticeMode('adaptive');
    });

    // Keyboard Deck Controls
    this.dom.layoutVariantSelect.addEventListener('change', (e) => {
      store.updatePref('layoutVariant', e.target.value);
      this.updateKeyboardGuidance();
      this.focusCapture();
    });

    this.dom.toggleZonesBtn.addEventListener('click', () => {
      const next = !store.state.prefs.showZones;
      store.updatePref('showZones', next);
      this.syncToggleBtn(this.dom.toggleZonesBtn, next);
      this.dom.ansiKeyboard.classList.toggle('show-zones', next);
      this.focusCapture();
    });

    this.dom.toggleAzertyBtn.addEventListener('click', () => {
      const next = !store.state.prefs.showAzertyDiff;
      store.updatePref('showAzertyDiff', next);
      this.syncToggleBtn(this.dom.toggleAzertyBtn, next);
      this.dom.ansiKeyboard.classList.toggle('show-azerty-diff', next);
      this.focusCapture();
    });

    this.dom.toggleBlindBtn.addEventListener('click', () => {
      const next = !store.state.prefs.blindMode;
      store.updatePref('blindMode', next);
      this.syncToggleBtn(this.dom.toggleBlindBtn, next);
      this.dom.ansiKeyboard.classList.toggle('is-blind', next);
      this.focusCapture();
    });

    this.dom.toggleScancodeBtn.addEventListener('click', () => {
      const next = !store.state.prefs.scanCodeEmulation;
      store.updatePref('scanCodeEmulation', next);
      this.syncToggleBtn(this.dom.toggleScancodeBtn, next);
      this.focusCapture();
    });

    // Analytics & Guide Actions
    this.dom.analyticsLaunchDrillBtn.addEventListener('click', () => {
      this.switchView('studio');
      this.setPracticeMode('adaptive');
    });

    this.dom.resetStatsBtn.addEventListener('click', () => {
      if (window.confirm('Effacer toutes vos statistiques et étoiles enregistrées ?')) {
        store.resetStats();
        this.updateCurriculumBadge();
        this.renderAnalyticsView();
      }
    });

    this.dom.guideStartIntlBtn.addEventListener('click', () => {
      store.updatePref('layoutVariant', 'us-intl');
      this.dom.layoutVariantSelect.value = 'us-intl';
      store.updatePref('currentLessonId', 'l24');
      this.lessonPromptIndex = 0;
      this.switchView('studio');
      this.setPracticeMode('lesson');
    });

    // Stage Focus Management
    this.dom.stageWrap.addEventListener('click', () => this.focusCapture());
    this.dom.typingCapture.addEventListener('focus', () => {
      this.dom.stageWrap.classList.add('is-focused');
    });
    this.dom.typingCapture.addEventListener('blur', () => {
      this.dom.stageWrap.classList.remove('is-focused');
    });

    // Dead-key / IME Composition Input Handler
    this.dom.typingCapture.addEventListener('input', () => {
      if (this.activeView !== 'studio') {
        this.dom.typingCapture.value = '';
        return;
      }
      const val = this.dom.typingCapture.value;
      if (val) {
        this.dom.typingCapture.value = '';
        this.setDeadKeyState(false);
        for (const ch of val) {
          this.feedCharacter(ch, this.lastPressedCode);
        }
      }
    });

    // Global Keyboard Listeners
    window.addEventListener('keydown', (e) => this.onGlobalKeyDown(e));
    window.addEventListener('keyup', (e) => this.onGlobalKeyUp(e));
    window.addEventListener('blur', () => this.clearPressedKeys());
  }

  switchView(viewName) {
    this.activeView = viewName;
    this.dom.navTabs.forEach((tab) => {
      tab.setAttribute('aria-selected', tab.dataset.view === viewName ? 'true' : 'false');
    });
    Object.entries(this.dom.views).forEach(([key, panel]) => {
      panel.classList.toggle('is-active', key === viewName);
    });

    if (viewName === 'curriculum') {
      this.renderCurriculumView();
    } else if (viewName === 'analytics') {
      this.renderAnalyticsView();
    } else if (viewName === 'studio') {
      this.focusCapture();
    }
  }

  setPracticeMode(mode) {
    this.practiceMode = mode;
    this.dom.modeBtns.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.mode === mode);
    });

    const isWords = mode === 'words';
    this.dom.wordsCorpusGroup.hidden = !isWords;
    this.dom.wordsCountGroup.hidden = !isWords;
    this.dom.customPanel.hidden = mode !== 'custom';

    this.loadCurrentModeSession();
  }

  getCurrentLesson() {
    const id = store.state.prefs.currentLessonId;
    return ALL_LESSONS.find((l) => l.id === id) || ALL_LESSONS[0];
  }

  loadCurrentModeSession() {
    this.dom.resultBanner.hidden = true;

    if (this.practiceMode === 'lesson') {
      const lesson = this.getCurrentLesson();
      const idx = ALL_LESSONS.indexOf(lesson);
      this.dom.prevLessonBtn.hidden = false;
      this.dom.prevLessonBtn.disabled = idx <= 0;

      if (lesson.requiresIntl && store.state.prefs.layoutVariant !== 'us-intl') {
        store.updatePref('layoutVariant', 'us-intl');
        this.dom.layoutVariantSelect.value = 'us-intl';
      }

      const promptStr = lesson.prompts[this.lessonPromptIndex % lesson.prompts.length];
      this.startPrompt(promptStr, {
        kicker: `Module ${lesson.moduleNumber} · Leçon ${lesson.number}/24 (Partie ${(this.lessonPromptIndex % lesson.prompts.length) + 1}/${lesson.prompts.length})`,
        title: `${lesson.title} — [${lesson.keysLabel}]`,
        tip: lesson.tip,
        lessonId: lesson.id,
        targetWpm: lesson.targetWpm,
        isCode: false,
      });
      return;
    }

    this.dom.prevLessonBtn.hidden = true;

    if (this.practiceMode === 'custom') {
      const existing = this.dom.customInput.value.trim();
      const sample =
        existing || 'const learnQwerty = true;\n// Remplacez ce texte ci-dessus pour vous exercer !';
      this.startPrompt(sample, {
        kicker: 'Texte libre',
        title: 'Votre texte personnalisé',
        tip: 'Collez n’importe quel paragraphe ou code dans le bloc ci-dessus.',
        isCode: sample.includes('\n'),
      });
      return;
    }

    const generated = buildPracticePrompt({
      mode: this.practiceMode,
      corpus: store.state.prefs.wordsCorpus,
      wordCount: store.state.prefs.wordsCount,
      weakKeys: store.getWeakestKeys(5),
    });

    this.startPrompt(generated.text, {
      kicker: generated.kicker,
      title: generated.title,
      tip: generated.tip,
      isCode: generated.isCode,
    });
  }

  startPrompt(text, meta) {
    this.dom.resultBanner.hidden = true;
    this.dom.stageKicker.textContent = meta.kicker || 'Entraînement';
    this.dom.stageTitle.textContent = meta.title || 'Série QWERTY';
    this.dom.stageTip.textContent = meta.tip || '';
    this.dom.promptText.classList.toggle('is-code', Boolean(meta.isCode));
    this.dom.promptText.style.transform = 'translateY(0px)';
    this.setDeadKeyState(false);

    this.engine.load(text, meta);
    this.buildPromptSpans(this.engine.text);
    this.renderStageUpdate(false);
    if (this.activeView === 'studio' && this.practiceMode !== 'custom') {
      this.focusCapture();
    }
  }

  buildPromptSpans(text) {
    const frag = document.createDocumentFragment();
    this.charSpans = [];

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const span = document.createElement('span');
      span.className = 'ch';
      if (ch === ' ') {
        span.classList.add('is-space');
        span.textContent = ' ';
      } else if (ch === '\n') {
        const nl = document.createElement('span');
        nl.className = 'ch-newline';
        nl.textContent = '↵';
        span.appendChild(nl);
        span.appendChild(document.createTextNode('\n'));
      } else {
        span.textContent = ch;
      }
      frag.appendChild(span);
      this.charSpans.push(span);
    }

    this.dom.promptText.innerHTML = '';
    this.dom.promptText.appendChild(frag);
  }

  restartSession() {
    this.dom.resultBanner.hidden = true;
    this.startPrompt(this.engine.text, this.engine.meta);
  }

  stepLesson(delta) {
    const current = this.getCurrentLesson();
    const idx = ALL_LESSONS.indexOf(current);
    const nextIdx = Math.max(0, Math.min(ALL_LESSONS.length - 1, idx + delta));
    store.updatePref('currentLessonId', ALL_LESSONS[nextIdx].id);
    this.lessonPromptIndex = 0;
    this.loadCurrentModeSession();
  }

  advanceNext() {
    if (this.practiceMode === 'lesson') {
      const lesson = this.getCurrentLesson();
      if (this.lessonPromptIndex + 1 < lesson.prompts.length) {
        this.lessonPromptIndex += 1;
        this.loadCurrentModeSession();
      } else {
        const idx = ALL_LESSONS.indexOf(lesson);
        if (idx + 1 < ALL_LESSONS.length) {
          store.updatePref('currentLessonId', ALL_LESSONS[idx + 1].id);
        }
        this.lessonPromptIndex = 0;
        this.loadCurrentModeSession();
      }
    } else {
      this.loadCurrentModeSession();
    }
  }

  focusCapture() {
    if (this.activeView !== 'studio') return;
    this.dom.typingCapture.focus({ preventScroll: true });
  }

  setDeadKeyState(pending) {
    this.deadKeyPending = pending;
    this.dom.deadkeyIndicator.hidden = !pending;
    this.updateKeyboardGuidance();
  }

  onGlobalKeyDown(e) {
    if (this.activeView !== 'studio') return;

    // Allow normal typing inside custom textarea or select dropdowns
    const activeTag = document.activeElement?.tagName;
    if (activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;

    if (e.getModifierState) {
      this.dom.capslockWarning.hidden = !e.getModifierState('CapsLock');
    }

    // Physical key press animation
    this.lastPressedCode = e.code;
    const keyEl = this.keyElements.get(e.code);
    if (keyEl) keyEl.classList.add('is-pressed');

    // Quick restart shortcut (Tab)
    if (e.key === 'Tab') {
      e.preventDefault();
      this.restartSession();
      return;
    }

    // Post-session completion shortcuts
    if (this.engine.isFinished) {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.advanceNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.restartSession();
      }
      return;
    }

    // Ignore pure modifier presses or browser shortcuts
    if (['Shift', 'Control', 'Alt', 'AltGraph', 'Meta', 'CapsLock'].includes(e.key)) {
      return;
    }
    if (e.ctrlKey || e.metaKey) return;

    // Ensure hidden capture has focus for dead-key composition
    if (document.activeElement !== this.dom.typingCapture) {
      this.focusCapture();
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      this.setDeadKeyState(false);
      this.dom.typingCapture.value = '';
      soundEngine.playKey(false);
      this.engine.handleBackspace(store.state.prefs.errorMode);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      this.setDeadKeyState(false);
      this.feedCharacter('\n', e.code);
      return;
    }

    // Hardware QWERTY Scan-Code Emulation Mode (for users whose OS is still in AZERTY)
    if (store.state.prefs.scanCodeEmulation) {
      const emulated = emulateQwertyCharFromCode(e.code, e.shiftKey);
      if (emulated) {
        e.preventDefault();
        this.dom.typingCapture.value = '';
        this.feedCharacter(emulated, e.code);
      }
      return;
    }

    // OS Dead Key (US-International ', `, ^, ", ~)
    if (e.key === 'Dead' || e.isComposing) {
      soundEngine.playKey(false);
      this.setDeadKeyState(true);
      return;
    }

    // Direct printable character
    if (e.key.length === 1) {
      e.preventDefault();
      this.dom.typingCapture.value = '';
      this.setDeadKeyState(false);
      this.feedCharacter(e.key, e.code);
    }
  }

  onGlobalKeyUp(e) {
    const keyEl = this.keyElements.get(e.code);
    if (keyEl) keyEl.classList.remove('is-pressed');
  }

  clearPressedKeys() {
    for (const el of this.keyElements.values()) {
      el.classList.remove('is-pressed', 'is-wrong-press');
    }
  }

  feedCharacter(char, physicalCode) {
    this.dom.stageWrap.classList.add('is-typing');
    window.clearTimeout(this.typingIdleTimer);
    this.typingIdleTimer = window.setTimeout(() => {
      this.dom.stageWrap.classList.remove('is-typing');
    }, 550);

    this.lastPhysicalCodeForResult = physicalCode;
    this.engine.handleChar(char, store.state.prefs.errorMode);
  }

  handleKeyResult({ expected, typed, isCorrect, latencyMs }) {
    store.recordKeystroke(expected, typed, isCorrect, latencyMs);

    if (isCorrect) {
      soundEngine.playKey(typed === ' ');
    } else {
      soundEngine.playError();
      const pressedEl = this.keyElements.get(this.lastPhysicalCodeForResult);
      if (pressedEl) {
        pressedEl.classList.add('is-wrong-press');
        window.setTimeout(() => pressedEl.classList.remove('is-wrong-press'), 240);
      }
    }
  }

  renderStageUpdate(timerOnly = false) {
    const metrics = this.engine.getMetrics();
    this.dom.liveWpm.textContent = String(metrics.wpm);
    this.dom.liveAccuracy.textContent = String(metrics.accuracy);
    this.dom.liveProgress.textContent = String(metrics.progress);
    this.dom.progressBar.style.width = `${metrics.progress}%`;

    if (timerOnly) return;

    // Sync prompt character spans
    const { states, cursor, blockedOnCurrent } = this.engine;
    for (let i = 0; i < this.charSpans.length; i++) {
      const span = this.charSpans[i];
      const st = states[i];
      span.classList.toggle('is-correct', st === 'correct');
      span.classList.toggle('is-corrected', st === 'corrected');
      span.classList.toggle('is-wrong', st === 'wrong');
      span.classList.toggle('is-current', i === cursor && !this.engine.isFinished);
      span.classList.toggle('is-blocked', i === cursor && blockedOnCurrent);
    }

    // Keep active line centered smoothly inside viewport
    const activeSpan = this.charSpans[cursor];
    if (activeSpan) {
      const top = activeSpan.offsetTop;
      const lineHeight = parseFloat(getComputedStyle(this.dom.promptText).lineHeight) || 44;
      const scrollY = top > lineHeight * 1.15 ? top - lineHeight : 0;
      this.dom.promptText.style.transform = `translateY(-${scrollY}px)`;
    }

    this.updateKeyboardGuidance();
  }

  updateKeyboardGuidance() {
    for (const el of this.keyElements.values()) {
      el.classList.remove('is-target', 'is-target-step2');
    }
    this.dom.handFingerShapes.forEach((f) => f.classList.remove('is-active'));

    const targetChar = this.engine.currentTargetChar;
    if (!targetChar) {
      this.dom.calloutKey.textContent = '✓';
      this.dom.calloutFinger.textContent = 'Terminé';
      return;
    }

    const guidance = resolveKeyGuidance(
      targetChar,
      store.state.prefs.layoutVariant,
      this.deadKeyPending
    );

    if (!guidance) {
      this.dom.calloutKey.textContent = targetChar;
      this.dom.calloutFinger.textContent = 'Touche spéciale';
      return;
    }

    const primaryEl = this.keyElements.get(guidance.primaryCode);
    if (primaryEl) primaryEl.classList.add('is-target');

    if (guidance.modifierCode) {
      const modEl = this.keyElements.get(guidance.modifierCode);
      if (modEl) modEl.classList.add('is-target');
    }

    if (guidance.step2Code) {
      const step2El = this.keyElements.get(guidance.step2Code);
      if (step2El) step2El.classList.add('is-target-step2');
    }

    this.dom.calloutKey.textContent = guidance.displayKey;
    this.dom.calloutFinger.textContent = guidance.coaching;

    this.dom.handFingerShapes.forEach((shape) => {
      const id = shape.dataset.handFinger;
      if (id === guidance.fingerId || id === guidance.modifierFingerId) {
        shape.classList.add('is-active');
      }
    });
  }

  handleSessionComplete(metrics) {
    soundEngine.playComplete();

    const stars = store.recordSession({
      mode: this.practiceMode,
      label: this.engine.meta.title || 'Session',
      lessonId: this.engine.meta.lessonId || null,
      targetWpm: this.engine.meta.targetWpm || 25,
      wpm: metrics.wpm,
      accuracy: metrics.accuracy,
      durationMs: metrics.elapsedMs,
      charsTyped: metrics.charsTyped,
    });

    this.dom.liveStreak.textContent = String(store.state.totals.streakDays || 1);
    this.updateCurriculumBadge();

    this.dom.resWpm.textContent = `${metrics.wpm} MPM`;
    this.dom.resAcc.textContent = `${metrics.accuracy} %`;
    this.dom.resRaw.textContent = `${metrics.rawWpm} MPM`;
    this.dom.resTime.textContent = `${(metrics.elapsedMs / 1000).toFixed(1)} s`;

    if (this.engine.meta.lessonId) {
      this.dom.resultStars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
      this.dom.resultHeading.textContent =
        stars === 3
          ? 'Maîtrise parfaite !'
          : stars === 2
            ? 'Leçon validée avec succès !'
            : 'Bon début — consolidez la précision';
    } else {
      this.dom.resultStars.textContent = '';
      this.dom.resultHeading.textContent = 'Série complétée !';
    }

    if (metrics.accuracy >= 98) {
      this.dom.resultFeedback.textContent =
        'Précision chirurgicale : votre mémoire musculaire QWERTY s’ancre durablement.';
    } else if (metrics.accuracy >= 93) {
      this.dom.resultFeedback.textContent =
        'Très bon équilibre vitesse/précision. Gardez les épaules relâchées.';
    } else {
      this.dom.resultFeedback.textContent =
        'Ralentissez légèrement la cadence pour viser 96 %+ de frappes justes du premier coup.';
    }

    if (metrics.sessionWeakList.length > 0) {
      const listStr = metrics.sessionWeakList
        .map((w) => `« ${w.ch.toUpperCase()} » (${w.count}×)`)
        .join(', ');
      this.dom.resWeakSummary.textContent = `Touches à surveiller sur cet essai : ${listStr}`;
      this.dom.resDrillWeakBtn.hidden = false;
    } else {
      this.dom.resWeakSummary.textContent = 'Zéro faute sur les caractères clés — bravo !';
      this.dom.resDrillWeakBtn.hidden = true;
    }

    this.dom.resultBanner.hidden = false;
  }

  updateCurriculumBadge() {
    const completed = ALL_LESSONS.filter(
      (l) => (store.state.lessons[l.id]?.stars || 0) >= 1
    ).length;
    this.dom.curriculumBadge.textContent = `${completed}/24`;
  }

  renderCurriculumView() {
    const totalStars = ALL_LESSONS.reduce(
      (sum, l) => sum + (store.state.lessons[l.id]?.stars || 0),
      0
    );
    this.dom.curriculumStarsSummary.textContent = `${totalStars} / 72 ★ obtenues`;

    const currentId = store.state.prefs.currentLessonId;
    this.dom.curriculumContainer.innerHTML = '';

    for (const mod of CURRICULUM_MODULES) {
      const block = document.createElement('div');
      block.className = 'module-block';

      const header = document.createElement('div');
      header.className = 'module-title-row';
      header.innerHTML = `
        <h3>Module ${mod.number} · ${mod.title}</h3>
        <span class="module-desc">${mod.description}</span>
      `;
      block.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'lessons-grid';

      for (const lesson of mod.lessons) {
        const stat = store.state.lessons[lesson.id];
        const stars = stat?.stars || 0;
        const starsStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `lesson-card${lesson.id === currentId ? ' is-current' : ''}`;
        btn.id = `curriculum-card-${lesson.id}`;
        btn.innerHTML = `
          <div>
            <div class="lesson-card-top">
              <span class="lesson-num">LEÇON ${String(lesson.number).padStart(2, '0')}</span>
              <span class="lesson-stars">${starsStr}</span>
            </div>
            <h4>${lesson.title}</h4>
            <span class="lesson-keys-preview">${lesson.keysLabel}</span>
          </div>
          <div class="lesson-card-top" style="margin-top:0.25rem;">
            <span class="lesson-tip" style="margin:0;">Objectif : ${lesson.targetWpm} MPM</span>
            <span class="lesson-best">${stat ? `Record : ${stat.bestWpm} MPM · ${stat.bestAccuracy}%` : 'À découvrir →'}</span>
          </div>
        `;

        btn.addEventListener('click', () => {
          store.updatePref('currentLessonId', lesson.id);
          this.lessonPromptIndex = 0;
          this.switchView('studio');
          this.setPracticeMode('lesson');
        });

        grid.appendChild(btn);
      }

      block.appendChild(grid);
      this.dom.curriculumContainer.appendChild(block);
    }
  }

  renderAnalyticsView() {
    const { totals, keyStats, sessions } = store.state;
    this.dom.statBestWpm.textContent = `${totals.bestWpm} MPM`;
    this.dom.statTotalChars.textContent = totals.charsTyped.toLocaleString('fr-FR');
    this.dom.statTotalTime.textContent = `${Math.max(0, Math.round(totals.timeMs / 60000))} min`;

    let masteredCount = 0;
    for (const row of ANSI_ROWS) {
      for (const key of row) {
        const el = this.heatmapKeyElements.get(key.code);
        if (!el || !key.normal || key.code === 'Space') continue;

        const stat = keyStats[key.normal.toLowerCase()];
        delete el.dataset.heat;

        if (stat && stat.hits + stat.errors >= 4) {
          const acc = (stat.hits / (stat.hits + stat.errors)) * 100;
          if (acc >= 96) {
            el.dataset.heat = 'mastered';
            masteredCount += 1;
          } else if (acc >= 88) {
            el.dataset.heat = 'steady';
          } else {
            el.dataset.heat = 'weak';
          }
        }
      }
    }
    this.dom.statMasteredKeys.textContent = String(masteredCount);

    // Confusions list
    const confusions = store.getTopConfusions(6);
    this.dom.confusionList.innerHTML = '';
    if (confusions.length === 0) {
      this.dom.confusionList.innerHTML =
        '<li class="lesson-tip">Aucune confusion récurrente enregistrée pour le moment. Lancez quelques séries !</li>';
    } else {
      for (const c of confusions) {
        const li = document.createElement('li');
        li.className = 'confusion-item';
        li.innerHTML = `
          <span>Attendu <strong class="combo-code">${this.escapeHtml(c.expected)}</strong> → Tapé <strong class="combo-code">${this.escapeHtml(c.typed)}</strong></span>
          <span class="nav-badge">${c.count}×</span>
        `;
        this.dom.confusionList.appendChild(li);
      }
    }

    // Recent sessions
    this.dom.historyList.innerHTML = '';
    if (sessions.length === 0) {
      this.dom.historyList.innerHTML =
        '<li class="lesson-tip">Vos prochaines sessions complétées apparaîtront ici.</li>';
    } else {
      sessions.slice(0, 6).forEach((s) => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
          <span><strong>${this.escapeHtml(s.label)}</strong></span>
          <span style="font-family:var(--font-mono); font-size:0.78rem;">${s.wpm} MPM · ${s.accuracy}%</span>
        `;
        this.dom.historyList.appendChild(li);
      });
    }
  }

  inspectHeatmapKey(key) {
    const stat = store.state.keyStats[key.normal.toLowerCase()];
    const label = key.normal.toUpperCase();
    if (!stat || stat.hits + stat.errors === 0) {
      this.dom.heatmapHoverDetail.textContent = `Touche [ ${label} ] · Pas encore assez de frappes enregistrées.`;
      return;
    }
    const total = stat.hits + stat.errors;
    const acc = Math.round((stat.hits / total) * 100);
    const avgMs = stat.samples > 0 ? `${Math.round(stat.totalMs / stat.samples)} ms` : '—';
    this.dom.heatmapHoverDetail.textContent = `Touche [ ${label} ] · Précision : ${acc} % (${stat.hits} justes, ${stat.errors} fautes) · Temps de réaction moyen : ${avgMs}`;
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new KeycraftApp();
});
