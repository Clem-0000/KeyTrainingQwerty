/**
 * Keycraft QWERTY V2 — Main Gamified Application Controller
 */

import {
  ANSI_ROWS,
  resolveKeyGuidance,
  emulateQwertyCharFromCode,
  detectAzertyOsMismatch,
} from './data/keyboard.js';
import {
  WORLDS,
  ALL_STAGES,
  PLACEMENT_TEST_PROMPT,
  WORD_CORPORA,
} from './data/curriculum.js';
import {
  BADGES,
  computeStars,
  getRankInfo,
  ConfettiSystem,
} from './data/gamification.js';
import { soundEngine } from './audio.js';
import { store } from './storage.js';
import { TypingEngine, buildPracticePrompt } from './engine.js';
import { HandsOverlay } from './hands.js';
import { ArcadeController } from './arcade.js';

const ARCADE_PACKS = {
  home: {
    pool: ['sad', 'ask', 'all', 'dad', 'lad', 'fall', 'salad', 'glad', 'half', 'dash', 'hall;'],
    race: 'ask a glad lad; half a salad falls; dash fast all day;',
    botWpm: 22,
  },
  azerty: {
    pool: ['quatre', 'qualite', 'wagon', 'zero', 'zone', 'meme', 'moment', 'musique', "c'est", 'aqua', 'wizard'],
    race: "quatre wagons dans la zone calme; c'est le meme moment simple et moderne.",
    botWpm: 28,
  },
  english: {
    pool: WORD_CORPORA.english.slice(0, 45),
    race: 'the quick brown fox jumps over the lazy dog while steady fingers build effortless speed.',
    botWpm: 36,
  },
  code: {
    pool: ['()=>{}', '[i]', '{ok:1}', 'a===b', 'x!==0', '`id`', '&&', '||', 'fn(x)', 'arr[0]', 'null;'],
    race: 'const calc = (a, b) => { return a === b ? [1, 2] : { ok: false }; };',
    botWpm: 28,
  },
};

class KeycraftV2App {
  constructor() {
    this.activeNav = 'map'; // 'map' | 'arena' | 'practice' | 'arcade' | 'profile'
    this.arenaPhase = 'idle'; // 'discovery' | 'typing' | 'arcade' | 'celebration'
    this.currentContext = null; // { kind: 'stage'|'placement'|'practice', stage?, practiceOpts? }

    this.discoveryQueue = [];
    this.discoveryIdx = 0;
    this.deadKeyPending = false;
    this.lastPressedCode = null;
    this.azertyBannerDismissed = false;

    this.hubArcadeGame = 'astro'; // 'astro' | 'sprint'

    this.keyElements = new Map();
    this.heatmapKeyElements = new Map();
    this.charSpans = [];

    this.cacheDom();
    this.confetti = new ConfettiSystem(this.dom.confettiCanvas);

    this.engine = new TypingEngine({
      onUpdate: (timerOnly) => this.renderTypingUpdate(timerOnly),
      onComplete: (metrics) => this.onTypingComplete(metrics),
      onKeyResult: (res) => this.onKeyResult(res),
      onComboMilestone: (combo, tier) => {
        soundEngine.playCombo(tier);
      },
    });

    this.buildKeyboard(this.dom.ansiKeyboard, this.keyElements, true);
    this.buildKeyboard(this.dom.heatmapKeyboard, this.heatmapKeyElements, false);

    this.handsOverlay = new HandsOverlay(
      this.dom.handsSvg,
      this.dom.kbStageInner,
      this.keyElements
    );

    this.arenaArcade = new ArcadeController(this.dom.arenaArcadeCanvas, {
      onHudUpdate: (hud) => this.updateArenaArcadeHud(hud),
      onFinish: (res) => this.onArenaArcadeFinish(res),
    });

    this.hubArcade = new ArcadeController(this.dom.hubArcadeCanvas, {
      onHudUpdate: (hud) => this.updateHubArcadeHud(hud),
      onFinish: (res) => this.onHubArcadeFinish(res),
    });

    this.initPrefs();
    this.bindEvents();
    this.refreshHeaderHud();
    this.renderMapView();
  }

