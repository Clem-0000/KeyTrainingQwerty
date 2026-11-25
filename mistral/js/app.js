/* ============================================================
   KeyTrain — logique applicative (vanilla JS, zéro dépendance)
   Fonctionne en file:// comme en http:// : aucun appel réseau.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- données ---------------- */
  var WORDS = { fr: globalThis.WORDS_FR || [], en: globalThis.WORDS_EN || [] };
  var PHRASES = { fr: globalThis.PHRASES_FR || [], en: globalThis.PHRASES_EN || [] };

  /* ---------------- utilitaires purs ---------------- */
  function rand(n) { return Math.floor(Math.random() * n); }

  // Retire les accents (compatibilité toutes dispositions de clavier : QWERTY US, FR, etc.)
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

  // Génération de textes selon le mode
  function genKeys(level) {
    var sets = {
      home: 'asdfjkl;',
      top: 'asdfjkl;qwertyuiop',
      all: '1234567890qwertyuiopasdfghjkl;zxcvbnm,./'
    };
    var set = sets[level] || sets.home, out = '';
    while (out.length < 150) {
      var g = 3 + rand(4);
      for (var i = 0; i < g; i++) out += set[rand(set.length)];
      out += ' ';
    }
    return out.trim();
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

  function genPhrases(lang) {
    return pickN(PHRASES[lang] || PHRASES.en, 10)
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
    { id: 'rp', name: 'Auriculaire D', keys: '0 P ; \' …' },
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
  var LS_HISTORY = 'ktq_history', LS_ERRORS = 'ktq_errors', LS_SETTINGS = 'ktq_settings';
  function lsGet(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function lsSet(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* mode privé etc. */ }
  }

  /* ---------------- sons (WebAudio, aucun fichier) ---------------- */
  var audioCtx = null;
  function sfx(kind) {
    if (!ui.sound) return;
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
      else if (kind === 'finish') { tone(523, 0.14, 'triangle', 0.09, 0); tone(659, 0.14, 'triangle', 0.09, 0.12); tone(784, 0.22, 'triangle', 0.1, 0.24); }
    } catch (e) { /* audio indisponible : on ignore */ }
  }

  /* ---------------- état UI / session ---------------- */
  var ui = {
    view: 'home',
    mode: 'words',
    lang: 'fr',
    level: { keys: 'home', words: 'easy' },
    duration: 60,
    showKb: true,
    sound: true
  };

  var S = null; // session en cours

  function newSession(mode, lang, level, duration) {
    return {
      mode: mode, lang: lang, level: level, duration: duration,
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
    ['view-home', 'view-train', 'view-stats', 'text-display', 'keyboard', 'keyboard-heat',
     'finger-legend', 'kb-zone', 'hud-wpm', 'hud-acc', 'hud-err', 'hud-time', 'progress-bar',
     'btn-start', 'btn-stats', 'btn-stats-back', 'btn-sound', 'btn-quit', 'logo-home',
     'results-modal', 'res-wpm', 'res-acc', 'res-err', 'res-chars', 'res-time', 'res-chart',
     'res-sub', 'record-banner', 'btn-again', 'btn-home', 'best-strip', 'best-strip-content',
     'stats-cards', 'stats-chart', 'btn-clear-history', 'opt-keyboard'].forEach(function (id) {
      els[id] = $(id);
    });
  }

  function showView(name) {
    ui.view = name;
    ['view-home', 'view-train', 'view-stats'].forEach(function (v) { els[v].hidden = (v !== 'view-' + name); });
    if (name === 'stats') renderStats();
    if (name === 'home') renderBestStrip();
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
    for (var i = 0; i < extra.length; i++) {
      var sp = document.createElement('span');
      sp.className = 'ch';
      sp.textContent = extra[i];
      box.appendChild(sp);
      S.spans.push(sp);
    }
    // le premier caractère ajouté est un espace
    var spSpace = document.createElement('span');
    // (on insère l'espace avant les nouveaux spans)
    S.spans.splice(S.spans.length - extra.length, 0, spSpace);
    spSpace.className = 'ch'; spSpace.textContent = ' ';
    box.insertBefore(spSpace, box.children[box.children.length - extra.length]);
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
    var wpm = computeWpm(S.correct, S.elapsed);
    els['hud-wpm'].textContent = wpm;
    els['hud-acc'].textContent = computeAcc(S.correct, S.keystrokes);
    els['hud-err'].textContent = S.errors;
    els['hud-time'].textContent = S.mode === 'time'
      ? fmtTime(Math.max(0, S.duration - S.elapsed))
      : fmtTime(S.elapsed);
    els['progress-bar'].style.width = (S.text.length ? (S.caret / S.text.length) * 100 : 0) + '%';
  }

  /* ---------- boucle de session ---------- */
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

  function startSession() {
    stopTimers();
    S = newSession(ui.mode, ui.lang, ui.level[ui.mode] || ui.level.words, ui.duration);
    S.text = generateText(ui.mode, { lang: ui.lang, level: ui.level[ui.mode] || 'easy' });
    renderText();
    els['kb-zone'].style.display = ui.showKb ? '' : 'none';
    setNextKey(charToCode(S.text[0]));
    updateHud();
    showView('train');
    els['results-modal'].hidden = true;
    S.startTs = performance.now();
    S.timer = setInterval(tick, 100);
    window.focus();
  }

  function stopTimers() {
    if (S && S.timer) clearInterval(S.timer);
    if (S) S.timer = null;
  }

  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Raccourcis globaux
    if (ui.view === 'home' && e.key === 'Enter' && els['results-modal'].hidden) { e.preventDefault(); startSession(); return; }
    if (!els['results-modal'].hidden && e.key === 'Enter') { e.preventDefault(); els['results-modal'].hidden = true; startSession(); return; }
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
    } else {
      S.spans[S.caret].className = 'ch bad';
      S.errors++;
      S.errorMap[code] = (S.errorMap[code] || 0) + 1;
      flashKey(code, false);
      sfx('bad');
    }

    S.caret++;
    updateCursor();

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
    var record = { ts: Date.now(), mode: S.mode, lang: S.lang, level: S.level, duration: S.duration, wpm: wpm, acc: acc, errors: S.errors, chars: S.correct, secs: Math.round(S.elapsed) };

    var history = lsGet(LS_HISTORY, []);
    history.unshift(record);
    if (history.length > 300) history.length = 300;
    lsSet(LS_HISTORY, history);

    var errs = lsGet(LS_ERRORS, {});
    Object.keys(S.errorMap).forEach(function (c) { errs[c] = (errs[c] || 0) + S.errorMap[c]; });
    lsSet(LS_ERRORS, errs);

    var isRecord = wpm > 0 && wpm > bestFor(S.mode, S.lang);
    showResults(record, isRecord);
    sfx('finish');
  }

  function showResults(r, isRecord) {
    els['res-wpm'].textContent = r.wpm;
    els['res-acc'].textContent = r.acc + '%';
    els['res-err'].textContent = r.errors;
    els['res-chars'].textContent = r.chars;
    els['res-time'].textContent = fmtTime(r.secs);
    els['res-sub'].textContent = modeLabel(r.mode, r.lang, r.duration) + ' · mots par minute (WPM)';
    els['record-banner'].hidden = !isRecord;
    els['results-modal'].hidden = false;
    drawLineChart(els['res-chart'], S.wpmSamples.map(function (p) { return p.wpm; }), '#22d3ee');
  }

  function modeLabel(mode, lang, duration) {
    var names = { keys: 'Exercice de touches', words: 'Mots', phrases: 'Phrases', time: 'Chrono ' + (duration || ui.duration) + ' s' };
    return (names[mode] || mode) + ' · ' + (lang === 'fr' ? 'FR' : 'EN');
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

    // grille
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (var g = 0; g <= 3; g++) {
      var gy = padT + (g / 3) * ih;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(w - padR, gy); ctx.stroke();
      ctx.fillStyle = 'rgba(139,150,179,0.8)'; ctx.font = '10px ui-monospace, monospace'; ctx.textAlign = 'left';
      ctx.fillText(Math.round((max * (3 - g)) / 3) + '', 2, gy + 3);
    }

    // aire + ligne
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
  function renderBestStrip() {
    var h = lsGet(LS_HISTORY, []);
    if (!h.length) { els['best-strip'].hidden = true; return; }
    var parts = [];
    [['keys', 'Touches'], ['words', 'Mots'], ['phrases', 'Phrases'], ['time', 'Chrono']].forEach(function (m) {
      var best = 0, lang = '';
      h.forEach(function (r) { if (r.mode === m[0] && r.wpm > best) { best = r.wpm; lang = r.lang; } });
      if (best) parts.push(m[1] + ' ' + lang.toUpperCase() + ' : <b>' + best + ' MPM</b>');
    });
    els['best-strip-content'].innerHTML = parts.join(' &nbsp;·&nbsp; ');
    els['best-strip'].hidden = false;
  }

  function renderStats() {
    var h = lsGet(LS_HISTORY, []);
    var cards = els['stats-cards'];
    cards.innerHTML = '';
    if (!h.length) {
      cards.innerHTML = '<div class="stat-card" style="grid-column:1/-1"><span class="stat-lab">Aucune session pour le moment — retourne t\'entraîner ! ⌨️</span></div>';
      drawLineChart(els['stats-chart'], []);
      renderHeatmap();
      return;
    }
    var best = 0, totalSecs = 0, last10 = h.slice(0, 10), sum = 0;
    h.forEach(function (r) { if (r.wpm > best) best = r.wpm; totalSecs += r.secs || 0; });
    last10.forEach(function (r) { sum += r.wpm; });
    var avg = Math.round(sum / last10.length);
    var stats = [
      [h.length, 'Sessions'],
      [best + ' MPM', 'Record'],
      [avg + ' MPM', 'Moyenne (10 dernières)'],
      [fmtTime(totalSecs), 'Temps total tapé']
    ];
    stats.forEach(function (s) {
      var d = document.createElement('div');
      d.className = 'stat-card';
      d.innerHTML = '<span class="stat-num">' + s[0] + '</span><span class="stat-lab">' + s[1] + '</span>';
      cards.appendChild(d);
    });
    drawLineChart(els['stats-chart'], h.slice(0, 30).reverse().map(function (r) { return r.wpm; }), '#a78bfa');
    renderHeatmap();
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

  /* ---------- câblage de l'accueil ---------- */
  function wireHome() {
    document.querySelectorAll('.mode-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.chip')) return;
        selectMode(card.dataset.mode);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.target.closest('.chip')) { e.preventDefault(); selectMode(card.dataset.mode); }
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

    els['btn-start'].addEventListener('click', startSession);
    els['opt-keyboard'].addEventListener('change', function (e) {
      ui.showKb = e.target.checked;
      saveSettings();
    });
  }

  function selectMode(mode) {
    ui.mode = mode;
    document.querySelectorAll('.mode-card').forEach(function (c) { c.classList.toggle('active', c.dataset.mode === mode); });
  }

  function saveSettings() {
    lsSet(LS_SETTINGS, { sound: ui.sound, showKb: ui.showKb });
  }

  function wireChrome() {
    els['logo-home'].addEventListener('click', function () { stopTimers(); els['results-modal'].hidden = true; showView('home'); });
    els['btn-stats'].addEventListener('click', function () { showView('stats'); });
    els['btn-stats-back'].addEventListener('click', function () { showView('home'); });
    els['btn-quit'].addEventListener('click', function () { stopTimers(); showView('home'); });
    els['btn-again'].addEventListener('click', function () { startSession(); });
    els['btn-home'].addEventListener('click', function () { els['results-modal'].hidden = true; showView('home'); });
    els['btn-sound'].addEventListener('click', function () {
      ui.sound = !ui.sound;
      els['btn-sound'].textContent = ui.sound ? '🔊 Son' : '🔇 Son muet';
      els['btn-sound'].classList.toggle('off', !ui.sound);
      els['btn-sound'].setAttribute('aria-pressed', String(ui.sound));
      saveSettings();
      if (ui.sound) sfx('ok');
    });
    els['btn-clear-history'].addEventListener('click', function () {
      if (window.confirm('Effacer tout ton historique et tes statistiques d\'erreurs ?')) {
        lsSet(LS_HISTORY, []); lsSet(LS_ERRORS, {});
        renderStats(); renderBestStrip();
      }
    });
    document.addEventListener('keydown', onKeyDown);
  }

  function init() {
    cacheEls();
    var settings = lsGet(LS_SETTINGS, {});
    ui.sound = settings.sound !== false;
    ui.showKb = settings.showKb !== false;
    els['opt-keyboard'].checked = ui.showKb;
    els['btn-sound'].textContent = ui.sound ? '🔊 Son' : '🔇 Son muet';
    els['btn-sound'].classList.toggle('off', !ui.sound);

    buildFingerLegend();
    buildKeyboard(els['keyboard'], kbMap);
    wireHome();
    wireChrome();
    renderBestStrip();
    showView('home');
  }

  /* ---------------- exports pour tests Node ---------------- */
  globalThis.KTQ = {
    normalize: normalize, genKeys: genKeys, genWords: genWords, genPhrases: genPhrases,
    generateText: generateText, computeWpm: computeWpm, computeAcc: computeAcc,
    fmtTime: fmtTime, charToCode: charToCode, fingerOfCode: fingerOfCode,
    KB_ROWS: KB_ROWS, FINGERS: FINGERS, wordPool: wordPool
  };

  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
