// Tests unitaires de la logique pure de KeyTrain (exécutés en Node, sans DOM)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

for (const f of ['js/words-fr.js', 'js/words-en.js', 'js/app.js']) {
  eval(fs.readFileSync(path.join(ROOT, f), 'utf8'));
}
const KTQ = globalThis.KTQ;

let failures = 0;
function eq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) console.log('  PASS', label);
  else { failures++; console.error('  FAIL', label, '\n    attendu:', e, '\n    reçu:   ', a); }
}
function ok(cond, label) { eq(!!cond, true, label); }

console.log('== normalize ==');
eq(KTQ.normalize('école à ç, œuvre sœur Æther'), 'ecole a c, oeuvre soeur Aether', 'accents/ligatures retirés');

console.log('== génération ==');
for (const level of ['home', 'top', 'all']) {
  const t = KTQ.genKeys(level);
  ok(t.length >= 100, `genKeys(${level}) longueur >= 100 (${t.length})`);
  ok(/^[a-z0-9;,\.\/ ]+$/.test(t), `genKeys(${level}) uniquement des caractères tapables`);
}
const wEasy = KTQ.genWords('fr', 'easy', 60).split(' ');
eq(wEasy.length, 60, 'genWords 60 mots');
ok(wEasy.every(w => /^[a-z']+$/.test(w) && w.length <= 5), 'mots faciles FR: minuscules, sans accent, <= 5 lettres (apostrophe autorisée)');
const wHard = KTQ.genWords('en', 'hard', 30).split(' ');
ok(wHard.every(w => w.length >= 7), 'mots difficiles EN: >= 7 lettres');
const wTime = KTQ.genWords('fr', 'normal', 90).split(' ');
eq(wTime.length, 90, 'mode chrono: 90 mots générés');
const phFr = KTQ.genPhrases('fr');
ok(!/[̀-ͯœæ]/.test(phFr), 'phrases FR normalisées (aucun accent/ligature)');
ok(phFr.length > 200, 'phrases FR assez longues');
const phEn = KTQ.genPhrases('en');
ok(phEn.includes('quick brown fox') || phEn.length > 100, 'phrases EN présentes');

console.log('== chaque caractère généré a une touche QWERTY (surbrillance) ==');
for (const mode of ['keys', 'words', 'phrases', 'time']) {
  for (const level of ['home', 'top', 'all', 'easy', 'normal', 'hard']) {
    const t = KTQ.generateText(mode, { lang: 'fr', level });
    const missing = [...new Set(t.split('').filter(c => !KTQ.charToCode(c)))];
    eq(missing, [], `mode=${mode} level=${level}: tous les caractères mappés (manquants: ${missing.join('')})`);
  }
}

console.log('== métriques ==');
eq(KTQ.computeWpm(300, 60), 60, '300 caractères justes en 60 s = 60 MPM');
eq(KTQ.computeWpm(0, 0), 0, 'WPM sans temps = 0 (pas de division par zéro)');
eq(KTQ.computeWpm(250, 30), 100, '250 car. en 30 s = 100 MPM');
eq(KTQ.computeAcc(95, 100), 95, 'précision 95/100');
eq(KTQ.computeAcc(0, 0), 100, 'précision sans frappe = 100');
eq(KTQ.fmtTime(0), '0:00', 'fmtTime 0');
eq(KTQ.fmtTime(65), '1:05', 'fmtTime 65 s');
eq(KTQ.fmtTime(754), '12:34', 'fmtTime 754 s');

console.log('== clavier QWERTY ==');
eq(KTQ.charToCode('a'), 'KeyA', 'a -> KeyA');
eq(KTQ.charToCode('A'), 'KeyA', 'A -> KeyA (majuscule)');
eq(KTQ.charToCode(' '), 'Space', 'espace -> Space');
eq(KTQ.charToCode('?'), 'Slash', '? -> Slash');
eq(KTQ.charToCode(';'), 'Semicolon', '; -> Semicolon');
eq(KTQ.charToCode('ç'), null, 'ç non mappé (normalisé avant génération)');
eq(KTQ.fingerOfCode('KeyF'), 'li', 'F = index gauche');
eq(KTQ.fingerOfCode('KeyJ'), 'ri', 'J = index droit');
eq(KTQ.fingerOfCode('Space'), 'th', 'Espace = pouces');
eq(KTQ.fingerOfCode('KeyQ'), 'lp', 'Q = auriculaire gauche');
const fingerIds = new Set(KTQ.FINGERS.map(f => f.id));
let allValid = true;
KTQ.KB_ROWS.flat().forEach(k => { if (!fingerIds.has(k.f)) allValid = false; });
ok(allValid, 'toutes les touches ont un doigt valide');
const codes = KTQ.KB_ROWS.flat().map(k => k.c);
eq(new Set(codes).size, codes.length, 'codes de touches uniques');
// chaque doigt couvre bien la ligne de base attendue
eq(KTQ.fingerOfCode('KeyA'), 'lp', 'A = auriculaire G');
eq(KTQ.fingerOfCode('KeyS'), 'lr', 'S = annulaire G');
eq(KTQ.fingerOfCode('KeyD'), 'lm', 'D = majeur G');
eq(KTQ.fingerOfCode('KeyL'), 'rr', 'L = annulaire D');
eq(KTQ.fingerOfCode('Semicolon'), 'rp', '; = auriculaire D');

console.log('== listes de données ==');
ok(globalThis.WORDS_FR.length > 150, `WORDS_FR conséquent (${globalThis.WORDS_FR.length} mots)`);
ok(globalThis.WORDS_EN.length > 150, `WORDS_EN conséquent (${globalThis.WORDS_EN.length} mots)`);
ok(globalThis.PHRASES_FR.length >= 20, `PHRASES_FR (${globalThis.PHRASES_FR.length})`);
ok(globalThis.PHRASES_EN.length >= 20, `PHRASES_EN (${globalThis.PHRASES_EN.length})`);

console.log(failures === 0 ? '\n✅ TOUS LES TESTS PASSENT' : `\n❌ ${failures} ÉCHEC(S)`);
process.exit(failures === 0 ? 0 : 1);