  cacheDom() {
    const $ = (id) => document.getElementById(id);
    this.dom = {
      confettiCanvas: $('confetti-canvas'),
      toastStack: $('toast-stack'),

      brandLogoLink: $('brand-logo-link'),
      navBtns: document.querySelectorAll('[data-nav]'),
      views: {
        map: $('view-map'),
        arena: $('view-arena'),
        practice: $('view-practice'),
        arcade: $('view-arcade'),
        profile: $('view-profile'),
      },

      hudRankBtn: $('hud-rank-btn'),
      hudRankIcon: $('hud-rank-icon'),
      hudLevelTxt: $('hud-level-txt'),
      hudXpFill: $('hud-xp-fill'),
      hudStarsTxt: $('hud-stars-txt'),
      hudStreakTxt: $('hud-streak-txt'),
      soundSelect: $('sound-select'),
      themeBtn: $('theme-btn'),
      themeBtnIcon: $('theme-btn-icon'),

      // Map View
      heroEyebrow: $('hero-eyebrow'),
      heroStageTitle: $('hero-stage-title'),
      heroStageDesc: $('hero-stage-desc'),
      heroPlayBtn: $('hero-play-btn'),
      placementTestBtn: $('placement-test-btn'),
      dailyMinTxt: $('daily-min-txt'),
      dailyBarFill: $('daily-bar-fill'),
      worldsContainer: $('worlds-container'),

      // Arena View
      arenaBackBtn: $('arena-back-btn'),
      arenaHeading: $('arena-heading'),
      arenaSub: $('arena-sub'),
      arenaStarMeter: $('arena-star-meter'),
      arenaComboPill: $('arena-combo-pill'),
      arenaWpm: $('arena-wpm'),
      arenaAcc: $('arena-acc'),
      arenaTimerBox: $('arena-timer-box'),
      arenaTimer: $('arena-timer'),
      arenaRestartBtn: $('arena-restart-btn'),

      azertyBanner: $('azerty-mismatch-banner'),
      enableScancodeNowBtn: $('enable-scancode-now-btn'),
      dismissAzertyBtn: $('dismiss-azerty-banner-btn'),

      // Celebration Card
      celebCard: $('celebration-card'),
      celebStarsRow: $('celeb-stars-row'),
      celebTitle: $('celeb-title'),
      celebSub: $('celeb-sub'),
      celebXpVal: $('celeb-xp-val'),
      celebRankProgress: $('celeb-rank-progress'),
      celebWpm: $('celeb-wpm'),
      celebAcc: $('celeb-acc'),
      celebCombo: $('celeb-combo'),
      celebTime: $('celeb-time'),
      celebSparklineBox: $('celeb-sparkline-box'),
      celebWeakKeysTxt: $('celeb-weak-keys-txt'),
      celebSparklineWrap: $('celeb-sparkline-svg-wrap'),
      celebDrillWeakBtn: $('celeb-drill-weak-btn'),
      celebRetryBtn: $('celeb-retry-btn'),
      celebNextBtn: $('celeb-next-btn'),

      // Discovery Card
      discoveryCard: $('discovery-card'),
      discStepPill: $('disc-step-pill'),
      discGiantKey: $('disc-giant-key'),
      discTitle: $('disc-title'),
      discExplain: $('disc-explain'),
      discDots: $('disc-dots'),
      skipDiscoveryBtn: $('skip-discovery-btn'),

      // Typing Card
      typingCard: $('typing-card'),
      typingProgressFill: $('typing-progress-fill'),
      coachKeyCap: $('coach-key-cap'),
      coachFingerTxt: $('coach-finger-txt'),
      deadkeyPill: $('deadkey-pill'),
      capsAlertPill: $('caps-alert-pill'),
      tcStream: $('tc-stream'),
      hiddenInput: $('hidden-typing-input'),

      // Embedded Arena Arcade
      arenaArcadeShell: $('arena-arcade-shell'),
      arenaArcScore: $('arena-arc-score'),
      arenaArcShields: $('arena-arc-shields'),
      arenaArcadeCanvas: $('arena-arcade-canvas'),

      // Keyboard Studio
      keyboardStudio: $('keyboard-studio'),
      layoutSelect: $('layout-select'),
      btnErrMode: $('btn-err-mode'),
      btnToggleHands: $('btn-toggle-hands'),
      btnToggleZones: $('btn-toggle-zones'),
      btnToggleAzerty: $('btn-toggle-azerty'),
      btnToggleBlind: $('btn-toggle-blind'),
      btnToggleScancode: $('btn-toggle-scancode'),
      kbStageInner: $('kb-stage-inner'),
      ansiKeyboard: $('ansi-keyboard'),
      handsSvg: $('hands-overlay-svg'),

      // Practice View
      pracAdaptiveBtn: $('prac-adaptive-btn'),
      pracCorpusSelect: $('prac-corpus-select'),
      pracDurationSelect: $('prac-duration-select'),
      pracSprintBtn: $('prac-sprint-btn'),
      pracCodeBtn: $('prac-code-btn'),
      pracQuotesBtn: $('prac-quotes-btn'),
      pracCustomToggleBtn: $('prac-custom-toggle-btn'),
      pracCustomDrawer: $('prac-custom-drawer'),
      pracCustomTextarea: $('prac-custom-textarea'),
      pracCustomStartBtn: $('prac-custom-start-btn'),

      // Arcade Hub View
      selectAstroCard: $('select-astro-card'),
      selectSprintCard: $('select-sprint-card'),
      arcadePackSelect: $('arcade-pack-select'),
      arcadeStartBtn: $('arcade-start-btn'),
      hubArcScore: $('hub-arc-score'),
      hubArcShields: $('hub-arc-shields'),
      hubArcWpm: $('hub-arc-wpm'),
      hubArcCombo: $('hub-arc-combo'),
      hubArcadeCanvas: $('hub-arcade-canvas'),

      // Profile View
      profRankIcon: $('prof-rank-icon'),
      profLevelKicker: $('prof-level-kicker'),
      profRankTitle: $('prof-rank-title'),
      profXpDetail: $('prof-xp-detail'),
      profXpBar: $('prof-xp-bar'),
      profBestWpm: $('prof-best-wpm'),
      profTotalChars: $('prof-total-chars'),
      profTotalTime: $('prof-total-time'),
      resetProgressBtn: $('reset-progress-btn'),
      unlockedBadgesCount: $('unlocked-badges-count'),
      badgesGrid: $('badges-grid'),
      heatmapDetailTxt: $('heatmap-detail-txt'),
      heatmapDrillBtn: $('heatmap-drill-btn'),
      heatmapKeyboard: $('heatmap-keyboard'),
      confusionsContainer: $('confusions-container'),
    };
  }

