// Tests unitaires de la logique pure de KeyTrain (exécutés en Node, sans DOM)
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

for (const f of ['js/words-fr.js', 'js/words-en.js', 'js/lessons.js', 'js/app.js']) {
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

console.log('== cours gamifié ==');
eq(KTQ.LESSONS.length, 21, '21 leçons dans le cours');
eq(new Set(KTQ.LESSONS.map(l => l.id)).size, KTQ.LESSONS.length, 'ids de leçons uniques');
KTQ.LESSONS.forEach((l, i) => {
  ok(!!l.name && !!l.desc && !!l.type, `leçon ${l.id}: nom/desc/type présents`);
  const badChars = [...new Set(l.set.split('').filter(c => c !== ' ' && !KTQ.charToCode(c)))];
  eq(badChars, [], `leçon ${l.id}: tous les caractères du set sont tapables sur QWERTY`);
  for (const lang of ['fr', 'en']) {
    const t = KTQ.genLessonText(l, lang);
    ok(t.length > 20, `leçon ${l.id} (${lang}): texte généré (${t.length} car.)`);
    const missing = [...new Set(t.split('').filter(c => !KTQ.charToCode(c)))];
    eq(missing, [], `leçon ${l.id} (${lang}): tous les caractères générés mappés (manquants: ${missing.join('')})`);
  }
});
// progression pédagogique : chaque leçon n'utilise que des touches déjà vues (set croissant)
for (let i = 1; i < KTQ.LESSONS.length; i++) {
  const prev = KTQ.LESSONS[i - 1].set, cur = KTQ.LESSONS[i].set;
  if (cur !== 'all' && prev !== 'all') {
    const newChars = [...cur].filter(c => !prev.includes(c));
    ok(newChars.length <= 6, `leçon ${KTQ.LESSONS[i].id}: introduit au plus 6 nouveaux caractères (${newChars.join('')})`);
  }
}
// étoiles
eq(KTQ.starsFor(100), 3, '100% -> 3 étoiles');
eq(KTQ.starsFor(95), 3, '95% -> 3 étoiles');
eq(KTQ.starsFor(94), 2, '94% -> 2 étoiles');
eq(KTQ.starsFor(85), 2, '85% -> 2 étoiles');
eq(KTQ.starsFor(84), 1, '84% -> 1 étoile');
eq(KTQ.starsFor(70), 1, '70% -> 1 étoile');
eq(KTQ.starsFor(69), 0, '69% -> 0 étoile (rejouer)');
// niveaux / XP
eq(KTQ.playerLevel(0), 1, '0 XP -> niveau 1');
eq(KTQ.playerLevel(99), 1, '99 XP -> niveau 1');
eq(KTQ.playerLevel(100), 2, '100 XP -> niveau 2');
eq(KTQ.playerLevel(400), 3, '400 XP -> niveau 3');
eq(KTQ.xpBounds(0), [0, 100, 1], 'xpBounds(0)');
eq(KTQ.xpBounds(250), [100, 400, 2], 'xpBounds(250)');
// déblocage des leçons
eq(KTQ.isUnlocked({}, 0), true, 'leçon 1 toujours débloquée');
eq(KTQ.isUnlocked({}, 1), false, 'leçon 2 verrouillée sans étoile');
eq(KTQ.isUnlocked({ l01: 1 }, 1), true, 'leçon 2 débloquée avec 1 étoile sur l01');
eq(KTQ.isUnlocked({ l01: 3 }, 1), true, 'leçon 2 débloquée avec 3 étoiles');
eq(KTQ.isUnlocked({ l01: 1 }, 2), false, 'leçon 3 encore verrouillée');
eq(KTQ.totalStars({ l01: 3, l02: 2 }), 5, 'totalStars');
// série de jours
eq(KTQ.nextStreak({ last: KTQ.dayStr(), count: 4 }), { last: KTQ.dayStr(), count: 4 }, 'même jour: série inchangée');
const y = new Date(); y.setDate(y.getDate() - 1);
const yStr = KTQ.dayStr(y);
eq(KTQ.nextStreak({ last: yStr, count: 4 }).count, 5, 'veille: série +1');
eq(KTQ.nextStreak({ last: '2000-01-01', count: 9 }).count, 1, 'trou: série remise à 1');
eq(KTQ.nextStreak({ last: null, count: 0 }).count, 1, 'première session: série = 1');
// badges
eq(KTQ.BADGES.length, 13, '13 badges définis');
ok(KTQ.BADGES.every(b => b.id && b.icon && b.name && b.desc && typeof b.test === 'function'), 'chaque badge a id/icone/nom/desc/test');
const G1 = KTQ.defaultGame();
let earned = KTQ.checkBadges(G1, null);
eq(earned.length, 0, 'aucun badge sans session');
G1.totalSessions = 1;
earned = KTQ.checkBadges(G1, null);
ok(earned.some(b => b.id === 'first'), 'badge "Première frappe" après 1 session');
earned = KTQ.checkBadges(G1, { acc: 100, wpm: 85, chars: 120, mode: 'words', lang: 'fr' });
ok(earned.some(b => b.id === 'flawless') && earned.some(b => b.id === 'fast80'), 'badges Sans faute + Éclair avec ctx 100%/85MPM');
earned = KTQ.checkBadges(G1, { acc: 90, wpm: 10, chars: 5, mode: 'words', lang: 'fr' });
eq(earned.length, 0, 'badges déjà gagnés non rejoués');
// diplôme : toutes les leçons à 1 étoile min
const G2 = KTQ.defaultGame();
KTQ.LESSONS.forEach(l => { G2.stars[l.id] = 1; });
ok(KTQ.checkBadges(G2, null).some(b => b.id === 'graduate'), 'badge Diplômé quand tout le cours est à 1★');
const G3 = KTQ.defaultGame();
KTQ.LESSONS.forEach(l => { G3.stars[l.id] = 3; });
ok(KTQ.checkBadges(G3, null).some(b => b.id === 'all3'), 'badge Collectionneur quand tout est à 3★');

console.log(failures === 0 ? '\n✅ TOUS LES TESTS PASSENT' : `\n❌ ${failures} ÉCHEC(S)`);
process.exit(failures === 0 ? 0 : 1);
