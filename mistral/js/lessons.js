// Curriculum gamifié façon TypingClub : chaque leçon débloque la suivante (1 étoile min).
// set = caractères autorisés pour générer l'exercice de la leçon.
globalThis.UNITS = [
  { id: 'u1', icon: '🏠', name: 'Ligne de base' },
  { id: 'u2', icon: '☝️', name: 'Les index' },
  { id: 'u3', icon: '🖐️', name: 'Tous les doigts' },
  { id: 'u4', icon: '🔢', name: 'Les chiffres' },
  { id: 'u5', icon: '✍️', name: 'Écriture réelle' },
  { id: 'u6', icon: '⚡', name: 'Vitesse' }
];

globalThis.LESSONS = [
  { id: 'l01', unit: 'u1', name: 'Repères F et J',        newKeys: ['f', 'j'],          set: 'fj',       type: 'keys',    desc: "Pose tes index sur F et J (les deux touches avec un petit repère). Tape uniquement ces deux lettres." },
  { id: 'l02', unit: 'u1', name: 'Main gauche : A S D',   newKeys: ['a', 's', 'd'],     set: 'asdf',     type: 'keys',    desc: "Auriculaire sur A, annulaire sur S, majeur sur D. L'index reste sur F." },
  { id: 'l03', unit: 'u1', name: 'Main droite : J K L ;', newKeys: ['j', 'k', 'l', ';'], set: 'fjkl;',   type: 'keys',    desc: "Index sur J, majeur sur K, annulaire sur L, auriculaire sur ;." },
  { id: 'l04', unit: 'u1', name: 'Ligne de base',         newKeys: [],                 set: 'asdfjkl;', type: 'keys',    desc: "Les deux mains sur la ligne de base, sans regarder le clavier." },
  { id: 'l05', unit: 'u2', name: 'Index gauche : E R',    newKeys: ['e', 'r'],          set: 'asdfjkl;er',        type: 'keys', desc: "L'index gauche monte d'une rangée sur E et R." },
  { id: 'l06', unit: 'u2', name: 'Index gauche : T G',    newKeys: ['t', 'g'],          set: 'asdfjkl;ertg',      type: 'keys', desc: "Index gauche : T en haut, G sur la ligne de base." },
  { id: 'l07', unit: 'u2', name: 'Index gauche : V B',    newKeys: ['v', 'b'],          set: 'asdfjkl;ertgvb',    type: 'keys', desc: "Index gauche descend sur V et B." },
  { id: 'l08', unit: 'u2', name: 'Index droit : Y U',     newKeys: ['y', 'u'],          set: 'asdfjkl;ertgvbyu',  type: 'keys', desc: "L'index droit monte sur Y et U." },
  { id: 'l09', unit: 'u2', name: 'Index droit : H N',     newKeys: ['h', 'n'],          set: 'asdfjkl;ertgvbyuhn',   type: 'keys', desc: "Index droit : H sur la ligne de base, N en bas." },
  { id: 'l10', unit: 'u2', name: 'Index droit : M',       newKeys: ['m'],              set: 'asdfjkl;ertgvbyuhnm',  type: 'keys', desc: "Index droit descend sur M." },
  { id: 'l11', unit: 'u3', name: 'Majeur gauche : C',     newKeys: ['c'],              set: 'asdfjkl;ertgvbyuhnmc', type: 'keys', desc: "Le majeur gauche descend sur C." },
  { id: 'l12', unit: 'u3', name: 'Annulaire gauche : W X', newKeys: ['w', 'x'],         set: 'asdfjkl;ertgvbyuhnmcwx', type: 'keys', desc: "Annulaire gauche : W en haut, X en bas." },
  { id: 'l13', unit: 'u3', name: 'Annulaire droit : O .', newKeys: ['o', '.'],          set: 'asdfjkl;ertgvbyuhnmcwxo.', type: 'keys', desc: "Annulaire droit : O en haut, point en bas." },
  { id: 'l14', unit: 'u3', name: 'Auriculaire gauche : Q Z', newKeys: ['q', 'z'],       set: 'asdfjkl;ertgvbyuhnmcwxo.qz', type: 'keys', desc: "Auriculaire gauche : Q en haut, Z en bas." },
  { id: 'l15', unit: 'u3', name: "Auriculaire droit : P '", newKeys: ['p', "'"],        set: "asdfjkl;ertgvbyuhnmcwxo.qzp'", type: 'keys', desc: "Auriculaire droit : P en haut, apostrophe sur la ligne de base." },
  { id: 'l16', unit: 'u4', name: 'Chiffres centraux : 4 5 6 7', newKeys: ['4', '5', '6', '7'], set: "asdfjkl;ertgvbyuhnmcwxo.qzp'4567", type: 'keys', desc: "Les index montent sur 4 5 (gauche) et 6 7 (droite)." },
  { id: 'l17', unit: 'u4', name: 'Tous les chiffres',     newKeys: ['1', '2', '3', '8', '9', '0'], set: "asdfjkl;ertgvbyuhnmcwxo.qzp'1234567890", type: 'keys', desc: "Toute la rangée de chiffres, sans regarder." },
  { id: 'l18', unit: 'u5', name: 'Majuscules (Maj ⇧)',    newKeys: ['A'],              set: 'abcdefghijklmnopqrstuvwxyz', type: 'words', caps: true, desc: "Certaines lettres sont en majuscule : pense à la touche Maj (⇧) en même temps que la lettre." },
  { id: 'l19', unit: 'u5', name: 'Ponctuation',           newKeys: [',', '.', '!', '?', '-'], set: "abcdefghijklmnopqrstuvwxyz,.!?-", type: 'keys', desc: "La ponctuation courante : virgule, point, ! ? et tiret." },
  { id: 'l20', unit: 'u5', name: 'Phrases complètes',     newKeys: [],                 set: 'all',      type: 'phrases', desc: "Des phrases entières avec majuscules et ponctuation, comme dans la vraie vie." },
  { id: 'l21', unit: 'u6', name: 'Sprint chrono 30 s',    newKeys: [],                 set: 'all',      type: 'time', duration: 30, desc: "30 secondes pour taper le plus de mots possible. La précision d'abord, la vitesse ensuite !" }
];