  initPrefs() {
    const { prefs } = store.state;
    this.applyTheme(prefs.theme);

    soundEngine.setProfile(prefs.soundProfile);
    this.dom.soundSelect.value = prefs.soundProfile;
    this.dom.layoutSelect.value = prefs.layoutVariant;

    this.syncKeyboardToggles();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.dom.themeBtnIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  syncKeyboardToggles() {
    const { prefs } = store.state;
    const isStop = prefs.errorMode === 'stop';
    this.dom.btnErrMode.setAttribute('aria-pressed', isStop ? 'true' : 'false');
    this.dom.btnErrMode.textContent = isStop ? 'Mode : Stop erreur' : 'Mode : Fluide';

    this.dom.btnToggleHands.setAttribute('aria-pressed', prefs.showHands ? 'true' : 'false');
    this.dom.btnToggleZones.setAttribute('aria-pressed', prefs.showZones ? 'true' : 'false');
    this.dom.btnToggleAzerty.setAttribute('aria-pressed', prefs.showAzertyDiff ? 'true' : 'false');
    this.dom.btnToggleBlind.setAttribute('aria-pressed', prefs.blindMode ? 'true' : 'false');
    this.dom.btnToggleScancode.setAttribute(
      'aria-pressed',
      prefs.scanCodeEmulation ? 'true' : 'false'
    );

    this.dom.ansiKeyboard.classList.toggle('show-zones', prefs.showZones);
    this.dom.ansiKeyboard.classList.toggle('show-azerty', prefs.showAzertyDiff);
    this.dom.ansiKeyboard.classList.toggle('is-blind', prefs.blindMode);
    this.handsOverlay.setEnabled(prefs.showHands);
  }

  buildKeyboard(container, mapRef, interactive) {
    container.innerHTML = '';
    for (const row of ANSI_ROWS) {
      const rowEl = document.createElement('div');
      rowEl.className = 'ansi-row';

      for (const key of row) {
        const el = document.createElement('div');
        el.className = `kcap${key.mod ? ' is-mod' : ''}`;
        el.style.gridColumn = `span ${key.cols}`;
        el.dataset.code = key.code;
        el.dataset.finger = key.finger;

        if (key.mod || key.code === 'Space') {
          const span = document.createElement('span');
          span.className = 'kcap-mod-txt';
          span.textContent = key.label || '';
          if (key.code === 'Space') {
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.fontSize = '0.7rem';
            el.style.color = 'var(--key-muted)';
          }
          el.appendChild(span);
        } else {
          const isAlpha = /^[a-z]$/i.test(key.normal);
          const top = document.createElement('div');
          top.className = 'kcap-top';

          const sTop = document.createElement('span');
          sTop.textContent = isAlpha ? '' : key.shift || '';
          top.appendChild(sTop);

          if (interactive && key.azerty) {
            const az = document.createElement('span');
            az.className = 'kcap-az';
            az.textContent = `ex-${key.azerty}`;
            top.appendChild(az);
          }

          const bot = document.createElement('div');
          bot.className = 'kcap-bot';
          const sMain = document.createElement('span');
          sMain.textContent = isAlpha ? key.normal.toUpperCase() : key.normal;
          bot.appendChild(sMain);

          if (interactive && key.altGr) {
            const alt = document.createElement('span');
            alt.style.fontSize = '0.6rem';
            alt.style.color = 'var(--cobalt)';
            alt.textContent = key.altGr;
            bot.appendChild(alt);
          }

          el.appendChild(top);
          el.appendChild(bot);

          if (key.homing) {
            const bump = document.createElement('span');
            bump.className = 'kcap-bump';
            el.appendChild(bump);
          }
        }

        if (!interactive && key.normal && key.code !== 'Space') {
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
    // Top Navigation
    this.dom.navBtns.forEach((btn) => {
      btn.addEventListener('click', () => this.navigateTo(btn.dataset.nav));
    });
    this.dom.brandLogoLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.navigateTo('map');
    });
    this.dom.hudRankBtn.addEventListener('click', () => this.navigateTo('profile'));

    // Sound & Theme
    this.dom.soundSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      store.updatePref('soundProfile', val);
      soundEngine.setProfile(val);
      soundEngine.playKey(false);
    });

    this.dom.themeBtn.addEventListener('click', () => {
      const next = store.state.prefs.theme === 'dark' ? 'light' : 'dark';
      store.updatePref('theme', next);
      this.applyTheme(next);
    });

    // Map Hero Buttons
    this.dom.heroPlayBtn.addEventListener('click', () => {
      const rec = store.getRecommendedStage(ALL_STAGES);
      this.launchStage(rec);
    });

    this.dom.placementTestBtn.addEventListener('click', () => {
      this.launchPlacementTest();
    });

    // Arena Controls
    this.dom.arenaBackBtn.addEventListener('click', () => {
      if (this.currentContext?.kind === 'practice') {
        this.navigateTo('practice');
      } else {
        this.navigateTo('map');
      }
    });

    this.dom.arenaRestartBtn.addEventListener('click', () => this.restartCurrentArena());
    this.dom.skipDiscoveryBtn.addEventListener('click', () => this.beginStageTypingPhase());

    // Smart AZERTY Banner
    this.dom.enableScancodeNowBtn.addEventListener('click', () => {
      store.updatePref('scanCodeEmulation', true);
      this.syncKeyboardToggles();
      this.dom.azertyBanner.hidden = true;
      this.showToast('⌨️', 'Mode QWERTY activé', 'Vos touches physiques produisent désormais un vrai QWERTY US !');
      this.focusHiddenInput();
    });
    this.dom.dismissAzertyBtn.addEventListener('click', () => {
      this.azertyBannerDismissed = true;
      this.dom.azertyBanner.hidden = true;
      this.focusHiddenInput();
    });

    // Celebration Actions
    this.dom.celebRetryBtn.addEventListener('click', () => this.restartCurrentArena());
    this.dom.celebNextBtn.addEventListener('click', () => this.advanceAfterCelebration());
    this.dom.celebDrillWeakBtn.addEventListener('click', () => {
      this.launchFreePractice({ mode: 'adaptive' });
    });

    // Keyboard Deck Controls
    this.dom.layoutSelect.addEventListener('change', (e) => {
      store.updatePref('layoutVariant', e.target.value);
      this.refreshActiveKeyGuidance();
      this.focusHiddenInput();
    });

    this.dom.btnErrMode.addEventListener('click', () => {
      const next = store.state.prefs.errorMode === 'stop' ? 'fluid' : 'stop';
      store.updatePref('errorMode', next);
      this.syncKeyboardToggles();
      this.focusHiddenInput();
    });

    this.dom.btnToggleHands.addEventListener('click', () => {
      store.updatePref('showHands', !store.state.prefs.showHands);
      this.syncKeyboardToggles();
      this.focusHiddenInput();
    });

    this.dom.btnToggleZones.addEventListener('click', () => {
      store.updatePref('showZones', !store.state.prefs.showZones);
      this.syncKeyboardToggles();
      this.focusHiddenInput();
    });

    this.dom.btnToggleAzerty.addEventListener('click', () => {
      store.updatePref('showAzertyDiff', !store.state.prefs.showAzertyDiff);
      this.syncKeyboardToggles();
      this.focusHiddenInput();
    });

    this.dom.btnToggleBlind.addEventListener('click', () => {
      store.updatePref('blindMode', !store.state.prefs.blindMode);
      this.syncKeyboardToggles();
      this.focusHiddenInput();
    });

    this.dom.btnToggleScancode.addEventListener('click', () => {
      store.updatePref('scanCodeEmulation', !store.state.prefs.scanCodeEmulation);
      this.syncKeyboardToggles();
      this.focusHiddenInput();
    });

    // Free Practice Cards
    this.dom.pracAdaptiveBtn.addEventListener('click', () => {
      this.launchFreePractice({ mode: 'adaptive' });
    });
    this.dom.pracSprintBtn.addEventListener('click', () => {
      const corpus = this.dom.pracCorpusSelect.value;
      const durationSec = Number(this.dom.pracDurationSelect.value);
      if (corpus === 'french_accents') {
        store.updatePref('layoutVariant', 'us-intl');
        this.dom.layoutSelect.value = 'us-intl';
      }
      this.launchFreePractice({ mode: 'words', corpus, durationSec });
    });
    this.dom.pracCodeBtn.addEventListener('click', () => {
      this.launchFreePractice({ mode: 'code' });
    });
    this.dom.pracQuotesBtn.addEventListener('click', () => {
      this.launchFreePractice({ mode: 'quotes' });
    });
    this.dom.pracCustomToggleBtn.addEventListener('click', () => {
      this.dom.pracCustomDrawer.hidden = !this.dom.pracCustomDrawer.hidden;
    });
    this.dom.pracCustomStartBtn.addEventListener('click', () => {
      const txt = this.dom.pracCustomTextarea.value.trim();
      if (txt) {
        this.launchFreePractice({ mode: 'custom', customText: txt });
      }
    });

    // Arcade Hub Controls
    this.dom.selectAstroCard.addEventListener('click', () => {
      this.hubArcadeGame = 'astro';
      this.dom.selectAstroCard.classList.add('is-selected');
      this.dom.selectSprintCard.classList.remove('is-selected');
      this.startHubArcadeGame();
    });
    this.dom.selectSprintCard.addEventListener('click', () => {
      this.hubArcadeGame = 'sprint';
      this.dom.selectSprintCard.classList.add('is-selected');
      this.dom.selectAstroCard.classList.remove('is-selected');
      this.startHubArcadeGame();
    });
    this.dom.arcadePackSelect.addEventListener('change', () => this.startHubArcadeGame());
    this.dom.arcadeStartBtn.addEventListener('click', () => this.startHubArcadeGame());

    // Profile Controls
    this.dom.heatmapDrillBtn.addEventListener('click', () => {
      this.launchFreePractice({ mode: 'adaptive' });
    });
    this.dom.resetProgressBtn.addEventListener('click', () => {
      if (window.confirm('Réinitialiser toute votre progression, vos étoiles et vos trophées ?')) {
        store.resetAll();
        this.refreshHeaderHud();
        this.renderProfileView();
        this.renderMapView();
      }
    });

    // Typing Focus & Dead-Key Input Capture
    this.dom.typingCard.addEventListener('click', () => this.focusHiddenInput());
    this.dom.hiddenInput.addEventListener('focus', () => {
      this.dom.typingCard.classList.add('is-focused');
    });
    this.dom.hiddenInput.addEventListener('blur', () => {
      this.dom.typingCard.classList.remove('is-focused');
    });

    this.dom.hiddenInput.addEventListener('input', () => {
      const val = this.dom.hiddenInput.value;
      this.dom.hiddenInput.value = '';
      if (!val) return;
      this.setDeadKey(false);
      for (const ch of val) {
        this.routeTypedCharacter(ch, this.lastPressedCode);
      }
    });

    window.addEventListener('keydown', (e) => this.onGlobalKeyDown(e));
    window.addEventListener('keyup', (e) => this.onGlobalKeyUp(e));
    window.addEventListener('blur', () => this.clearKeyPressVisuals());
  }

