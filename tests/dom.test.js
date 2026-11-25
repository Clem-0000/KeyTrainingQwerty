// Test d'intégration : exécute app.js avec un shim DOM minimal et simule le parcours gamifié.
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
    const key = attr[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (String(el.dataset[key]) !== attr[2]) return false;
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
    this._handlers = {}; this.hidden = false; this.checked = false; this.onclick = null;
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
  set innerHTML(v) {
    this._html = v;
    if (v === '') {
      // comme un vrai navigateur : les descendants disparaissent du document
      const doomed = new Set();
      const collect = (e) => { e.children.forEach(c => { doomed.add(c); collect(c); }); };
      collect(this);
      this.children = [];
      for (let i = registry.length - 1; i >= 0; i--) if (doomed.has(registry[i])) registry.splice(i, 1);
    }
  }
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
  fire(t, ev) {
    ev = ev || {}; ev.target = ev.target || this;
    ev.preventDefault = ev.preventDefault || (() => {});
    ev.stopPropagation = ev.stopPropagation || (() => {});
    (this._handlers[t] || []).forEach(fn => fn(ev));
    if (t === 'click' && typeof this.onclick === 'function') this.onclick(ev);
  }
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

const ids = ['view-cours','view-libre','view-train','view-stats','lesson-map','cours-progress','cours-progress-label','map-hint','btn-continue','train-context','text-display','keyboard','keyboard-heat','finger-legend','kb-zone','hud-wpm','hud-acc','hud-err','hud-time','progress-bar','btn-start-free','btn-sound','btn-quit','logo-home','results-modal','res-stars','res-xp','res-wpm','res-acc','res-err','res-chars','res-time','res-chart','res-sub','res-title','record-banner','levelup-banner','levelup-n','res-badges','btn-next','btn-again','btn-home','lesson-modal','lesson-newkeys','lesson-name','lesson-desc','lesson-best','btn-lesson-start','btn-lesson-back','stats-cards','stats-chart','stats-level','badges-grid','btn-clear-history','opt-keyboard','hdr-level','hdr-xpfill','hdr-stars','hdr-stars-max','hdr-streak','toast'];
ids.forEach(id => reg(el('div', id)));
['view-libre', 'view-train', 'view-stats', 'results-modal', 'lesson-modal', 'toast'].forEach(id => { byId[id].hidden = true; });
byId['res-chart'].attrs.height = '110'; byId['stats-chart'].attrs.height = '180';
byId['map-hint'].hidden = false;
// étoiles de la modale résultats (3 spans .star enfants de res-stars)
[1, 2, 3].forEach(s => { const st = el('span', null, 'star'); st.dataset.s = String(s); byId['res-stars'].appendChild(st); });

// onglets
const tabs = ['cours', 'libre', 'stats'].map(v => { const t = el('button', null, 'nav-btn tab' + (v === 'cours' ? ' active' : '')); t.dataset.view = v; return t; });
// cartes de mode libre
const langFr = el('button', null, 'chip lang-chip active'); langFr.dataset.lang = 'fr';
const langEn = el('button', null, 'chip lang-chip'); langEn.dataset.lang = 'en';
const modeDefs = [
  { mode: 'words', levels: [{ level: 'easy', active: true }, { level: 'normal' }, { level: 'hard' }] },
  { mode: 'phrases', levels: [] },
  { mode: 'keys', levels: [{ level: 'home', active: true }, { level: 'top' }, { level: 'all' }] },
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
function typeAll() {
  const text = byId['text-display'].children.map(c => c.textContent).join('');
  for (let i = 0; i < text.length; i++) fireKey(text[i], KTQ.charToCode(text[i]));
  return text;
}

/* ---------- charge l'app ---------- */
for (const f of ['js/words-fr.js', 'js/words-en.js', 'js/lessons.js', 'js/app.js']) {
  eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
}
const KTQ = globalThis.KTQ;

let failures = 0;
function ok(cond, label) { if (cond) console.log('  PASS', label); else { failures++; console.error('  FAIL', label); } }
const game = () => JSON.parse(store['ktq_game'] || '{}');

const lessonCards = () => registry.filter(e => e.classList.contains('lesson-card'));

console.log('== init : carte des leçons ==');
ok(byId['view-cours'].hidden === false, 'vue Cours visible par défaut');
ok(lessonCards().length === KTQ.LESSONS.length, `carte = ${KTQ.LESSONS.length} leçons`);
ok(registry.filter(e => e.classList.contains('unit-head')).length === 6, '6 unités de cours affichées');
ok(byId['btn-continue'].hidden === false && byId['btn-continue'].textContent.includes('Leçon 1'), 'bouton Continuer -> Leçon 1: ' + byId['btn-continue'].textContent);
const card0 = lessonCards()[0], card1 = lessonCards()[1];
ok(card0.classList.contains('current') && !card0.classList.contains('locked'), 'leçon 1 brillante et débloquée');
ok(card1.classList.contains('locked'), 'leçon 2 verrouillée au départ');
ok(byId['hdr-level'].textContent === '1', 'niveau 1 au départ');
ok(byId['hdr-stars-max'].textContent === String(KTQ.LESSONS.length * 3), 'total étoiles max affiché');
ok(byId['keyboard'].children.length === 5, 'clavier 5 rangées');
ok(byId['finger-legend'].children.length === 9, 'légende 9 doigts');

console.log('== leçon 1 : modale -> jeu -> résultats avec étoiles ==');
card0.click();
ok(byId['lesson-modal'].hidden === false, 'modale de leçon ouverte');
ok(byId['lesson-name'].textContent.includes('Leçon 1'), 'nom de leçon affiché: ' + byId['lesson-name'].textContent);
ok(byId['lesson-newkeys'].children.length === 2, '2 nouvelles touches affichées (F, J)');
byId['btn-lesson-start'].click();
ok(byId['lesson-modal'].hidden === true && byId['view-train'].hidden === false, 'session lancée');
ok(byId['train-context'].textContent.includes('Leçon 1'), 'bannière de contexte: ' + byId['train-context'].textContent);
ok(byId['text-display'].children.length > 50, 'texte de leçon généré');
ok(/^[fj ]+$/.test(byId['text-display'].children.map(c => c.textContent).join('')), 'leçon 1 = uniquement f/j/espaces');
const t1 = typeAll();
ok(byId['results-modal'].hidden === false, 'modale de résultats affichée');
ok(byId['res-stars'].hidden === false, 'ligne d\'étoiles visible (mode leçon)');
ok(byId['res-acc'].textContent === '100%', 'précision 100% en tapant juste');
ok(game().stars && game().stars.l01 === 3, '3 étoiles enregistrées pour l01: ' + JSON.stringify(game().stars));
ok(game().xp > 0, 'XP gagnée: ' + game().xp);
ok(byId['res-xp'].textContent.includes('XP'), 'XP affichée: ' + byId['res-xp'].textContent);
ok(byId['btn-next'].hidden === false && byId['btn-next'].textContent.includes('Leçon suivante'), 'bouton leçon suivante proposé');
ok(byId['hdr-stars'].textContent === '3', 'header: 3 étoiles');
ok(game().totalSessions === 1 && game().streak.count === 1, 'session comptée + série = 1 jour');
ok(Object.keys(game().badges).includes('first'), 'badge Première frappe débloqué');
const hist1 = JSON.parse(store['ktq_history']);
ok(hist1.length === 1 && hist1[0].mode === 'lesson:l01', 'session enregistrée (lesson:l01)');

console.log('== leçon suivante débloquée ==');
byId['btn-next'].click();
ok(byId['view-train'].hidden === false && byId['train-context'].textContent.includes('Leçon 2'), 'leçon 2 lancée via bouton');
const t2 = typeAll();
ok(game().stars.l02 >= 1, 'leçon 2 terminée, étoiles enregistrées');
byId['btn-home'].click();
ok(byId['view-cours'].hidden === false, 'retour à la carte des leçons');
ok(lessonCards()[0].classList.contains('done'), 'leçon 1 marquée terminée');
ok(!lessonCards()[2].classList.contains('locked'), 'leçon 3 débloquée après 1★ sur l02');
ok(byId['cours-progress-label'].textContent.includes('2 /'), 'progression 2/21 affichée: ' + byId['cours-progress-label'].textContent);

console.log('== faute bloquante en leçon (style TypingClub) ==');
lessonCards()[2].click();
byId['btn-lesson-start'].click();
const before = byId['text-display'].children[0].textContent;
const wrong = before === 'a' ? 'z' : 'a';
fireKey(wrong, KTQ.charToCode(wrong));
ok(byId['hud-err'].textContent === '1', 'erreur comptée');
ok(byId['results-modal'].hidden === true, 'pas de fin prématurée');
ok(byId['text-display'].children[0].classList.contains('bad') && !byId['text-display'].children[0].classList.contains('ok'), 'caractère attendu marqué en rouge');
ok(byId['text-display'].children[0].classList.contains('cursor') && !byId['text-display'].children[1].classList.contains('cursor'), 'le curseur N\'AVANCE PAS sur une faute (bloquant)');
fireKey(before, KTQ.charToCode(before));
ok(byId['text-display'].children[0].classList.contains('ok'), 'la bonne touche valide et fait avancer');
ok(byId['text-display'].children[1].classList.contains('cursor'), 'curseur avancé après la bonne touche');
byId['btn-quit'].click();
ok(byId['view-cours'].hidden === false, 'quitter retourne à la carte');
ok(byId['btn-continue'].textContent.includes('Leçon 3'), 'Continuer pointe vers la leçon 3: ' + byId['btn-continue'].textContent);

console.log('== mode libre ==');
tabs.find(t => t.dataset.view === 'libre').click();
ok(byId['view-libre'].hidden === false, 'vue Libre affichée');
byId['btn-start-free'].click();
ok(byId['view-train'].hidden === false && byId['train-context'].textContent.includes('Libre'), 'session libre lancée');
const t3 = typeAll();
ok(byId['results-modal'].hidden === false, 'résultats session libre');
ok(byId['res-stars'].hidden === true, 'pas d\'étoiles en mode libre');
ok(JSON.parse(store['ktq_history']).length === 3, '3 sessions dans l\'historique');
byId['btn-home'].click();

console.log('== progression (stats + badges) ==');
tabs.find(t => t.dataset.view === 'stats').click();
ok(byId['view-stats'].hidden === false, 'vue Progression affichée');
ok(byId['stats-cards'].children.length === 8, '8 cartes de stats');
ok(byId['badges-grid'].children.length === KTQ.BADGES.length, 'tous les badges rendus (' + KTQ.BADGES.length + ')');
ok(byId['badges-grid'].children.filter(c => c.classList.contains('earned')).length >= 1, 'au moins 1 badge gagné affiché');
ok(byId['keyboard-heat'].children.length === 5, 'heatmap rendue');
ok(byId['stats-level'].textContent === byId['hdr-level'].textContent, 'niveau cohérent header/stats');

console.log('== options ==');
byId['btn-sound'].click();
ok(byId['btn-sound'].classList.contains('off') && game().settings.sound === false, 'son coupé et persisté');
byId['opt-keyboard'].checked = false;
byId['opt-keyboard'].fire('change', { target: byId['opt-keyboard'] });
tabs.find(t => t.dataset.view === 'libre').click();
byId['btn-start-free'].click();
ok(byId['kb-zone'].style.display === 'none', 'clavier masqué via option');
byId['btn-quit'].click();

console.log('== raccourcis : Continuer et Entrée sur la carte ==');
tabs.find(t => t.dataset.view === 'cours').click();
ok(byId['view-cours'].hidden === false, 'retour sur la carte des leçons');
byId['btn-continue'].click();
ok(byId['view-train'].hidden === false && byId['lesson-modal'].hidden === true && byId['train-context'].textContent.includes('Leçon 3'), 'Continuer lance la leçon 3 directement (sans modale): ' + byId['train-context'].textContent);
byId['btn-quit'].click();
fireKey('Enter', 'Enter');
ok(byId['view-train'].hidden === false && byId['train-context'].textContent.includes('Leçon 3'), 'Entrée lance aussi la prochaine leçon à faire');
byId['btn-quit'].click();

console.log(failures === 0 ? '\n✅ TEST DOM: TOUT PASSE' : `\n❌ ${failures} ÉCHEC(S)`);
process.exit(failures ? 1 : 0);