// Badges (succès). test(G, ctx) reçoit l'état du jeu et le contexte de la session {acc, wpm, chars, mode, lang}.
globalThis.BADGES = [
  { id: 'first',     icon: '🎯', name: 'Première frappe',  desc: 'Termine ta première session',                 test: function (G) { return G.totalSessions >= 1; } },
  { id: 'star3',     icon: '⭐', name: 'Perfectionniste',  desc: '3 étoiles sur une leçon',                      test: function (G) { return Object.keys(G.stars).some(function (k) { return G.stars[k] >= 3; }); } },
  { id: 'flawless',  icon: '💎', name: 'Sans faute',       desc: '100 % de précision sur 50+ caractères',        test: function (G, c) { return !!c && c.acc >= 100 && c.chars >= 50; } },
  { id: 'fast40',    icon: '🐇', name: 'Rapide',           desc: 'Atteins 40 MPM',                               test: function (G, c) { return !!c && c.wpm >= 40; } },
  { id: 'fast60',    icon: '🚀', name: 'Fusée',            desc: 'Atteins 60 MPM',                               test: function (G, c) { return !!c && c.wpm >= 60; } },
  { id: 'fast80',    icon: '⚡', name: 'Éclair',           desc: 'Atteins 80 MPM',                               test: function (G, c) { return !!c && c.wpm >= 80; } },
  { id: 'graduate',  icon: '🎓', name: 'Diplômé',          desc: 'Toutes les leçons terminées (1★ min)',         test: function (G) { return globalThis.LESSONS.every(function (l) { return (G.stars[l.id] || 0) >= 1; }); } },
  { id: 'all3',      icon: '🌟', name: 'Collectionneur',   desc: '3 étoiles sur toutes les leçons',              test: function (G) { return globalThis.LESSONS.every(function (l) { return (G.stars[l.id] || 0) >= 3; }); } },
  { id: 'streak3',   icon: '🔥', name: 'En série',         desc: "3 jours d'entraînement d'affilée",             test: function (G) { return G.streak.count >= 3; } },
  { id: 'streak7',   icon: '🏅', name: 'Sérieux',          desc: "7 jours d'entraînement d'affilée",             test: function (G) { return G.streak.count >= 7; } },
  { id: 'sessions10', icon: '⌨️', name: 'Accro',           desc: '10 sessions terminées',                        test: function (G) { return G.totalSessions >= 10; } },
  { id: 'sessions50', icon: '🏃', name: 'Marathonien',     desc: '50 sessions terminées',                        test: function (G) { return G.totalSessions >= 50; } },
  { id: 'bilingual', icon: '🌍', name: 'Polyglotte',       desc: 'Joue en FR et en EN',                          test: function (G) { return !!(G.langs.fr && G.langs.en); } }
];