  /* ========================================================================
     NAVIGATION & VIEW RENDERERS
     ======================================================================== */

  navigateTo(view) {
    this.engine.stopTimer();
    this.arenaArcade.stop();
    this.hubArcade.stop();

    this.activeNav = view;
    this.dom.navBtns.forEach((btn) => {
      const match = btn.dataset.nav === view || (view === 'arena' && btn.dataset.nav === 'map');
      btn.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    Object.entries(this.dom.views).forEach(([k, el]) => {
      el.classList.toggle('is-active', k === view);
    });

    this.refreshHeaderHud();

    if (view === 'map') {
      this.renderMapView();
    } else if (view === 'arcade') {
      requestAnimationFrame(() => this.startHubArcadeGame());
    } else if (view === 'profile') {
      this.renderProfileView();
    }
  }

  refreshHeaderHud() {
    const rank = getRankInfo(store.state.xp);
    this.dom.hudRankIcon.textContent = rank.icon;
    this.dom.hudLevelTxt.textContent = `Niv. ${rank.level}`;
    this.dom.hudXpFill.style.width = `${rank.pct}%`;

    const totalStars = store.getTotalStars();
    this.dom.hudStarsTxt.textContent = `${totalStars} / ${ALL_STAGES.length * 5}`;
    this.dom.hudStreakTxt.textContent = `${store.state.totals.streakDays || 0} j`;
  }

  renderMapView() {
    const rec = store.getRecommendedStage(ALL_STAGES);
    this.dom.heroEyebrow.textContent = `MONDE ${rec.worldNumber} · ÉTAPE ${rec.step}/36`;
    this.dom.heroStageTitle.textContent = `${rec.icon} Étape ${rec.step} · ${rec.title}`;
    this.dom.heroStageDesc.textContent = rec.tip;
    this.dom.heroPlayBtn.textContent =
      store.getTotalStars() === 0
        ? `▶ Commencer l’aventure (Étape 1)`
        : `▶ Continuer · Étape ${rec.step}`;

    const mins = Math.min(5, Math.floor((store.state.daily.timeMs || 0) / 60000));
    const pct = Math.min(100, Math.round(((store.state.daily.timeMs || 0) / 300000) * 100));
    this.dom.dailyMinTxt.textContent = `${mins} / 5 min`;
    this.dom.dailyBarFill.style.width = `${pct}%`;

    this.dom.worldsContainer.innerHTML = '';

    for (const world of WORLDS) {
      const worldStars = world.stages.reduce(
        (acc, s) => acc + (store.state.stages[s.id]?.stars || 0),
        0
      );
      const maxWorldStars = world.stages.length * 5;

      const sec = document.createElement('section');
      sec.className = 'world-section';
      sec.innerHTML = `
        <div class="world-header">
          <div class="world-badge-row">
            <div class="world-num-pill">M${world.number}</div>
            <div>
              <h3 class="world-title">Monde ${world.number} · ${world.title}</h3>
              <p class="world-sub">${world.subtitle}</p>
            </div>
          </div>
          <div class="world-stars-box">★ ${worldStars} / ${maxWorldStars}</div>
        </div>
      `;

      const trail = document.createElement('div');
      trail.className = 'stages-trail';

      for (const stage of world.stages) {
        const recStat = store.state.stages[stage.id];
        const stars = recStat?.stars || 0;
        const isRecommended = stage.id === rec.id;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = `stage-node-${stage.id}`;
        btn.className = [
          'stage-node',
          stars >= 3 ? 'is-completed' : '',
          stars === 5 ? 'is-perfect' : '',
          isRecommended ? 'is-recommended' : '',
        ]
          .filter(Boolean)
          .join(' ');

        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
          starsHtml += `<span class="${i <= stars ? 'on' : ''}">★</span>`;
        }

        btn.innerHTML = `
          <div>
            <div class="node-top">
              <span class="node-icon-badge">${stage.icon}</span>
              <span class="node-step-num">ÉTAPE ${String(stage.step).padStart(2, '0')}</span>
            </div>
            <h4 class="node-title">${stage.title}</h4>
            <span class="node-keys">${stage.keysLabel}</span>
          </div>
          <div class="node-stars-row">
            <span class="five-stars" aria-label="${stars} sur 5 étoiles">${starsHtml}</span>
            <span class="node-wpm-tag">${recStat ? `${recStat.bestWpm} MPM` : 'Jouer →'}</span>
          </div>
        `;

        btn.addEventListener('click', () => this.launchStage(stage));
        trail.appendChild(btn);
      }

      sec.appendChild(trail);
      this.dom.worldsContainer.appendChild(sec);
    }
  }

  /* ========================================================================
     STAGE ARENA FLOW (Discovery -> Typing / Embedded Arcade -> Celebration)
     ======================================================================== */

  launchStage(stage) {
    store.updatePref('currentStageId', stage.id);
    this.currentContext = { kind: 'stage', stage };

    if (stage.requiresIntl && store.state.prefs.layoutVariant !== 'us-intl') {
      store.updatePref('layoutVariant', 'us-intl');
      this.dom.layoutSelect.value = 'us-intl';
    }
    if (stage.recommendBlind && !store.state.prefs.blindMode) {
      store.updatePref('blindMode', true);
      this.syncKeyboardToggles();
    }

    this.navigateTo('arena');
    this.dom.arenaHeading.textContent = `${stage.icon} Étape ${stage.step} · ${stage.title}`;
    this.dom.arenaSub.textContent = stage.tip;
    this.dom.celebCard.hidden = true;

    if (stage.type === 'arcade') {
      this.beginStageArcadePhase(stage);
    } else if (stage.introKeys && stage.introKeys.length > 0) {
      this.beginStageDiscoveryPhase(stage);
    } else {
      this.beginStageTypingPhase();
    }
  }

  launchPlacementTest() {
    this.currentContext = { kind: 'placement' };
    this.navigateTo('arena');
    this.dom.arenaHeading.textContent = '🎯 Test de niveau express (30 secondes)';
    this.dom.arenaSub.textContent =
      'Tapez naturellement : les premiers mondes correspondant à votre niveau seront validés automatiquement !';
    this.dom.celebCard.hidden = true;
    this.dom.discoveryCard.hidden = true;
    this.dom.arenaArcadeShell.hidden = true;
    this.dom.typingCard.hidden = false;
    this.dom.keyboardStudio.hidden = false;

    this.arenaPhase = 'typing';
    this.startTypingEngine(PLACEMENT_TEST_PROMPT, {
      targetWpm: 30,
      durationLimitMs: 30000,
      isCode: false,
    });
  }

  launchFreePractice(practiceOpts) {
    this.currentContext = { kind: 'practice', practiceOpts };
    this.navigateTo('arena');
    this.dom.celebCard.hidden = true;
    this.dom.discoveryCard.hidden = true;
    this.dom.arenaArcadeShell.hidden = true;
    this.dom.typingCard.hidden = false;
    this.dom.keyboardStudio.hidden = false;

    let promptData;
    if (practiceOpts.mode === 'custom') {
      const txt = practiceOpts.customText || 'asdf jkl;';
      promptData = {
        text: txt,
        title: 'Texte personnalisé',
        sub: 'Concentrez-vous sur la précision et le retour sur F et J',
        targetWpm: 28,
        isCode: txt.includes('\n') || /[{};()=>]/.test(txt),
        durationLimitMs: 0,
      };
    } else {
      promptData = buildPracticePrompt({
        mode: practiceOpts.mode,
        corpus: practiceOpts.corpus || 'english',
        durationSec: practiceOpts.durationSec || 0,
        weakKeys: store.getWeakestKeys(5),
      });
    }

    this.dom.arenaHeading.textContent = promptData.title;
    this.dom.arenaSub.textContent = promptData.sub;
    this.arenaPhase = 'typing';
    this.startTypingEngine(promptData.text, {
      targetWpm: promptData.targetWpm,
      durationLimitMs: promptData.durationLimitMs,
      isCode: promptData.isCode,
    });
  }

  restartCurrentArena() {
    if (!this.currentContext) return;
    if (this.currentContext.kind === 'stage') {
      // On replay, go straight to typing/arcade without repeating key intro
      const st = this.currentContext.stage;
      this.dom.celebCard.hidden = true;
      if (st.type === 'arcade') {
        this.beginStageArcadePhase(st);
      } else {
        this.beginStageTypingPhase();
      }
    } else if (this.currentContext.kind === 'placement') {
      this.launchPlacementTest();
    } else if (this.currentContext.kind === 'practice') {
      this.launchFreePractice(this.currentContext.practiceOpts);
    }
  }

  beginStageDiscoveryPhase(stage) {
    this.arenaPhase = 'discovery';
    this.discoveryQueue = stage.introKeys;
    this.discoveryIdx = 0;

    this.dom.celebCard.hidden = true;
    this.dom.typingCard.hidden = true;
    this.dom.arenaArcadeShell.hidden = true;
    this.dom.discoveryCard.hidden = false;
    this.dom.keyboardStudio.hidden = false;
    this.dom.arenaTimerBox.hidden = true;

    this.renderDiscoveryStep();
    requestAnimationFrame(() => this.refreshActiveKeyGuidance());
  }

  renderDiscoveryStep() {
    const item = this.discoveryQueue[this.discoveryIdx];
    if (!item) {
      this.beginStageTypingPhase();
      return;
    }

    this.dom.discStepPill.textContent = `Nouvelle touche · ${this.discoveryIdx + 1}/${this.discoveryQueue.length}`;
    this.dom.discGiantKey.textContent = item.char.toUpperCase();
    this.dom.discGiantKey.classList.remove('is-hit');
    this.dom.discTitle.textContent = item.title;
    this.dom.discExplain.textContent = `${item.explain} — Appuyez sur « ${item.char.toUpperCase()} » pour continuer !`;

    this.dom.discDots.innerHTML = this.discoveryQueue
      .map(
        (_, i) =>
          `<span class="disc-dot ${i < this.discoveryIdx ? 'is-done' : i === this.discoveryIdx ? 'is-active' : ''}"></span>`
      )
      .join('');

    this.refreshActiveKeyGuidance();
  }

  handleDiscoveryChar(ch) {
    const item = this.discoveryQueue[this.discoveryIdx];
    if (!item) return;

    if (ch === item.char) {
      soundEngine.playDiscoveryHit();
      this.dom.discGiantKey.classList.add('is-hit');
      window.setTimeout(() => {
        this.discoveryIdx += 1;
        if (this.discoveryIdx >= this.discoveryQueue.length) {
          this.beginStageTypingPhase();
        } else {
          this.renderDiscoveryStep();
        }
      }, 250);
    } else {
      soundEngine.playError();
    }
  }

  beginStageTypingPhase() {
    const stage = this.currentContext?.stage;
    if (!stage) return;

    this.arenaPhase = 'typing';
    this.dom.celebCard.hidden = true;
    this.dom.discoveryCard.hidden = true;
    this.dom.arenaArcadeShell.hidden = true;
    this.dom.typingCard.hidden = false;
    this.dom.keyboardStudio.hidden = false;

    this.startTypingEngine(stage.text, {
      targetWpm: stage.targetWpm || 24,
      durationLimitMs: 0,
      isCode: Boolean(stage.isCode),
    });
  }

  beginStageArcadePhase(stage) {
    this.arenaPhase = 'arcade';
    this.dom.celebCard.hidden = true;
    this.dom.discoveryCard.hidden = true;
    this.dom.typingCard.hidden = true;
    this.dom.keyboardStudio.hidden = true;
    this.dom.arenaArcadeShell.hidden = false;
    this.dom.arenaTimerBox.hidden = true;

    requestAnimationFrame(() => {
      if (stage.game === 'astro') {
        this.arenaArcade.startAstro({
          pool: stage.pool,
          goalScore: stage.goalScore || 160,
        });
      } else {
        this.arenaArcade.startSprint({
          text: stage.text,
          botWpm: stage.botWpm || stage.targetWpm || 24,
        });
      }
    });
  }

  startTypingEngine(text, meta) {
    this.setDeadKey(false);
    this.dom.tcStream.classList.toggle('is-code', Boolean(meta.isCode));
    this.dom.tcStream.style.transform = 'translateY(0px)';
    this.dom.arenaTimerBox.hidden = !(meta.durationLimitMs > 0);

    this.engine.load(text, meta);
    this.buildPromptSpans(this.engine.text);
    this.renderTypingUpdate(false);
    requestAnimationFrame(() => {
      this.refreshActiveKeyGuidance();
      this.focusHiddenInput();
    });
  }

  buildPromptSpans(text) {
    const frag = document.createDocumentFragment();
    this.charSpans = [];

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const span = document.createElement('span');
      span.className = 'tc-ch';
      if (ch === ' ') {
        span.textContent = ' ';
      } else if (ch === '\n') {
        span.textContent = '↵\n';
      } else {
        span.textContent = ch;
      }
      frag.appendChild(span);
      this.charSpans.push(span);
    }

    this.dom.tcStream.innerHTML = '';
    this.dom.tcStream.appendChild(frag);
  }

