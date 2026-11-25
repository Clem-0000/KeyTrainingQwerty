/* ============================================================
   KeyTrain — logique applicative (vanilla JS, zéro dépendance)
   Fonctionne en file:// comme en http:// : aucun appel réseau.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- données ---------------- */
  var WORDS = { fr: globalThis.WORDS_FR || [], en: globalThis.WORDS_EN || [] };
  var PHRASES = { fr: globalThis.PHRASES_FR || [], en: globalThis.PHRASES_EN || [] };
  var LESSONS = globalThis.LESSONS || [];
  var BADGES = globalThis.BADGES || [];

  /* ---------------- utilitaires purs ---------------- */
  function rand(n) { return Math.floor(Math.random() * n); }

  // Retire les accents (compatibilité toutes dispositions de clavier)
  function normalize(s) {
    return s.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/Œ/g, 'Oe').replace(/Æ/g, 'Ae');
  }

  function pickN(arr, n) {
    var copy = arr.slice(), out = [];
    while (out.length < n && copy.length) out.push(copy.splice(rand(copy.length), 1)[0]);
    return out;
  }

  // Génère un exercice à partir d'un ensemble de caractères autorisé
  function genFromSet(set, len) {
    var out = '';
    while (out.length < len) {
      var g = 3 + rand(4);
      for (var i = 0; i < g; i++) out += set[rand(set.length)];
      out += ' ';
    }
    return out.trim();
  }

  function genKeys(level) {
    var sets = {
      home: 'asdfjkl;',
      top: 'asdfjkl;qwertyuiop',
      all: '1234567890qwertyuiopasdfghjkl;zxcvbnm,./'
    };
    return genFromSet(sets[level] || sets.home, 150);
  }

  function wordPool(lang, level) {
    // certaines entrées contiennent plusieurs mots ("look for") : on les aplati
    var words = (WORDS[lang] || WORDS.en)
      .map(function (w) { return normalize(w).toLowerCase(); })
      .join(' ').split(/\s+/).filter(Boolean);
    if (level === 'easy') return words.filter(function (w) { return w.length <= 5; });
    if (level === 'hard') return words.filter(function (w) { return w.length >= 7; });
    return words.filter(function (w) { return w.length >= 3 && w.length <= 9; });
  }

  function genWords(lang, level, count) {
    var pool = wordPool(lang, level);
    if (!pool.length) pool = wordPool(lang, 'normal');
    var out = [];
    for (var i = 0; i < (count || 60); i++) out.push(pool[rand(pool.length)]);
    return out.join(' ');
  }

  function genPhrases(lang, n) {
    return pickN(PHRASES[lang] || PHRASES.en, n || 10)
      .map(function (p) { return lang === 'fr' ? normalize(p) : p; })
      .join(' ');
  }

  function generateText(mode, opts) {
    opts = opts || {};
    if (mode === 'keys') return genKeys(opts.level || 'home');
    if (mode === 'phrases') return genPhrases(opts.lang || 'fr');
    if (mode === 'time') return genWords(opts.lang || 'fr', 'normal', 90);
    return genWords(opts.lang || 'fr', opts.level || 'easy', 60);
  }

  // Texte d'une leçon du cours
  function genLessonText(lesson, lang) {
    if (!lesson) return genWords(lang, 'easy', 60);
    if (lesson.type === 'keys') return genFromSet(lesson.set, 120);
    if (lesson.type === 'words') {
      var set = lesson.set;
      var pool = wordPool(lang, 'normal').filter(function (w) {
        return w.split('').every(function (c) { return set.indexOf(c) !== -1; });
      });
      if (pool.length < 8) return genFromSet(set, 150);
      var out = [];
      for (var i = 0; i < 40; i++) {
        var w = pool[rand(pool.length)];
        if (lesson.caps && Math.random() < 0.4) w = w[0].toUpperCase() + w.slice(1);
        out.push(w);
      }
      return out.join(' ');
    }
    if (lesson.type === 'phrases') return genPhrases(lang, 6);
    if (lesson.type === 'time') return genWords(lang, 'normal', 90);
    return genWords(lang, 'easy', 60);
  }

  /* ---------------- métriques ---------------- */
  function computeWpm(correctChars, seconds) {
    if (!seconds || seconds <= 0) return 0;
    return Math.round((correctChars / 5) / (seconds / 60));
  }
  function computeAcc(correct, keystrokes) {
    if (!keystrokes) return 100;
    return Math.round((correct / keystrokes) * 100);
  }
  function fmtTime(totalSec) {
    var s = Math.max(0, Math.round(totalSec));
    var m = Math.floor(s / 60);
    return m + ':' + String(s % 60).padStart(2, '0');
  }

  /* ---------------- gamification (pur) ---------------- */
  function starsFor(acc) { return acc >= 95 ? 3 : acc >= 85 ? 2 : acc >= 70 ? 1 : 0; }
  function playerLevel(xp) { return 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 100)); }
  function xpBounds(xp) {
    var L = playerLevel(xp);
    return [100 * (L - 1) * (L - 1), 100 * L * L, L];
  }
  function isUnlocked(stars, i) { return i === 0 || (stars[LESSONS[i - 1].id] || 0) >= 1; }
  function totalStars(stars) {
    var t = 0;
    Object.keys(stars).forEach(function (k) { t += stars[k]; });
    return t;
  }
  function dayStr(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function nextStreak(streak) {
    var today = dayStr();
    if (streak.last === today) return streak;
    var y = new Date(); y.setDate(y.getDate() - 1);
    var count = streak.last === dayStr(y) ? streak.count + 1 : 1;
    return { last: today, count: count };
  }

  /* ---------------- clavier QWERTY ---------------- */
  // f = doigt responsable : lp/lr/lm/li (gauche) ri/rm/rr/rp (droite) th (pouces)
  var KB_ROWS = [
    [
      { c: 'Backquote', l: '`', f: 'lp' }, { c: 'Digit1', l: '1', f: 'lp' }, { c: 'Digit2', l: '2', f: 'lr' },
      { c: 'Digit3', l: '3', f: 'lm' }, { c: 'Digit4', l: '4', f: 'li' }, { c: 'Digit5', l: '5', f: 'li' },
      { c: 'Digit6', l: '6', f: 'ri' }, { c: 'Digit7', l: '7', f: 'ri' }, { c: 'Digit8', l: '8', f: 'rm' },
      { c: 'Digit9', l: '9', f: 'rr' }, { c: 'Digit0', l: '0', f: 'rp' }, { c: 'Minus', l: '-', f: 'rp' },
      { c: 'Equal', l: '=', f: 'rp' }, { c: 'Backspace', l: '⌫', f: 'rp', w: 2 }
    ],
    [
      { c: 'Tab', l: 'Tab', f: 'lp', w: 1.5 }, { c: 'KeyQ', l: 'Q', f: 'lp' }, { c: 'KeyW', l: 'W', f: 'lr' },
      { c: 'KeyE', l: 'E', f: 'lm' }, { c: 'KeyR', l: 'R', f: 'li' }, { c: 'KeyT', l: 'T', f: 'li' },
      { c: 'KeyY', l: 'Y', f: 'ri' }, { c: 'KeyU', l: 'U', f: 'ri' }, { c: 'KeyI', l: 'I', f: 'rm' },
      { c: 'KeyO', l: 'O', f: 'rr' }, { c: 'KeyP', l: 'P', f: 'rp' }, { c: 'BracketLeft', l: '[', f: 'rp' },
      { c: 'BracketRight', l: ']', f: 'rp' }, { c: 'Backslash', l: '\\', f: 'rp', w: 1.5 }
    ],
    [
      { c: 'CapsLock', l: 'Caps', f: 'lp', w: 1.8 }, { c: 'KeyA', l: 'A', f: 'lp' }, { c: 'KeyS', l: 'S', f: 'lr' },
      { c: 'KeyD', l: 'D', f: 'lm' }, { c: 'KeyF', l: 'F', f: 'li', home: true }, { c: 'KeyG', l: 'G', f: 'li' },
      { c: 'KeyH', l: 'H', f: 'ri' }, { c: 'KeyJ', l: 'J', f: 'ri', home: true }, { c: 'KeyK', l: 'K', f: 'rm' },
      { c: 'KeyL', l: 'L', f: 'rr' }, { c: 'Semicolon', l: ';', f: 'rp' }, { c: 'Quote', l: "'", f: 'rp' },
      { c: 'Enter', l: '↵', f: 'rp', w: 2.2 }
    ],
    [
      { c: 'ShiftLeft', l: '⇧', f: 'lp', w: 2.3 }, { c: 'KeyZ', l: 'Z', f: 'lp' }, { c: 'KeyX', l: 'X', f: 'lr' },
      { c: 'KeyC', l: 'C', f: 'lm' }, { c: 'KeyV', l: 'V', f: 'li' }, { c: 'KeyB', l: 'B', f: 'li' },
      { c: 'KeyN', l: 'N', f: 'ri' }, { c: 'KeyM', l: 'M', f: 'ri' }, { c: 'Comma', l: ',', f: 'rm' },
      { c: 'Period', l: '.', f: 'rr' }, { c: 'Slash', l: '/', f: 'rp' }, { c: 'ShiftRight', l: '⇧', f: 'rp', w: 2.7 }
    ],
    [ { c: 'Space', l: 'espace', f: 'th', w: 10 } ]
  ];

  var FINGERS = [
    { id: 'lp', name: 'Auriculaire G', keys: '1 Q A Z' },
    { id: 'lr', name: 'Annulaire G', keys: '2 W S X' },
    { id: 'lm', name: 'Majeur G', keys: '3 E D C' },
    { id: 'li', name: 'Index G', keys: '4 5 R F T G V B' },
    { id: 'ri', name: 'Index D', keys: '6 7 Y H U J N M' },
    { id: 'rm', name: 'Majeur D', keys: '8 I K ,' },
    { id: 'rr', name: 'Annulaire D', keys: '9 O L .' },
    { id: 'rp', name: 'Auriculaire D', keys: "0 P ; ' …" },
    { id: 'th', name: 'Pouces', keys: 'Espace' }
  ];

  // caractère -> e.code (position physique QWERTY)
  var CHAR_TO_CODE = { ' ': 'Space' };
  KB_ROWS.forEach(function (row) {
    row.forEach(function (k) { CHAR_TO_CODE[k.l.toLowerCase()] = k.c; });
  });
  'abcdefghijklmnopqrstuvwxyz'.split('').forEach(function (ch) {
    CHAR_TO_CODE[ch] = 'Key' + ch.toUpperCase();
    CHAR_TO_CODE[ch.toUpperCase()] = 'Key' + ch.toUpperCase();
  });
  Object.assign(CHAR_TO_CODE, {
    '!': 'Digit1', '@': 'Digit2', '#': 'Digit3', '$': 'Digit4', '%': 'Digit5',
    '^': 'Digit6', '&': 'Digit7', '*': 'Digit8', '(': 'Digit9', ')': 'Digit0',
    '_': 'Minus', '+': 'Equal', '{': 'BracketLeft', '}': 'BracketRight', '|': 'Backslash',
    ':': 'Semicolon', '"': 'Quote', '<': 'Comma', '>': 'Period', '?': 'Slash', '~': 'Backquote'
  });

  function charToCode(ch) { return CHAR_TO_CODE[ch] || CHAR_TO_CODE[String(ch).toLowerCase()] || null; }
  function fingerOfCode(code) {
    for (var r = 0; r < KB_ROWS.length; r++)
      for (var i = 0; i < KB_ROWS[r].length; i++)
        if (KB_ROWS[r][i].c === code) return KB_ROWS[r][i].f;
    return null;
  }

  /* ---------------- stockage local ---------------- */
  var LS_HISTORY = 'ktq_history', LS_ERRORS = 'ktq_errors', LS_GAME = 'ktq_game';
  function lsGet(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* mode privé etc. */ }
  }

  /* ---------------- état du jeu ---------------- */
  function defaultGame() {
    return {
      xp: 0,
      stars: {},        // lessonId -> 0..3
      badges: {},       // badgeId -> timestamp
      streak: { last: null, count: 0 },
      totalSessions: 0,
      langs: {},
      settings: { sound: true, showKb: true }
    };
  }
  var G = lsGet(LS_GAME, null) || defaultGame();
  if (!G.settings) G.settings = { sound: true, showKb: true };
  function saveGame() { lsSet(LS_GAME, G); }

  function checkBadges(game, ctx) {
    var earned = [];
    BADGES.forEach(function (b) {
      if (!game.badges[b.id]) {
        var ok = false;
        try { ok = b.test(game, ctx); } catch (e) { ok = false; }
        if (ok) { game.badges[b.id] = Date.now(); earned.push(b); }
      }
    });
    return earned;
  }

  /* ---------------- sons (WebAudio, aucun fichier) ---------------- */
  var audioCtx = null;
  function sfx(kind) {
    if (!G.settings.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var t = audioCtx.currentTime;
      function tone(freq, dur, type, vol, delay) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = type; o.frequency.value = freq;
        g.gain.setValueAtTime(vol, t + delay);
        g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t + delay); o.stop(t + delay + dur + 0.02);
      }
      if (kind === 'ok') tone(660 + rand(60), 0.07, 'sine', 0.06, 0);
      else if (kind === 'bad') tone(150, 0.13, 'sawtooth', 0.07, 0);
      else if (kind === 'star') tone(880, 0.12, 'triangle', 0.09, 0);
      else if (kind === 'levelup') { tone(523, 0.12, 'triangle', 0.09, 0); tone(659, 0.12, 'triangle', 0.09, 0.1); tone(784, 0.12, 'triangle', 0.09, 0.2); tone(1047, 0.25, 'triangle', 0.1, 0.3); }
      else if (kind === 'finish') { tone(523, 0.14, 'triangle', 0.09, 0); tone(659, 0.14, 'triangle', 0.09, 0.12); tone(784, 0.22, 'triangle', 0.1, 0.24); }
    } catch (e) { /* audio indisponible : on ignore */ }
  }

  /* ---------------- état UI / session ---------------- */
  var ui = {
    view: 'cours',
    lang: 'fr',
    mode: 'words',
    level: { keys: 'home', words: 'easy' },
    duration: 60,
    pendingLesson: null
  };

  var S = null; // session en cours

  function newSession() {
    return {
      ctx: null, mode: 'words', lang: 'fr', level: 'easy', duration: 60, label: '',
      text: '', spans: [], caret: 0, prevCaret: -1,
      keystrokes: 0, correct: 0, errors: 0, errorMap: {},
      startTs: 0, elapsed: 0, timer: null, lastSampleSec: -1, wpmSamples: [],
      finished: false
    };
  }

  /* ============================================================
     PARTIE DOM (exécutée seulement dans un navigateur)
     ============================================================ */
  var $ = function (id) { return document.getElementById(id); };
  var els = {};
  var kbMap = {};       // code -> élément touche (clavier d'entraînement)
  var heatMap = {};     // code -> élément touche (carte de chaleur)

  function cacheEls() {
    ['view-cours', 'view-libre', 'view-train', 'view-stats', 'lesson-map', 'cours-progress',
     'cours-progress-label', 'map-hint', 'btn-continue', 'train-context', 'text-display', 'keyboard', 'keyboard-heat',
     'finger-legend', 'kb-zone', 'hud-wpm', 'hud-acc', 'hud-err', 'hud-time', 'progress-bar',
     'btn-start-free', 'btn-sound', 'btn-quit', 'logo-home', 'results-modal', 'res-stars', 'res-xp',
     'res-wpm', 'res-acc', 'res-err', 'res-chars', 'res-time', 'res-chart', 'res-sub', 'res-title',
     'record-banner', 'levelup-banner', 'levelup-n', 'res-badges', 'btn-next', 'btn-again', 'btn-home',
     'lesson-modal', 'lesson-newkeys', 'lesson-name', 'lesson-desc', 'lesson-best',
     'btn-lesson-start', 'btn-lesson-back', 'stats-cards', 'stats-chart', 'stats-level', 'badges-grid',
     'btn-clear-history', 'opt-keyboard', 'hdr-level', 'hdr-xpfill', 'hdr-stars', 'hdr-stars-max',
     'hdr-streak', 'toast'].forEach(function (id) {
      els[id] = $(id);
    });
  }

  function showView(name) {
    ui.view = name;
    ['view-cours', 'view-libre', 'view-train', 'view-stats'].forEach(function (v) { els[v].hidden = (v !== 'view-' + name); });
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('active', t.dataset.view === name); });
    if (name === 'cours') renderMap();
    if (name === 'stats') renderStats();
    renderHeader();
  }

  /* ---------- header joueur ---------- */
  function renderHeader() {
    var b = xpBounds(G.xp);
    var fill = Math.min(100, Math.round(((G.xp - b[0]) / Math.max(1, b[1] - b[0])) * 100));
    els['hdr-level'].textContent = b[2];
    els['hdr-xpfill'].style.width = fill + '%';
    var ts = totalStars(G.stars);
    els['hdr-stars'].textContent = ts;
    els['hdr-stars-max'].textContent = LESSONS.length * 3;
    els['hdr-streak'].textContent = G.streak.count;
  }

  /* ---------- carte des leçons ---------- */
  function starsHtml(n) {
    var s = '';
    for (var i = 1; i <= 3; i++) s += '<span class="' + (i <= n ? 'on' : '') + '">★</span>';
    return s;
  }

  function firstIncompleteIdx() {
    for (var i = 0; i < LESSONS.length; i++) if ((G.stars[LESSONS[i].id] || 0) === 0) return i;
    return -1;
  }

  function renderMap() {
    var map = els['lesson-map'];
    map.innerHTML = '';
    var done = 0, cur = firstIncompleteIdx();

    // Bouton Continuer : reprend directement la prochaine leçon à faire
    var cont = els['btn-continue'];
    if (cur >= 0) {
      var l0 = LESSONS[cur];
      cont.hidden = false;
      cont.textContent = '▶ Continuer — Leçon ' + (cur + 1) + ' : ' + l0.name;
      cont.onclick = function () { startSession({ kind: 'lesson', lesson: l0 }); };
    } else {
      cont.hidden = false;
      cont.textContent = '🏆 Cours terminé ! Revois tes leçons ou passe en mode Libre';
      cont.onclick = function () { showView('libre'); };
    }

    var UNITS = globalThis.UNITS || [];
    UNITS.forEach(function (u) {
      var head = document.createElement('div');
      head.className = 'unit-head';
      head.innerHTML = '<span class="unit-icon">' + u.icon + '</span> ' + u.name;
      map.appendChild(head);
      var grid = document.createElement('div');
      grid.className = 'unit-grid';
      LESSONS.forEach(function (l, i) {
        if (l.unit !== u.id) return;
        var stars = G.stars[l.id] || 0;
        var unlocked = isUnlocked(G.stars, i);
        if (stars > 0) done++;
        var card = document.createElement('div');
        card.className = 'lesson-card'
          + (unlocked ? '' : ' locked')
          + (stars > 0 ? ' done' : '')
          + (stars === 3 ? ' gold' : '')
          + (unlocked && i === cur ? ' current' : '');
        var keysHtml = l.newKeys.map(function (k) {
          var f = fingerOfCode(charToCode(k)) || 'th';
          return '<span class="mini-key f-' + f + '">' + k.toUpperCase() + '</span>';
        }).join('');
        card.innerHTML =
          '<div class="lesson-top"><span class="lesson-num">' + (i + 1) + '</span>' +
          '<span class="lesson-name">' + l.name + '</span></div>' +
          (unlocked ? '' : '<span class="lesson-lock">🔒</span>') +
          '<div class="lesson-newkeys">' + keysHtml + '</div>' +
          '<div class="lesson-stars">' + starsHtml(stars) + '</div>';
        if (unlocked) {
          card.addEventListener('click', function () { openLessonModal(l); });
        }
        grid.appendChild(card);
      });
      map.appendChild(grid);
    });

    els['cours-progress'].style.width = (LESSONS.length ? (done / LESSONS.length) * 100 : 0) + '%';
    els['cours-progress-label'].textContent = done + ' / ' + LESSONS.length + ' leçons terminées · ⭐ ' + totalStars(G.stars) + ' / ' + (LESSONS.length * 3) + ' · XP ' + G.xp;
    els['map-hint'].hidden = done > 0 || cur === -1;
  }

  /* ---------- modale d'intro de leçon ---------- */
  function openLessonModal(lesson) {
    ui.pendingLesson = lesson;
    var box = els['lesson-newkeys'];
    box.innerHTML = '';
    lesson.newKeys.forEach(function (k) {
      var f = fingerOfCode(charToCode(k)) || 'th';
      var mk = document.createElement('span');
      mk.className = 'mini-key f-' + f;
      mk.textContent = k.toUpperCase();
      box.appendChild(mk);
    });
    if (!lesson.newKeys.length) box.innerHTML = '<span class="mini-key f-th">⌨️</span>';
    els['lesson-name'].textContent = 'Leçon ' + (LESSONS.indexOf(lesson) + 1) + ' — ' + lesson.name;
    els['lesson-desc'].textContent = lesson.desc;
    els['lesson-best'].innerHTML = starsHtml(G.stars[lesson.id] || 0);
    els['lesson-modal'].hidden = false;
  }

  /* ---------- rendu du clavier ---------- */
  function buildKeyboard(container, map) {
    container.innerHTML = '';
    map = map || {};
    KB_ROWS.forEach(function (row) {
      var rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      row.forEach(function (k) {
        var el = document.createElement('div');
        el.className = 'key f-' + k.f + (k.home ? ' home' : '');
        el.style.setProperty('--w', k.w || 1);
        el.dataset.code = k.c;
        el.innerHTML = k.c === 'Space' ? '<span class="sub">' + k.l + '</span>' : k.l;
        rowEl.appendChild(el);
        map[k.c] = el;
      });
      container.appendChild(rowEl);
    });
  }

  function buildFingerLegend() {
    var box = els['finger-legend'];
    box.innerHTML = '';
    FINGERS.forEach(function (f) {
      var chip = document.createElement('span');
      chip.className = 'finger-chip f-' + f.id;
      chip.dataset.finger = f.id;
      chip.innerHTML = '<span class="dot"></span>' + f.name + ' <b>' + f.keys + '</b>';
      box.appendChild(chip);
    });
  }

  function setNextKey(code) {
    Object.keys(kbMap).forEach(function (c) { kbMap[c].classList.remove('next'); });
    document.querySelectorAll('.finger-chip.active').forEach(function (c) { c.classList.remove('active'); });
    if (!code) return;
    var el = kbMap[code];
    if (el) el.classList.add('next');
    var f = fingerOfCode(code);
    if (f) {
      var chip = document.querySelector('.finger-chip[data-finger="' + f + '"]');
      if (chip) chip.classList.add('active');
    }
  }

  function flashKey(code, ok) {
    var el = kbMap[code];
    if (!el) return;
    el.classList.remove('pressed-ok', 'pressed-bad');
    void el.offsetWidth; // relance l'animation
    el.classList.add(ok ? 'pressed-ok' : 'pressed-bad');
    setTimeout(function () { el.classList.remove('pressed-ok', 'pressed-bad'); }, 160);
  }

  /* ---------- rendu du texte ---------- */
  function renderText() {
    var box = els['text-display'];
    box.innerHTML = '';
    S.spans = [];
    for (var i = 0; i < S.text.length; i++) {
      var sp = document.createElement('span');
      sp.className = 'ch';
      sp.textContent = S.text[i];
      box.appendChild(sp);
      S.spans.push(sp);
    }
    S.caret = 0; S.prevCaret = -1;
    updateCursor();
  }

  function appendText(extra) {
    S.text += ' ' + extra;
    var box = els['text-display'];
    var spSpace = document.createElement('span');
    spSpace.className = 'ch'; spSpace.textContent = ' ';
    box.appendChild(spSpace);
    S.spans.push(spSpace);
    for (var i = 0; i < extra.length; i++) {
      var sp = document.createElement('span');
      sp.className = 'ch';
      sp.textContent = extra[i];
      box.appendChild(sp);
      S.spans.push(sp);
    }
    updateCursor();
    updateNextKey();
  }

  function updateCursor() {
    if (S.prevCaret >= 0 && S.spans[S.prevCaret]) S.spans[S.prevCaret].classList.remove('cursor');
    if (S.spans[S.caret]) S.spans[S.caret].classList.add('cursor');
    S.prevCaret = S.caret;
  }

  function updateNextKey() {
    var expected = S.text[S.caret];
    setNextKey(expected ? charToCode(expected) : null);
  }

  /* ---------- HUD ---------- */
  function updateHud() {
    els['hud-wpm'].textContent = computeWpm(S.correct, S.elapsed);
    els['hud-acc'].textContent = computeAcc(S.correct, S.keystrokes);
    els['hud-err'].textContent = S.errors;
    els['hud-time'].textContent = S.mode === 'time'
      ? fmtTime(Math.max(0, S.duration - S.elapsed))
      : fmtTime(S.elapsed);
    els['progress-bar'].style.width = (S.text.length ? (S.caret / S.text.length) * 100 : 0) + '%';
  }

  /* ---------- démarrage d'une session ---------- */
  function startSession(ctx) {
    stopTimers();
    S = newSession();
    S.ctx = ctx;
    S.lang = ui.lang;
    if (ctx.kind === 'lesson') {
      var l = ctx.lesson;
      S.mode = l.type === 'time' ? 'time' : 'lesson';
      S.duration = l.duration || 60;
      S.text = genLessonText(l, ui.lang);
      S.label = '🎓 Leçon ' + (LESSONS.indexOf(l) + 1) + ' — ' + l.name;
    } else {
      S.mode = ctx.mode;
      S.duration = ctx.duration || 60;
      S.level = ctx.level || 'easy';
      S.text = generateText(ctx.mode, { lang: ui.lang, level: S.level });
      S.label = '🏋️ Libre — ' + modeLabel(ctx.mode, ui.lang, ctx.duration);
    }
    renderText();
    els['kb-zone'].style.display = G.settings.showKb ? '' : 'none';
    els['train-context'].textContent = S.label;
    setNextKey(charToCode(S.text[0]));
    updateHud();
    els['results-modal'].hidden = true;
    els['lesson-modal'].hidden = true;
    showView('train');
    S.startTs = performance.now();
    S.timer = setInterval(tick, 100);
    window.focus();
  }

  function modeLabel(mode, lang, duration) {
    var names = { keys: 'Touches', words: 'Mots', phrases: 'Phrases', time: 'Chrono ' + (duration || 60) + ' s' };
    return (names[mode] || mode) + ' · ' + (lang === 'fr' ? 'FR' : 'EN');
  }

  function stopTimers() {
    if (S && S.timer) clearInterval(S.timer);
    if (S) S.timer = null;
  }

  function tick() {
    if (!S || S.finished) return;
    S.elapsed = (performance.now() - S.startTs) / 1000;
    if (S.mode === 'time' && S.elapsed >= S.duration) { finishSession(); return; }
    var sec = Math.floor(S.elapsed);
    if (sec !== S.lastSampleSec) {
      S.lastSampleSec = sec;
      S.wpmSamples.push({ t: sec, wpm: computeWpm(S.correct, S.elapsed) });
    }
    updateHud();
  }

  /* ---------- saisie ---------- */
  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Raccourcis globaux
    if (!els['results-modal'].hidden && e.key === 'Enter') { e.preventDefault(); els['results-modal'].hidden = true; startSession(S.ctx); return; }
    if (!els['lesson-modal'].hidden && e.key === 'Enter') { e.preventDefault(); els['lesson-modal'].hidden = true; startSession({ kind: 'lesson', lesson: ui.pendingLesson }); return; }
    if (ui.view === 'cours' && e.key === 'Enter') { e.preventDefault(); var ci = firstIncompleteIdx(); if (ci >= 0) startSession({ kind: 'lesson', lesson: LESSONS[ci] }); return; }
    if (ui.view === 'libre' && e.key === 'Enter') { e.preventDefault(); startSession({ kind: 'free', mode: ui.mode, level: ui.level[ui.mode] || 'easy', duration: ui.duration }); return; }
    if (ui.view !== 'train' || !S || S.finished) return;

    if (['Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].indexOf(e.key) !== -1) {
      e.preventDefault(); return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (S.caret > 0) {
        S.caret--;
        if (S.spans[S.caret]) S.spans[S.caret].className = 'ch';
        updateCursor(); updateNextKey(); updateHud();
        flashKey('Backspace', true);
      }
      return;
    }

    if (e.key.length !== 1) return; // ignore Shift, Control, etc.
    e.preventDefault();

    var expected = S.text[S.caret];
    if (expected === undefined) { finishSession(); return; }

    S.keystrokes++;
    var code = e.code && kbMap[e.code] ? e.code : (charToCode(e.key) || e.code);

    if (e.key === expected) {
      S.spans[S.caret].className = 'ch ok';
      S.correct++;
      flashKey(code, true);
      sfx('ok');
      S.caret++;
      updateCursor();
    } else {
      S.errors++;
      S.errorMap[code] = (S.errorMap[code] || 0) + 1;
      flashKey(code, false);
      sfx('bad');
      // En leçon : faute bloquante façon TypingClub — on n'avance pas tant que la touche n'est pas juste
      if (S.ctx.kind === 'lesson') {
        var sp = S.spans[S.caret];
        sp.classList.remove('ok');
        sp.classList.add('bad'); // on garde la classe cursor intacte
        var expCode = charToCode(expected);
        if (expCode) flashKey(expCode, false);
        updateNextKey();
        updateHud();
        return;
      }
      S.spans[S.caret].className = 'ch bad';
      S.caret++;
      updateCursor();
    }

    if (S.mode === 'time' && S.caret > S.text.length - 30) {
      appendText(genWords(ui.lang, 'normal', 40));
    }

    if (S.caret >= S.text.length) { updateNextKey(); updateHud(); finishSession(); return; }
    updateNextKey();
    updateHud();
  }

  /* ---------- fin de session ---------- */
  function bestFor(mode, lang) {
    var h = lsGet(LS_HISTORY, []);
    var best = 0;
    h.forEach(function (r) { if (r.mode === mode && r.lang === lang && r.wpm > best) best = r.wpm; });
    return best;
  }

  function finishSession() {
    if (!S || S.finished) return;
    S.finished = true;
    stopTimers();
    S.elapsed = S.mode === 'time' ? S.duration : (performance.now() - S.startTs) / 1000;

    var wpm = computeWpm(S.correct, S.elapsed);
    var acc = computeAcc(S.correct, S.keystrokes);
    var isLesson = S.ctx.kind === 'lesson';
    var lessonId = isLesson ? S.ctx.lesson.id : null;
    var modeKey = isLesson ? 'lesson:' + lessonId : S.mode;

    var record = { ts: Date.now(), mode: modeKey, lang: S.lang, wpm: wpm, acc: acc, errors: S.errors, chars: S.correct, secs: Math.round(S.elapsed) };
    var history = lsGet(LS_HISTORY, []);
    history.unshift(record);
    if (history.length > 300) history.length = 300;
    lsSet(LS_HISTORY, history);

    var errs = lsGet(LS_ERRORS, {});
    Object.keys(S.errorMap).forEach(function (c) { errs[c] = (errs[c] || 0) + S.errorMap[c]; });
    lsSet(LS_ERRORS, errs);

    // ---- couche jeu ----
    var prevLevel = playerLevel(G.xp);
    var stars = 0, xpGain = 0;
    if (isLesson) {
      stars = starsFor(acc);
      var prev = G.stars[lessonId] || 0;
      if (stars > prev) G.stars[lessonId] = stars;
      xpGain = S.correct + stars * 30 + (stars === 3 ? 50 : 0);
    } else {
      xpGain = S.correct;
    }
    G.xp += xpGain;
    G.totalSessions++;
    G.langs[S.lang] = true;
    G.streak = nextStreak(G.streak);
    var earned = checkBadges(G, { acc: acc, wpm: wpm, chars: S.correct, mode: modeKey, lang: S.lang });
    saveGame();
    var newLevel = playerLevel(G.xp);

    showResults(record, {
      stars: stars, xpGain: xpGain, earned: earned,
      levelUp: newLevel > prevLevel, newLevel: newLevel,
      isRecord: wpm > 0 && wpm > bestFor(modeKey, S.lang)
    });
    renderHeader();
    if (newLevel > prevLevel) sfx('levelup'); else sfx('finish');
    earned.forEach(function (b, i) { setTimeout(function () { toast('🏅 Badge débloqué : ' + b.icon + ' ' + b.name); }, 600 + i * 900); });
    if (isLesson && stars > 0) { for (var s = 1; s <= stars; s++) setTimeout(function () { sfx('star'); }, 250 * s); }
  }

  function showResults(r, g) {
    els['res-title'].textContent = g.isLesson || (S && S.ctx.kind === 'lesson') ? 'Leçon terminée !' : 'Résultats';
    els['res-wpm'].textContent = r.wpm;
    els['res-acc'].textContent = r.acc + '%';
    els['res-err'].textContent = r.errors;
    els['res-chars'].textContent = r.chars;
    els['res-time'].textContent = fmtTime(r.secs);
    els['res-sub'].textContent = (S && S.label ? S.label + ' · ' : '') + 'mots par minute (WPM)';
    els['record-banner'].hidden = !g.isRecord;
    els['levelup-banner'].hidden = !g.levelUp;
    if (g.levelUp) els['levelup-n'].textContent = g.newLevel;

    var isLesson = S && S.ctx.kind === 'lesson';
    var starsRow = els['res-stars'];
    starsRow.hidden = !isLesson;
    if (isLesson) {
      starsRow.querySelectorAll('.star').forEach(function (st) {
        var on = parseInt(st.dataset.s, 10) <= g.stars;
        st.classList.remove('filled');
        if (on) setTimeout(function () { st.classList.add('filled'); }, 200 * parseInt(st.dataset.s, 10));
      });
    }
    els['res-xp'].textContent = '+' + g.xpGain + ' XP';

    var bb = els['res-badges'];
    if (g.earned.length) {
      bb.hidden = false;
      bb.innerHTML = g.earned.map(function (b) { return '<span class="be">' + b.icon + ' ' + b.name + '</span>'; }).join('');
    } else bb.hidden = true;

    // bouton leçon suivante
    var btnNext = els['btn-next'];
    if (isLesson) {
      var idx = LESSONS.indexOf(S.ctx.lesson);
      var next = idx >= 0 && idx + 1 < LESSONS.length ? LESSONS[idx + 1] : null;
      if (next && isUnlocked(G.stars, idx + 1)) {
        btnNext.hidden = false;
        btnNext.textContent = 'Leçon suivante : ' + next.name + ' ▶';
        btnNext.onclick = function () { startSession({ kind: 'lesson', lesson: next }); };
      } else if (next) {
        btnNext.hidden = false;
        btnNext.textContent = 'Termine cette leçon (⭐) pour débloquer la suivante ▶';
        btnNext.onclick = function () { startSession(S.ctx); };
      } else btnNext.hidden = true;
    } else btnNext.hidden = true;

    els['btn-again'].onclick = function () { startSession(S.ctx); };
    els['btn-home'].onclick = function () {
      els['results-modal'].hidden = true;
      showView(S && S.ctx.kind === 'lesson' ? 'cours' : 'libre');
    };

    els['results-modal'].hidden = false;
    drawLineChart(els['res-chart'], S.wpmSamples.map(function (p) { return p.wpm; }), '#22d3ee');
    if (g.stars === 3 || g.levelUp) confettiBurst();
  }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = els['toast'];
    t.textContent = msg;
    t.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }

  /* ---------- confettis (canvas plein écran, ~2.5 s) ---------- */
  function confettiBurst() {
    if (typeof document === 'undefined' || !document.body || typeof requestAnimationFrame === 'undefined') return;
    try {
      var c = document.createElement('canvas');
      c.className = 'confetti';
      c.width = window.innerWidth; c.height = window.innerHeight;
      document.body.appendChild(c);
      var ctx = c.getContext('2d');
      var colors = ['#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#34d399'];
      var parts = [];
      for (var i = 0; i < 150; i++) {
        parts.push({
          x: window.innerWidth / 2 + (Math.random() - 0.5) * 260,
          y: window.innerHeight * 0.32,
          vx: (Math.random() - 0.5) * 15,
          vy: -Math.random() * 14 - 4,
          s: Math.random() * 7 + 4,
          col: colors[rand(colors.length)],
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3
        });
      }
      var t0 = performance.now();
      function frame(t) {
        ctx.clearRect(0, 0, c.width, c.height);
        parts.forEach(function (p) {
          p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.r += p.vr;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
          ctx.fillStyle = p.col;
          ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
          ctx.restore();
        });
        if (t - t0 < 2600) requestAnimationFrame(frame);
        else if (c.parentNode) c.parentNode.removeChild(c);
      }
      requestAnimationFrame(frame);
    } catch (e) { /* confettis indisponibles : on ignore */ }
  }

  /* ---------- graphiques (canvas, aucun lib) ---------- */
  function drawLineChart(canvas, values, color) {
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 500, h = parseInt(canvas.getAttribute('height'), 10) || 120;
    canvas.width = w * dpr; canvas.height = h * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    if (!values || !values.length) {
      ctx.fillStyle = 'rgba(139,150,179,0.7)';
      ctx.font = '13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Pas encore de données — lance un exercice !', w / 2, h / 2);
      return;
    }
    var max = Math.max(10, Math.max.apply(null, values));
    var padL = 8, padR = 8, padT = 10, padB = 18;
    var iw = w - padL - padR, ih = h - padT - padB;
    function x(i) { return values.length === 1 ? padL + iw / 2 : padL + (i / (values.length - 1)) * iw; }
    function y(v) { return padT + ih - (v / max) * ih; }

    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (var g = 0; g <= 3; g++) {
      var gy = padT + (g / 3) * ih;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(w - padR, gy); ctx.stroke();
      ctx.fillStyle = 'rgba(139,150,179,0.8)'; ctx.font = '10px ui-monospace, monospace'; ctx.textAlign = 'left';
      ctx.fillText(Math.round((max * (3 - g)) / 3) + '', 2, gy + 3);
    }

    var grad = ctx.createLinearGradient(0, padT, 0, h - padB);
    grad.addColorStop(0, color + 'cc'); grad.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.moveTo(x(0), y(values[0]));
    for (var i = 1; i < values.length; i++) ctx.lineTo(x(i), y(values[i]));
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.lineTo(x(values.length - 1), padT + ih); ctx.lineTo(x(0), padT + ih); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    ctx.fillStyle = color;
    for (var j = 0; j < values.length; j++) {
      ctx.beginPath(); ctx.arc(x(j), y(values[j]), 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  /* ---------- page progression ---------- */
  function renderStats() {
    var h = lsGet(LS_HISTORY, []);
    els['stats-level'].textContent = playerLevel(G.xp);
    var cards = els['stats-cards'];
    cards.innerHTML = '';
    if (!h.length) {
      cards.innerHTML = '<div class="stat-card" style="grid-column:1/-1"><span class="stat-lab">Aucune session pour le moment — va sur l\'onglet 🎓 Cours !</span></div>';
      drawLineChart(els['stats-chart'], []);
    } else {
      var best = 0, totalSecs = 0, last10 = h.slice(0, 10), sum = 0;
      h.forEach(function (r) { if (r.wpm > best) best = r.wpm; totalSecs += r.secs || 0; });
      last10.forEach(function (r) { sum += r.wpm; });
      var stats = [
        [h.length, 'Sessions'],
        [best + ' MPM', 'Record'],
        [Math.round(sum / last10.length) + ' MPM', 'Moyenne (10 dernières)'],
        [fmtTime(totalSecs), 'Temps total tapé'],
        [totalStars(G.stars) + ' / ' + (LESSONS.length * 3), 'Étoiles ⭐'],
        ['🔥 ' + G.streak.count, 'Série de jours'],
        [G.xp + ' XP', 'Expérience'],
        [Object.keys(G.badges).length + ' / ' + BADGES.length, 'Badges 🏅']
      ];
      stats.forEach(function (s) {
        var d = document.createElement('div');
        d.className = 'stat-card';
        d.innerHTML = '<span class="stat-num">' + s[0] + '</span><span class="stat-lab">' + s[1] + '</span>';
        cards.appendChild(d);
      });
      drawLineChart(els['stats-chart'], h.slice(0, 30).reverse().map(function (r) { return r.wpm; }), '#a78bfa');
    }
    renderBadges();
    renderHeatmap();
  }

  function renderBadges() {
    var grid = els['badges-grid'];
    grid.innerHTML = '';
    BADGES.forEach(function (b) {
      var earned = !!G.badges[b.id];
      var d = document.createElement('div');
      d.className = 'badge-card ' + (earned ? 'earned' : 'locked');
      d.innerHTML = '<span class="bicon">' + (earned ? b.icon : '🔒') + '</span>' +
        '<div class="bname">' + b.name + '</div><div class="bdesc">' + b.desc + '</div>';
      grid.appendChild(d);
    });
  }

  function renderHeatmap() {
    buildKeyboard(els['keyboard-heat'], heatMap);
    var errs = lsGet(LS_ERRORS, {});
    var max = 0;
    Object.keys(errs).forEach(function (c) { if (errs[c] > max) max = errs[c]; });
    Object.keys(heatMap).forEach(function (code) {
      var el = heatMap[code], n = errs[code] || 0;
      if (n && max) {
        var a = 0.15 + 0.65 * (n / max);
        el.style.background = 'rgba(248,113,113,' + a.toFixed(2) + ')';
        el.style.borderColor = 'rgba(248,113,113,' + Math.min(1, a + 0.2).toFixed(2) + ')';
        el.title = n + ' erreur' + (n > 1 ? 's' : '') + ' sur cette touche';
      } else {
        el.title = 'Aucune erreur enregistrée';
      }
    });
  }

  /* ---------- câblage ---------- */
  function wireNav() {
    document.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () { stopTimers(); els['results-modal'].hidden = true; els['lesson-modal'].hidden = true; showView(t.dataset.view); });
    });
    els['logo-home'].addEventListener('click', function () { stopTimers(); els['results-modal'].hidden = true; showView('cours'); });
    els['btn-quit'].addEventListener('click', function () {
      stopTimers();
      showView(S && S.ctx && S.ctx.kind === 'lesson' ? 'cours' : 'libre');
    });
    els['btn-lesson-back'].addEventListener('click', function () { els['lesson-modal'].hidden = true; });
    els['btn-lesson-start'].addEventListener('click', function () {
      els['lesson-modal'].hidden = true;
      startSession({ kind: 'lesson', lesson: ui.pendingLesson });
    });
    els['btn-sound'].addEventListener('click', function () {
      G.settings.sound = !G.settings.sound;
      saveGame();
      els['btn-sound'].textContent = G.settings.sound ? '🔊 Son' : '🔇 Son muet';
      els['btn-sound'].classList.toggle('off', !G.settings.sound);
      els['btn-sound'].setAttribute('aria-pressed', String(G.settings.sound));
      if (G.settings.sound) sfx('ok');
    });
    els['btn-clear-history'].addEventListener('click', function () {
      if (window.confirm('Effacer tout ton historique ET ta progression (XP, étoiles, badges, série) ?')) {
        lsSet(LS_HISTORY, []); lsSet(LS_ERRORS, {});
        G = defaultGame(); saveGame();
        renderStats(); renderHeader(); renderMap();
      }
    });
    document.addEventListener('keydown', onKeyDown);
  }

  function wireLibre() {
    document.querySelectorAll('.mode-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.chip')) return;
        ui.mode = card.dataset.mode;
        document.querySelectorAll('.mode-card').forEach(function (c) { c.classList.toggle('active', c === card); });
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.target.closest('.chip')) { e.preventDefault(); ui.mode = card.dataset.mode; startSession({ kind: 'free', mode: ui.mode, level: ui.level[ui.mode] || 'easy', duration: ui.duration }); }
      });
    });
    document.querySelectorAll('.lang-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        ui.lang = chip.dataset.lang;
        document.querySelectorAll('.lang-chip').forEach(function (c) { c.classList.toggle('active', c === chip); });
      });
    });
    document.querySelectorAll('.mode-levels').forEach(function (group) {
      var kind = group.dataset.levels;
      group.querySelectorAll('.chip').forEach(function (chip) {
        chip.addEventListener('click', function (e) {
          e.stopPropagation();
          group.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c === chip); });
          if (kind === 'time') ui.duration = parseInt(chip.dataset.duration, 10);
          else ui.level[kind] = chip.dataset.level;
        });
      });
    });
    els['btn-start-free'].addEventListener('click', function () {
      startSession({ kind: 'free', mode: ui.mode, level: ui.level[ui.mode] || 'easy', duration: ui.duration });
    });
    els['opt-keyboard'].addEventListener('change', function (e) {
      G.settings.showKb = e.target.checked;
      saveGame();
    });
  }

  function init() {
    cacheEls();
    els['opt-keyboard'].checked = G.settings.showKb;
    els['btn-sound'].textContent = G.settings.sound ? '🔊 Son' : '🔇 Son muet';
    els['btn-sound'].classList.toggle('off', !G.settings.sound);
    buildFingerLegend();
    buildKeyboard(els['keyboard'], kbMap);
    wireNav();
    wireLibre();
    showView('cours');
  }

  /* ---------------- exports pour tests Node ---------------- */
  globalThis.KTQ = {
    normalize: normalize, rand: rand, genFromSet: genFromSet, genKeys: genKeys,
    genWords: genWords, genPhrases: genPhrases, generateText: generateText, genLessonText: genLessonText,
    computeWpm: computeWpm, computeAcc: computeAcc, fmtTime: fmtTime,
    starsFor: starsFor, playerLevel: playerLevel, xpBounds: xpBounds,
    isUnlocked: isUnlocked, totalStars: totalStars, dayStr: dayStr, nextStreak: nextStreak,
    charToCode: charToCode, fingerOfCode: fingerOfCode,
    KB_ROWS: KB_ROWS, FINGERS: FINGERS, LESSONS: LESSONS, BADGES: BADGES, wordPool: wordPool,
    defaultGame: defaultGame, checkBadges: checkBadges
  };

  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
