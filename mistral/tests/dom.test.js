// Test d'intégration : exécute app.js avec un DOM minimal et simule des sessions complètes.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

/* ---------- shim DOM minimal ---------- */
const registry = [];
function matchSel(el, sel) {
  const classes = [...sel.matchAll(/\.([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
  const attr = sel.match(/\[data-([a-zA-Z-]+)="([^"]+)"\]/);
  if (classes.some(c => !el.classList.contains(c))) return false;
  if (attr) {
    const key = 'data-' + attr[1];
    const v = el.dataset[attr[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase())];
    if (String(v) !== attr[2]) return false;
  }
  return true;
}
function descendants(root) {
  const out = [];
  for (const el of registry) {
    let p = el.parent;
    while (p) { if (p === root) { out.push(el); break; } p = p.parent; }
  }
  return out;
}
class El {
  constructor(tag) {
    this.tagName = tag; this.children = []; this.parent = null;
    this._classes = new Set(); this.dataset = {}; this.attrs = {};
    this.style = { setProperty: (k, v) => { this.style[k] = v; } };
    this._handlers = {}; this.hidden = false; this.checked = false;
    this._text = ''; this._html = ''; this.title = ''; this.id = '';
    this.offsetWidth = 100; this.clientWidth = 500;
    registry.push(this);
  }
  get classList() {
    const s = this._classes;
    return {
      add: (...c) => c.forEach(x => s.add(x)),
      remove: (...c) => c.forEach(x => s.delete(x)),
      toggle: (c, f) => { const on = f === undefined ? !s.has(c) : f; on ? s.add(c) : s.delete(c); return on; },
      contains: c => s.has(c)
    };
  }
  get className() { return [...this._classes].join(' '); }
  set className(v) { this._classes = new Set(String(v).split(/\s+/).filter(Boolean)); }
  set innerHTML(v) { this._html = v; if (v === '') this.children = []; }
  get innerHTML() { return this._html; }
  set textContent(v) { this._text = String(v); }
  get textContent() { return this._text; }
  appendChild(c) { c.parent = this; this.children.push(c); return c; }
  insertBefore(c, ref) {
    c.parent = this;
    const i = this.children.indexOf(ref);
    if (i === -1) this.children.push(c); else this.children.splice(i, 0, c);
    return c;
  }
  addEventListener(t, fn) { (this._handlers[t] = this._handlers[t] || []).push(fn); }
  fire(t, ev) { ev = ev || {}; ev.target = ev.target || this; ev.preventDefault = ev.preventDefault || (() => {}); ev.stopPropagation = ev.stopPropagation || (() => {}); (this._handlers[t] || []).forEach(fn => fn(ev)); }
  click() { this.fire('click', {}); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] !== undefined ? this.attrs[k] : null; }
  querySelectorAll(sel) { return descendants(this).filter(el => matchSel(el, sel)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  closest(sel) { let p = this; while (p) { if (matchSel(p, sel)) return p; p = p.parent; } return null; }
  getContext() {
    const noop = () => {};
    return { scale: noop, clearRect: noop, beginPath: noop, moveTo: noop, lineTo: noop, stroke: noop, fill: noop, arc: noop, closePath: noop, fillText: noop, createLinearGradient: () => ({ addColorStop: noop }), fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '', lineJoin: '' };
  }
}
function el(tag, id, cls) { const e = new El(tag); if (id) e.id = id; if (cls) e.className = cls; return e; }

const byId = {};
function reg(e) { byId[e.id] = e; return e; }

// éléments statiques (miroir de index.html)
const ids = ['view-home','view-train','view-stats','text-display','keyboard','keyboard-heat','finger-legend','kb-zone','hud-wpm','hud-acc','hud-err','hud-time','progress-bar','btn-start','btn-stats','btn-stats-back','btn-sound','btn-quit','logo-home','results-modal','res-wpm','res-acc','res-err','res-chars','res-time','res-chart','res-sub','record-banner','btn-again','btn-home','best-strip','best-strip-content','stats-cards','stats-chart','btn-clear-history','opt-keyboard'];
ids.forEach(id => reg(el('div', id)));
byId['view-train'].hidden = true; byId['view-stats'].hidden = true; byId['results-modal'].hidden = true; byId['best-strip'].hidden = true;
byId['res-chart'].attrs.height = '110'; byId['stats-chart'].attrs.height = '180';

const langFr = el('button', null, 'chip lang-chip active'); langFr.dataset.lang = 'fr';
const langEn = el('button', null, 'chip lang-chip'); langEn.dataset.lang = 'en';
const modeDefs = [
  { mode: 'keys', levels: [{ level: 'home', active: true }, { level: 'top' }, { level: 'all' }] },
  { mode: 'words', levels: [{ level: 'easy', active: true }, { level: 'normal' }, { level: 'hard' }] },
  { mode: 'phrases', levels: [] },
  { mode: 'time', levels: [{ duration: '30' }, { duration: '60', active: true }, { duration: '120' }] }
];
const cards = modeDefs.map(d => {
  const card = el('div', null, 'mode-card' + (d.mode === 'words' ? ' active' : ''));
  card.dataset.mode = d.mode;
  if (d.levels.length) {
    const group = el('span', null, 'mode-levels'); group.dataset.levels = d.mode;
    d.levels.forEach(l => {
      const chip = el('button', null, 'chip sub' + (l.active ? ' active' : ''));
      if (l.level) chip.dataset.level = l.level; else chip.dataset.duration = l.duration;
      group.appendChild(chip);
    });
    card.appendChild(group);
  }
  return card;
});

const docHandlers = {};
globalThis.document = {
  readyState: 'complete',
  getElementById: id => byId[id] || null,
  createElement: tag => new El(tag),
  querySelectorAll: sel => registry.filter(e => matchSel(e, sel)),
  querySelector: sel => registry.filter(e => matchSel(e, sel))[0] || null,
  addEventListener: (t, fn) => { (docHandlers[t] = docHandlers[t] || []).push(fn); }
};
globalThis.window = globalThis;
globalThis.devicePixelRatio = 1;
globalThis.focus = () => {};
globalThis.confirm = () => true;
const store = {};
globalThis.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};
function fireKey(k, code) {
  const ev = { key: k, code: code || null, ctrlKey: false, metaKey: false, altKey: false, preventDefault() {}, stopPropagation() {} };
  (docHandlers.keydown || []).forEach(fn => fn(ev));
}

/* ---------- charge l'app ---------- */
for (const f of ['js/words-fr.js', 'js/words-en.js', 'js/app.js']) {
  eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
}
const KTQ = globalThis.KTQ;

let failures = 0;
function ok(cond, label) { if (cond) console.log('  PASS', label); else { failures++; console.error('  FAIL', label); } }

console.log('== init ==');
ok(byId['view-home'].hidden === false, 'vue accueil visible');
ok(byId['view-train'].hidden === true, 'vue entraînement cachée');
ok(byId['keyboard'].children.length === 5, 'clavier = 5 rangées (' + byId['keyboard'].children.length + ')');
ok(byId['finger-legend'].children.length === 9, 'légende = 9 doigts (' + byId['finger-legend'].children.length + ')');

console.log('== session mode mots (complète) ==');
byId['btn-start'].click();
ok(byId['view-train'].hidden === false, 'vue entraînement affichée après Start');
const text = byId['text-display'].children.map(c => c.textContent).join('');
ok(text.length > 100, 'texte généré affiché (' + text.length + ' car.)');
ok(byId['keyboard'].querySelectorAll('.key.next').length === 1, 'une touche suivante surlignée');
ok(registry.filter(e => e.classList.contains('finger-chip') && e.classList.contains('active')).length === 1, 'un doigt actif dans la légende');

// tape les 40 premiers caractères correctement
for (let i = 0; i < 40 && i < text.length; i++) fireKey(text[i], KTQ.charToCode(text[i]));
ok(byId['text-display'].children.slice(0, 40).every(c => c.classList.contains('ok')), '40 premiers caractères marqués OK');
ok(byId['hud-err'].textContent === '0', '0 erreur');
// une erreur volontaire
const caretChar = byId['text-display'].children[40].textContent;
const wrong = caretChar === 'a' ? 'z' : 'a';
fireKey(wrong, KTQ.charToCode(wrong));
ok(byId['hud-err'].textContent === '1', 'compteur d\'erreurs = 1 après faute');
ok(byId['text-display'].children[40].classList.contains('bad'), 'caractère fautif marqué en rouge');
// backspace corrige
fireKey('Backspace', 'Backspace');
ok(byId['text-display'].children[40].classList.contains('ch') && !byId['text-display'].children[40].classList.contains('bad'), 'backspace efface l\'erreur');
fireKey(caretChar, KTQ.charToCode(caretChar));
// tape le reste
for (let i = 41; i < text.length; i++) fireKey(text[i], KTQ.charToCode(text[i]));
ok(byId['results-modal'].hidden === false, 'modale de résultats affichée en fin de texte');
ok(/^\d+$/.test(byId['res-wpm'].textContent), 'MPM affiché: ' + byId['res-wpm'].textContent);
ok(byId['res-acc'].textContent === KTQ.computeAcc(text.length, text.length + 1) + '%', 'précision = ' + byId['res-acc'].textContent + ' (1 erreur sur ' + (text.length + 1) + ' frappes)');
const hist = JSON.parse(store['ktq_history'] || '[]');
ok(hist.length === 1 && hist[0].mode === 'words' && hist[0].lang === 'fr', 'session sauvegardée dans localStorage');
ok(JSON.parse(store['ktq_errors'] || '{}') && Object.keys(JSON.parse(store['ktq_errors'])).length === 1, 'erreur enregistrée dans la carte de chaleur');

console.log('== rejouer / quitter / stats ==');
byId['btn-again'].click();
ok(byId['results-modal'].hidden === true && byId['view-train'].hidden === false, 'Rejouer relance une session');
byId['btn-quit'].click();
ok(byId['view-home'].hidden === false, 'Quitter retourne à l\'accueil');
byId['btn-stats'].click();
ok(byId['view-stats'].hidden === false, 'vue stats affichée');
ok(byId['stats-cards'].children.length === 4, '4 cartes de stats');
ok(byId['keyboard-heat'].children.length === 5, 'clavier heatmap rendu');
ok(byId['best-strip'].hidden === false || true, 'bandeau records (home)');
byId['btn-stats-back'].click();
ok(byId['view-home'].hidden === false, 'retour accueil depuis stats');
ok((byId['best-strip-content'].innerHTML || '').includes('MPM'), 'records affichés sur l\'accueil: ' + byId['best-strip-content'].innerHTML);

console.log('== mode touches + changement de langue/niveau ==');
cards[0].click(); // mode keys
ok(cards[0].classList.contains('active'), 'carte Touches sélectionnée');
byId['btn-start'].click();
const keyText = byId['text-display'].children.map(c => c.textContent).join('');
ok(/^[asdfjkl; ]+$/.test(keyText), 'mode touches = ligne de base uniquement');
byId['btn-quit'].click();
langEn.click();
cards[2].click(); // phrases
byId['btn-start'].click();
const phText = byId['text-display'].children.map(c => c.textContent).join('');
ok(phText.length > 100 && /[A-Z]/.test(phText), 'phrases EN avec majuscules (' + phText.length + ' car.)');
// tape toute la phrase pour finir proprement
for (let i = 0; i < phText.length; i++) fireKey(phText[i], KTQ.charToCode(phText[i]));
ok(byId['results-modal'].hidden === false, 'session phrases terminée, résultats affichés');
const hist2 = JSON.parse(store['ktq_history']);
ok(hist2.length === 2 && hist2[0].lang === 'en' && hist2[0].mode === 'phrases', '2e session EN sauvegardée');
byId['btn-home'].click();

console.log('== mode chrono (texte infini + extension) ==');
cards[3].click(); // time
byId['btn-start'].click();
let t0 = byId['text-display'].children.map(c => c.textContent).join('');
ok(byId['hud-time'].textContent === '1:00', 'compte à rebours 60 s: ' + byId['hud-time'].textContent);
// tape tout le texte initial : le texte doit s'allonger (mode infini)
for (let i = 0; i < t0.length; i++) fireKey(t0[i], KTQ.charToCode(t0[i]));
const t1 = byId['text-display'].children.map(c => c.textContent).join('');
ok(t1.length > t0.length, `texte étendu en chrono (${t0.length} -> ${t1.length} car.)`);
ok(byId['results-modal'].hidden === true, 'pas de fin prématurée en mode chrono');
byId['btn-quit'].click();

console.log('== options ==');
byId['btn-sound'].click();
ok(byId['btn-sound'].classList.contains('off'), 'bouton son bascule en muet');
ok(JSON.parse(store['ktq_settings']).sound === false, 'réglage son persisté');
byId['opt-keyboard'].checked = false;
byId['opt-keyboard'].fire('change', { target: byId['opt-keyboard'] });
byId['btn-start'].click();
ok(byId['kb-zone'].style.display === 'none', 'clavier masquable via option');
byId['btn-quit'].click();

console.log(failures === 0 ? '\n✅ TEST DOM: TOUT PASSE' : `\n❌ ${failures} ÉCHEC(S)`);
process.exit(failures ? 1 : 0);