  /* ========================================================================
     GLOBAL KEYBOARD & DEAD-KEY ROUTING
     ======================================================================== */

  focusHiddenInput() {
    if (this.activeNav === 'arena' && (this.arenaPhase === 'typing' || this.arenaPhase === 'discovery')) {
      this.dom.hiddenInput.focus({ preventScroll: true });
    }
  }

  setDeadKey(pending) {
    this.deadKeyPending = pending;
    this.dom.deadkeyPill.hidden = !pending;
    this.refreshActiveKeyGuidance();
  }

  onGlobalKeyDown(e) {
    // Allow native inputs when typing custom text or dropdowns
    const tag = document.activeElement?.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (this.activeNav !== 'arena' && this.activeNav !== 'arcade') return;

    if (e.getModifierState) {
      this.dom.capsAlertPill.hidden = !e.getModifierState('CapsLock');
    }

    this.lastPressedCode = e.code;
    const keyEl = this.keyElements.get(e.code);
    if (keyEl) keyEl.classList.add('is-down');

    // Tab = Instant Replay in Arena
    if (e.key === 'Tab' && this.activeNav === 'arena') {
      e.preventDefault();
      this.restartCurrentArena();
      return;
    }

    // Celebration screen keyboard shortcuts (Enter = Next Stage!)
    if (this.activeNav === 'arena' && this.arenaPhase === 'celebration') {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.advanceAfterCelebration();
      }
      return;
    }

    if (['Shift', 'Control', 'Alt', 'AltGraph', 'Meta', 'CapsLock'].includes(e.key)) {
      return;
    }
    if (e.ctrlKey || e.metaKey) return;

    // Backspace in Typing Phase
    if (e.key === 'Backspace') {
      if (this.activeNav === 'arena' && this.arenaPhase === 'typing') {
        e.preventDefault();
        this.setDeadKey(false);
        this.dom.hiddenInput.value = '';
        soundEngine.playKey(false);
        this.engine.handleBackspace(store.state.prefs.errorMode);
      }
      return;
    }

    // Enter in Typing Phase (multi-line code)
    if (e.key === 'Enter') {
      if (this.activeNav === 'arena' && this.arenaPhase === 'typing') {
        e.preventDefault();
        this.setDeadKey(false);
        this.routeTypedCharacter('\n', e.code);
      }
      return;
    }

    // Hardware QWERTY Scan-Code Emulation
    if (store.state.prefs.scanCodeEmulation) {
      const emulated = emulateQwertyCharFromCode(e.code, e.shiftKey);
      if (emulated) {
        e.preventDefault();
        this.dom.hiddenInput.value = '';
        this.routeTypedCharacter(emulated, e.code);
      }
      return;
    }

    // Smart AZERTY OS mismatch detection
    if (
      !this.azertyBannerDismissed &&
      this.activeNav === 'arena' &&
      detectAzertyOsMismatch(e.code, e.key)
    ) {
      this.dom.azertyBanner.hidden = false;
    }

    // US-International Dead-Key composition via hidden input
    if (e.key === 'Dead' || e.isComposing) {
      this.focusHiddenInput();
      soundEngine.playKey(false);
      this.setDeadKey(true);
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault();
      this.dom.hiddenInput.value = '';
      this.setDeadKey(false);
      this.routeTypedCharacter(e.key, e.code);
    }
  }

  onGlobalKeyUp(e) {
    const keyEl = this.keyElements.get(e.code);
    if (keyEl) keyEl.classList.remove('is-down');
  }

  clearKeyPressVisuals() {
    for (const el of this.keyElements.values()) {
      el.classList.remove('is-down', 'is-err-flash');
    }
  }

  routeTypedCharacter(ch, physicalCode) {
    this.lastPhysicalCodeForResult = physicalCode;

    if (this.activeNav === 'arcade') {
      this.hubArcade.handleChar(ch);
      return;
    }

    if (this.activeNav === 'arena') {
      if (this.arenaPhase === 'discovery') {
        this.handleDiscoveryChar(ch);
      } else if (this.arenaPhase === 'typing') {
        this.engine.handleChar(ch, store.state.prefs.errorMode);
      } else if (this.arenaPhase === 'arcade') {
        this.arenaArcade.handleChar(ch);
      }
    }
  }

  onKeyResult({ expected, typed, isCorrect, latencyMs }) {
    store.recordKeystroke(expected, typed, isCorrect, latencyMs);
    if (isCorrect) {
      soundEngine.playKey(typed === ' ');
    } else {
      soundEngine.playError();
      const el = this.keyElements.get(this.lastPhysicalCodeForResult);
      if (el) {
        el.classList.add('is-err-flash');
        window.setTimeout(() => el.classList.remove('is-err-flash'), 220);
      }
    }
  }

  /* ========================================================================
     LIVE TYPING RENDERING & HANDS GUIDANCE
     ======================================================================== */

  renderTypingUpdate(timerOnly = false) {
    const m = this.engine.getMetrics();
    this.dom.arenaWpm.textContent = String(m.wpm);
    this.dom.arenaAcc.textContent = `${m.accuracy}%`;
    this.dom.typingProgressFill.style.width = `${m.progress}%`;

    this.dom.arenaComboPill.textContent = `Combo ×${m.combo}`;
    this.dom.arenaComboPill.classList.toggle('is-hot', m.combo >= 15);

    if (m.remainingSec !== null) {
      this.dom.arenaTimer.textContent = `${m.remainingSec}s`;
    }

    // Live 5-star preview
    const targetWpm = this.engine.meta.targetWpm || 24;
    const liveStars = m.charsTyped < 4 ? 0 : computeStars(m.wpm, m.accuracy, targetWpm);
    const starSpans = this.dom.arenaStarMeter.querySelectorAll('span');
    starSpans.forEach((sp, i) => sp.classList.toggle('lit', i < liveStars));

    if (timerOnly) return;

    const { states, cursor, blockedOnCurrent } = this.engine;
    for (let i = 0; i < this.charSpans.length; i++) {
      const sp = this.charSpans[i];
      const st = states[i];
      sp.className = 'tc-ch';
      if (st === 'ok') sp.classList.add('is-ok');
      else if (st === 'fixed') sp.classList.add('is-fixed');
      else if (st === 'err') sp.classList.add('is-err');

      if (i === cursor && !this.engine.isFinished) {
        sp.classList.add('is-cur');
        if (blockedOnCurrent) sp.classList.add('is-shake');
      }
    }

    const curSpan = this.charSpans[cursor];
    if (curSpan) {
      const top = curSpan.offsetTop;
      const lh = parseFloat(getComputedStyle(this.dom.tcStream).lineHeight) || 48;
      const shiftY = top > lh * 1.15 ? top - lh : 0;
      this.dom.tcStream.style.transform = `translateY(-${shiftY}px)`;
    }

    this.refreshActiveKeyGuidance();
  }

  refreshActiveKeyGuidance() {
    for (const el of this.keyElements.values()) {
      el.classList.remove('is-target', 'is-step2');
    }

    let targetChar = null;
    if (this.arenaPhase === 'discovery') {
      targetChar = this.discoveryQueue[this.discoveryIdx]?.char || null;
    } else if (this.arenaPhase === 'typing') {
      targetChar = this.engine.currentTargetChar;
    }

    if (!targetChar) {
      this.handsOverlay.render(null);
      return;
    }

    const guidance = resolveKeyGuidance(
      targetChar,
      store.state.prefs.layoutVariant,
      this.deadKeyPending
    );

    if (!guidance) {
      this.dom.coachKeyCap.textContent = targetChar;
      this.dom.coachFingerTxt.textContent = 'Touche spéciale';
      this.handsOverlay.render(null);
      return;
    }

    const pEl = this.keyElements.get(guidance.primaryCode);
    if (pEl) pEl.classList.add('is-target');

    if (guidance.modifierCode) {
      const mEl = this.keyElements.get(guidance.modifierCode);
      if (mEl) mEl.classList.add('is-target');
    }

    if (guidance.step2Code) {
      const s2El = this.keyElements.get(guidance.step2Code);
      if (s2El) s2El.classList.add('is-step2');
    }

    this.dom.coachKeyCap.textContent = guidance.displayKey;
    this.dom.coachFingerTxt.textContent = guidance.coaching;
    this.handsOverlay.render(guidance);
  }

  /* ========================================================================
     CELEBRATION, 5-STAR REVEAL, CONFETTI & BADGE TOASTS
     ======================================================================== */

  onTypingComplete(metrics) {
    const targetWpm = this.engine.meta.targetWpm || 24;
    const stars = computeStars(metrics.wpm, metrics.accuracy, targetWpm);

    if (this.currentContext?.kind === 'placement') {
      const unlockedCount = store.applyPlacementResult(
        metrics.wpm,
        metrics.accuracy,
        ALL_STAGES
      );
      this.presentCelebration({
        metrics,
        stars,
        customTitle:
          unlockedCount > 0
            ? `Diagnostic terminé : ${unlockedCount} étapes validées d’office !`
            : 'Diagnostic terminé : prêt à démarrer au Monde 1 !',
        customSub: `Vitesse mesurée : ${metrics.wpm} MPM à ${metrics.accuracy} % de précision. Votre parcours s’est ajusté automatiquement !`,
        arcadeWin: false,
      });
      return;
    }

    this.presentCelebration({ metrics, stars, arcadeWin: false });
  }

  updateArenaArcadeHud(hud) {
    this.dom.arenaWpm.textContent = String(hud.wpm);
    this.dom.arenaAcc.textContent = `${hud.accuracy}%`;
    this.dom.arenaComboPill.textContent = `Combo ×${hud.combo}`;
    this.dom.arenaArcScore.textContent =
      hud.mode === 'astro'
        ? `Score : ${hud.score} / ${hud.goalScore}`
        : `Course NitroSprint en cours !`;
    this.dom.arenaArcShields.textContent =
      hud.mode === 'astro' ? '🛡️'.repeat(Math.max(0, hud.shields)) || '💥' : '🏁';
  }

  onArenaArcadeFinish(res) {
    this.presentCelebration({
      metrics: res,
      stars: res.stars,
      customTitle: res.won ? 'Mission Arcade accomplie !' : 'Boucliers épuisés — bel essai !',
      arcadeWin: res.won,
    });
  }

  presentCelebration({ metrics, stars, customTitle, customSub, arcadeWin }) {
    this.arenaPhase = 'celebration';

    this.dom.discoveryCard.hidden = true;
    this.dom.typingCard.hidden = true;
    this.dom.arenaArcadeShell.hidden = true;
    this.dom.keyboardStudio.hidden = true;
    this.dom.celebCard.hidden = false;

    const stage = this.currentContext?.kind === 'stage' ? this.currentContext.stage : null;
    const outcome = store.recordOutcome({
      label: stage ? `Étape ${stage.step} · ${stage.title}` : this.dom.arenaHeading.textContent,
      stageId: stage?.id || null,
      stars,
      wpm: metrics.wpm,
      accuracy: metrics.accuracy,
      durationMs: metrics.elapsedMs,
      charsTyped: metrics.charsTyped,
      maxCombo: metrics.maxCombo,
      isBoss: stage?.type === 'boss',
      blindMode: store.state.prefs.blindMode,
      arcadeWin,
    });

    this.refreshHeaderHud();

    // Sequential 5-Star Pop Animation
    const starEls = this.dom.celebStarsRow.querySelectorAll('.celeb-star');
    starEls.forEach((el) => el.classList.remove('is-earned'));
    for (let i = 0; i < stars; i++) {
      window.setTimeout(() => {
        starEls[i].classList.add('is-earned');
        soundEngine.playStar(i);
      }, 110 + i * 135);
    }

    if (stars >= 4 || outcome.leveledUp || stage?.type === 'boss') {
      window.setTimeout(() => {
        this.confetti.burst(stars === 5 ? 95 : 60);
      }, 280);
    }

    // Titles & Coaching
    if (customTitle) {
      this.dom.celebTitle.textContent = customTitle;
    } else if (stars === 5) {
      this.dom.celebTitle.textContent = '👑 Couronne 5 Étoiles — Maîtrise Parfaite !';
    } else if (stars === 4) {
      this.dom.celebTitle.textContent = 'Superbe performance (4 Étoiles) !';
    } else if (stars === 3) {
      this.dom.celebTitle.textContent = 'Étape validée avec brio !';
    } else {
      this.dom.celebTitle.textContent = 'Étape complétée — consolidez la précision !';
    }

    if (customSub) {
      this.dom.celebSub.textContent = customSub;
    } else if (metrics.accuracy >= 97) {
      this.dom.celebSub.textContent =
        'Précision exemplaire ! Vos doigts mémorisent la trajectoire exacte sans effort.';
    } else {
      this.dom.celebSub.textContent =
        'Ralentissez très légèrement pour viser 96 %+ de précision : la vitesse suivra naturellement.';
    }

    this.dom.celebXpVal.textContent = `+${outcome.xpReward.total} XP`;
    this.dom.celebRankProgress.textContent = `${outcome.newRank.icon} ${outcome.newRank.title} (${outcome.newRank.pct}%)`;

    this.dom.celebWpm.textContent = `${metrics.wpm} MPM`;
    this.dom.celebAcc.textContent = `${metrics.accuracy} %`;
    this.dom.celebCombo.textContent = `×${metrics.maxCombo}`;
    this.dom.celebTime.textContent = `${(metrics.elapsedMs / 1000).toFixed(1)} s`;

    this.renderSparkline(metrics.timeline || []);

    if (metrics.sessionWeakList && metrics.sessionWeakList.length > 0) {
      const list = metrics.sessionWeakList.map((w) => `« ${w.ch.toUpperCase()} »`).join(' · ');
      this.dom.celebWeakKeysTxt.textContent = `Hésitations : ${list}`;
      this.dom.celebDrillWeakBtn.hidden = false;
    } else {
      this.dom.celebWeakKeysTxt.textContent = 'Aucune touche hésitante détectée !';
      this.dom.celebDrillWeakBtn.hidden = true;
    }

    // Pop Level-up & Badge Toasts
    if (outcome.leveledUp) {
      soundEngine.playFanfare();
      this.showToast(
        outcome.newRank.icon,
        `Niveau ${outcome.newRank.level} atteint !`,
        `Nouveau rang : ${outcome.newRank.title}`
      );
    }
    outcome.newlyUnlockedBadges.forEach((b, idx) => {
      window.setTimeout(() => {
        soundEngine.playFanfare();
        this.showToast(b.icon, `Trophée débloqué : ${b.title}`, b.desc);
      }, 350 + idx * 450);
    });
  }

  renderSparkline(timeline) {
    if (!timeline || timeline.length < 2) {
      this.dom.celebSparklineWrap.innerHTML =
        '<div style="font-size:0.78rem; color:var(--ink-500); padding-top:14px;">Série courte — courbe disponible dès 2 secondes de frappe continue.</div>';
      return;
    }

    const w = 520;
    const h = 52;
    const maxWpm = Math.max(30, ...timeline.map((p) => p.wpm));
    const pts = timeline.map((p, idx) => {
      const x = (idx / (timeline.length - 1)) * (w - 16) + 8;
      const y = h - 8 - (p.wpm / maxWpm) * (h - 16);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    this.dom.celebSparklineWrap.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="52" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="var(--cobalt)"
          stroke-width="2.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          points="${pts.join(' ')}"
        />
      </svg>
    `;
  }

  advanceAfterCelebration() {
    if (this.currentContext?.kind === 'stage') {
      const idx = ALL_STAGES.findIndex((s) => s.id === this.currentContext.stage.id);
      if (idx >= 0 && idx + 1 < ALL_STAGES.length) {
        this.launchStage(ALL_STAGES[idx + 1]);
      } else {
        this.navigateTo('map');
      }
    } else if (this.currentContext?.kind === 'placement') {
      const rec = store.getRecommendedStage(ALL_STAGES);
      this.launchStage(rec);
    } else if (this.currentContext?.kind === 'practice') {
      this.launchFreePractice(this.currentContext.practiceOpts);
    } else {
      this.navigateTo('map');
    }
  }

  /* ========================================================================
     STANDALONE ARCADE HUB & PROFILE / TROPHIES / HEATMAP
     ======================================================================== */

  startHubArcadeGame() {
    const packKey = this.dom.arcadePackSelect.value;
    const pack = ARCADE_PACKS[packKey] || ARCADE_PACKS.azerty;

    if (this.hubArcadeGame === 'astro') {
      this.hubArcade.startAstro({ pool: pack.pool, goalScore: 220 });
    } else {
      this.hubArcade.startSprint({ text: pack.race, botWpm: pack.botWpm });
    }
  }

  updateHubArcadeHud(hud) {
    this.dom.hubArcScore.textContent =
      hud.mode === 'astro' ? `Score : ${hud.score} / ${hud.goalScore}` : 'Course Turbo';
    this.dom.hubArcShields.textContent =
      hud.mode === 'astro' ? '🛡️'.repeat(Math.max(0, hud.shields)) || '💥' : '🏎️';
    this.dom.hubArcWpm.textContent = `${hud.wpm} MPM`;
    this.dom.hubArcCombo.textContent = `Combo ×${hud.combo}`;
  }

  onHubArcadeFinish(res) {
    const outcome = store.recordOutcome({
      label: `Arcade · ${this.hubArcadeGame === 'astro' ? 'AstroType' : 'NitroSprint'}`,
      stars: res.stars,
      wpm: res.wpm,
      accuracy: res.accuracy,
      durationMs: res.elapsedMs,
      charsTyped: res.charsTyped,
      maxCombo: res.maxCombo,
      arcadeWin: res.won,
    });
    this.refreshHeaderHud();
    if (res.won) {
      this.confetti.burst(65);
      soundEngine.playFanfare();
    }
    this.showToast(
      res.won ? '🏆' : '🕹️',
      res.won ? `Victoire Arcade ! (+${outcome.xpReward.total} XP)` : `Partie terminée (+${outcome.xpReward.total} XP)`,
      `${res.wpm} MPM · Précision ${res.accuracy}% — Cliquez sur « Nouvelle Partie » pour rejouer !`
    );
  }

  renderProfileView() {
    const rank = getRankInfo(store.state.xp);
    const { totals, keyStats } = store.state;

    this.dom.profRankIcon.textContent = rank.icon;
    this.dom.profLevelKicker.textContent = `NIVEAU ${rank.level}`;
    this.dom.profRankTitle.textContent = rank.title;
    this.dom.profXpDetail.textContent = `${store.state.xp} XP cumulés · Prochain rang : ${rank.nextTitle} (${rank.pct}%)`;
    this.dom.profXpBar.style.width = `${rank.pct}%`;

    this.dom.profBestWpm.textContent = `${totals.bestWpm} MPM`;
    this.dom.profTotalChars.textContent = totals.charsTyped.toLocaleString('fr-FR');
    this.dom.profTotalTime.textContent = `${Math.max(0, Math.round(totals.timeMs / 60000))} min`;

    // Render 14 Trophies
    let unlockedCount = 0;
    this.dom.badgesGrid.innerHTML = '';
    for (const badge of BADGES) {
      const unlocked = Boolean(store.state.badges[badge.id]);
      if (unlocked) unlockedCount += 1;

      const tile = document.createElement('div');
      tile.className = `badge-tile${unlocked ? ' is-unlocked' : ''}`;
      tile.innerHTML = `
        <div class="badge-icon">${badge.icon}</div>
        <div>
          <h4>${badge.title}</h4>
          <p>${badge.desc}</p>
        </div>
      `;
      this.dom.badgesGrid.appendChild(tile);
    }
    this.dom.unlockedBadgesCount.textContent = `${unlockedCount}/${BADGES.length}`;

    // Render Heatmap
    for (const row of ANSI_ROWS) {
      for (const key of row) {
        const el = this.heatmapKeyElements.get(key.code);
        if (!el || !key.normal || key.code === 'Space') continue;
        delete el.dataset.heat;

        const st = keyStats[key.normal.toLowerCase()];
        if (st && st.hits + st.errors >= 4) {
          const acc = (st.hits / (st.hits + st.errors)) * 100;
          el.dataset.heat = acc >= 96 ? 'great' : acc >= 88 ? 'ok' : 'weak';
        }
      }
    }

    // Render Confusions
    const confs = store.getTopConfusions(6);
    if (confs.length === 0) {
      this.dom.confusionsContainer.innerHTML =
        '<p style="margin:0;">Aucune confusion récurrente détectée pour l’instant. Lancez quelques étapes du parcours !</p>';
    } else {
      this.dom.confusionsContainer.innerHTML = confs
        .map(
          (c) => `
          <div style="display:flex; justify-content:space-between; padding:0.45rem 0; border-bottom:1px solid var(--border);">
            <span>Attendu <kbd class="mini-cap">${this.escapeHtml(c.expected)}</kbd> → Tapé <kbd class="mini-cap">${this.escapeHtml(c.typed)}</kbd></span>
            <strong style="color:var(--primary);">${c.count}×</strong>
          </div>
        `
        )
        .join('');
    }
  }

  inspectHeatmapKey(key) {
    const st = store.state.keyStats[key.normal.toLowerCase()];
    const lbl = key.normal.toUpperCase();
    if (!st || st.hits + st.errors === 0) {
      this.dom.heatmapDetailTxt.textContent = `Touche [ ${lbl} ] · Pas encore de statistiques enregistrées.`;
      return;
    }
    const total = st.hits + st.errors;
    const acc = Math.round((st.hits / total) * 100);
    const ms = st.samples > 0 ? `${Math.round(st.totalMs / st.samples)} ms` : '—';
    this.dom.heatmapDetailTxt.textContent = `Touche [ ${lbl} ] · Précision : ${acc}% (${st.hits} justes, ${st.errors} fautes) · Réaction moyenne : ${ms}`;
  }

  showToast(icon, title, subtitle) {
    const el = document.createElement('div');
    el.className = 'achievement-toast';
    el.innerHTML = `
      <div style="font-size:1.6rem;">${icon}</div>
      <div>
        <div style="font-size:0.86rem; font-weight:800;">${this.escapeHtml(title)}</div>
        <div style="font-size:0.75rem; color:var(--ink-700);">${this.escapeHtml(subtitle)}</div>
      </div>
    `;
    this.dom.toastStack.appendChild(el);
    window.setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 250ms ease';
      window.setTimeout(() => el.remove(), 260);
    }, 4200);
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new KeycraftV2App();
});
