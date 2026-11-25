/**
 * Structured 24-Lesson QWERTY Curriculum, Word Corpora, AZERTY->QWERTY Drills & Code Snippets
 */

export const CURRICULUM_MODULES = [
  {
    id: 'mod-home',
    number: 1,
    title: 'Rangée de repos (Home Row)',
    description: 'Placez vos index sur les ergots tactiles F et J. Vos doigts reviennent toujours ici.',
    lessons: [
      {
        id: 'l01',
        number: 1,
        title: 'Ancrage Index : F et J',
        keysLabel: 'F  J  Espace',
        targetWpm: 18,
        tip: 'Sentez le relief sous vos deux index (F à gauche, J à droite) sans regarder le clavier.',
        prompts: [
          'fff jjj fff jjj fjf jfj ff jj fj jf fff jjj fjf jfj',
          'fj fj jf jf ffj jjf fjj jff fjf jfj ff jj fjf jfj',
        ],
      },
      {
        id: 'l02',
        number: 2,
        title: 'Majeurs & Annulaires : D K S L',
        keysLabel: 'D  K  S  L',
        targetWpm: 20,
        tip: 'Gardez les poignets droits et souples ; chaque doigt descend verticalement sur sa touche.',
        prompts: [
          'ddd kkk sss lll dk kd sl ls fds jkl dfjk slkd fdjk',
          'skdlfk dksllk fds jkl sdf lkj dskl fkjd sldf kjfd',
        ],
      },
      {
        id: 'l03',
        number: 3,
        title: 'Auriculaires : A et ;',
        keysLabel: 'A  ;  (Point-virgule)',
        targetWpm: 22,
        tip: 'Sur QWERTY, A est sous l’auriculaire gauche et le point-virgule (;) sous l’auriculaire droit !',
        prompts: [
          'aaa ;;; asdf jkl; a; ;a sad lad ask all dad fall; salad;',
          'ask a lad; all fall; a sad dad; flask falls; add a salad;',
        ],
      },
      {
        id: 'l04',
        number: 4,
        title: 'Extension centrale : G et H',
        keysLabel: 'G  H  + Synthèse Home Row',
        targetWpm: 25,
        tip: 'L’index gauche glisse vers G puis revient sur F ; l’index droit glisse vers H puis revient sur J.',
        prompts: [
          'fgf jhj fgh jhg glad half hash flag dash glass hall shall',
          'half a glass; a glad lad had a flash; shall dash half hall;',
        ],
      },
    ],
  },
  {
    id: 'mod-top',
    number: 2,
    title: 'Rangée supérieure (QWERTYUIOP)',
    description: 'Déployez vos doigts vers le haut tout en conservant l’ancrage sur F et J.',
    lessons: [
      {
        id: 'l05',
        number: 5,
        title: 'Extensions hautes : R U E I',
        keysLabel: 'R  U  E  I',
        targetWpm: 25,
        tip: 'Index sur R et U, majeurs sur E et I. Revenez frôler F et J entre les mots.',
        prompts: [
          'frf juj ded kik red rid rude fire sure user like ride',
          'free user; red fire; sure ride; desk life; dark skies;',
        ],
      },
      {
        id: 'l06',
        number: 6,
        title: 'Annulaires & Auriculaires : W O Q P',
        keysLabel: 'W  O  Q  P',
        targetWpm: 25,
        tip: 'Attention au réflexe AZERTY : Q est en haut à gauche, suivi de W !',
        prompts: [
          'sws lol aqa ;p; word work power quote quick proud world',
          'quick power; quiet world; proud worker; equal quote;',
        ],
      },
      {
        id: 'l07',
        number: 7,
        title: 'Le pont supérieur : T et Y',
        keysLabel: 'T  Y',
        targetWpm: 26,
        tip: 'T se frappe de l’index gauche (depuis F), Y de l’index droit (depuis J).',
        prompts: [
          'ftf jyj try yet type style write thirty pretty truth',
          'write your style; quiet truth; thirty pretty types today;',
        ],
      },
      {
        id: 'l08',
        number: 8,
        title: 'Fluidité Haut + Milieu',
        keysLabel: 'Rangées Home + Top complètes',
        targetWpm: 30,
        tip: 'Cherchez un rythme régulier façon métronome plutôt que des pointes brusques.',
        prompts: [
          'quietly write your quote today; our proud team works fast;',
          'people like simple tools that work well without effort;',
        ],
      },
    ],
  },
  {
    id: 'mod-bottom',
    number: 3,
    title: 'Rangée inférieure (ZXCVBNM)',
    description: 'Complétez les 26 lettres et la ponctuation basse naturelle du QWERTY.',
    lessons: [
      {
        id: 'l09',
        number: 9,
        title: 'Descente Index & Majeurs : V M C ,',
        keysLabel: 'V  M  C  ,',
        targetWpm: 25,
        tip: 'Sur QWERTY, le M est en bas sous l’index droit, juste à gauche de la virgule (,).',
        prompts: [
          'fvf jmj dcd k,k move much calm, voice, music, value, come,',
          'calm music, clear voice, much value, make every move count,',
        ],
      },
      {
        id: 'l10',
        number: 10,
        title: 'Annulaires & Auriculaires bas : X . Z /',
        keysLabel: 'X  .  Z  /',
        targetWpm: 25,
        tip: 'Le point (.) se tape directement sans Shift avec l’annulaire droit !',
        prompts: [
          'sxs l.l aza ;/; zero. size. next. pixel. cozy/jazz. fix/mix.',
          'zero pixel size. next cozy jazz mix. relax and focus.',
        ],
      },
      {
        id: 'l11',
        number: 11,
        title: 'Centre bas : B et N',
        keysLabel: 'B  N',
        targetWpm: 27,
        tip: 'Index gauche pour B, index droit pour N. Évitez de traverser la ligne médiane.',
        prompts: [
          'fbf jnj born number begin balance modern noble urban',
          'begin a modern habit. balance brain and nimble fingers.',
        ],
      },
      {
        id: 'l12',
        number: 12,
        title: 'Pangrammes : Les 26 lettres',
        keysLabel: 'A–Z + , . ; /',
        targetWpm: 30,
        tip: 'Toutes les lettres du clavier QWERTY réunies dans des phrases complètes.',
        prompts: [
          'the quick brown fox jumps over the lazy dog near a calm river.',
          'pack my box with five dozen liquor jugs; amazing view next.',
        ],
      },
    ],
  },
  {
    id: 'mod-azerty',
    number: 4,
    title: 'Transition AZERTY → QWERTY',
    description: 'Exercices intensifs conçus pour effacer les confusions musculaires des francophones.',
    lessons: [
      {
        id: 'l13',
        number: 13,
        title: 'Désamorcer le piège Q ↔ A',
        keysLabel: 'Q (haut) vs A (milieu)',
        targetWpm: 26,
        tip: 'A = repos auriculaire gauche. Q = montée auriculaire gauche.',
        prompts: [
          'qa aq qaa aqq aqua equal quality opaque plaque quarter awake',
          'quatre qualités aquatiques; ask a quick question again and again',
        ],
      },
      {
        id: 'l14',
        number: 14,
        title: 'Désamorcer le piège W ↔ Z',
        keysLabel: 'W (haut) vs Z (bas)',
        targetWpm: 26,
        tip: 'W = annulaire gauche en haut. Z = auriculaire gauche tout en bas.',
        prompts: [
          'wz zw wzz zww wizard breeze puzzle window zone warm zero wave',
          'warm breeze in a quiet zone; wizard solves a dizzy puzzle',
        ],
      },
      {
        id: 'l15',
        number: 15,
        title: 'Ancrer le M et le point-virgule (;)',
        keysLabel: 'M (index bas) vs ; (auriculaire)',
        targetWpm: 27,
        tip: 'Fini le M à droite du L : votre auriculaire droit tape ; et votre index droit descend sur M.',
        prompts: [
          'm; ;m mm; ;mm meme; moment; system; simple; maximum; medium;',
          'mon moment calme; un systeme simple; meme musique; merci;',
        ],
      },
      {
        id: 'l16',
        number: 16,
        title: 'Ponctuation directe & Apostrophe',
        keysLabel: ",  .  /  ;  '",
        targetWpm: 28,
        tip: "L'apostrophe (') est directement à droite de ; sous l'auriculaire droit !",
        prompts: [
          "it's simple, isn't it. don't look down; you're doing fine, really.",
          "c'est l'heure d'avancer, pas d'hesiter; gardez l'elan jusqu'au bout.",
        ],
      },
    ],
  },
  {
    id: 'mod-shifts-nums',
    number: 5,
    title: 'Majuscules, Chiffres & Crochets',
    description: 'Découvrez le plus grand atout du QWERTY : chiffres directs et symboles accessibles.',
    lessons: [
      {
        id: 'l17',
        number: 17,
        title: 'Majuscules au Shift croisé',
        keysLabel: 'Shift Gauche ↔ Shift Droit',
        targetWpm: 28,
        tip: 'Règle d’or : lettre main gauche = Shift Droit ; lettre main droite = Shift Gauche.',
        prompts: [
          'Paris Lyon Tokyo Montreal Berlin New York Zurich Amsterdam',
          'Alice, Marc, Claire, Quentin, Zoe and William learn Qwerty.',
        ],
      },
      {
        id: 'l18',
        number: 18,
        title: 'Chiffres 1 à 0 sans Shift !',
        keysLabel: '1 2 3 4 5 6 7 8 9 0',
        targetWpm: 24,
        tip: 'Quel bonheur sur QWERTY : aucun Shift nécessaire pour taper les chiffres !',
        prompts: [
          '12 34 56 78 90 2026 1998 404 500 1080 1440 365 24 7 100',
          'port 3000, port 8080, 24 heures, 60 secondes, 100 pour 100.',
        ],
      },
      {
        id: 'l19',
        number: 19,
        title: 'Symboles de la rangée supérieure',
        keysLabel: '! @ # $ % ^ & * ( )',
        targetWpm: 22,
        tip: 'Shift + chiffre donne les symboles clés : @ sur 2, # sur 3, $ sur 4, * sur 8.',
        prompts: [
          '! @ # $ % ^ & * ( ) #1 100% $42 @user (ok) yes! a&b 2*8',
          'Hello! Contact @team (#dev) for 100% ($0) & fast *support*.',
        ],
      },
      {
        id: 'l20',
        number: 20,
        title: 'Crochets, Accolades & Chevrons',
        keysLabel: '( )  [ ]  { }  < >',
        targetWpm: 22,
        tip: '[ et ] sont juste à droite de P ; avec Shift ils deviennent { et } !',
        prompts: [
          '() [] {} <> [0] [1] {a} {b} (x) <tag> [{id: 1}] (a < b)',
          'const list = [1, 2, 3]; const box = {open: true}; <main>()',
        ],
      },
    ],
  },
  {
    id: 'mod-pro',
    number: 6,
    title: 'Maîtrise Pro : Code & Français US-Intl',
    description: 'Devenez redoutable en programmation comme en rédaction française accentuée.',
    lessons: [
      {
        id: 'l21',
        number: 21,
        title: 'Opérateurs de développement',
        keysLabel: '= + - _ => !== === && ||',
        targetWpm: 24,
        tip: '- et = sont à droite du 0 ; Shift donne _ et +.',
        prompts: [
          'a = 1; b = 2; sum = a + b; user_id !== null && is_ready === true',
          'const fn = (x) => x * 2 + 1; count += 1; max_val = a || b;',
        ],
      },
      {
        id: 'l22',
        number: 22,
        title: 'Slashes, Pipes & Backticks',
        keysLabel: '/ \\ | ` ~',
        targetWpm: 22,
        tip: 'Le backtick (`) est tout en haut à gauche sous Échap ; le pipe (|) est Shift + \\.',
        prompts: [
          './src/app.js ../utils/io.ts `hello ${name}` cat a.txt | grep ok',
          '~/projects/qwerty/index.html | C:\\Users\\dev | `status: ${code}`',
        ],
      },
      {
        id: 'l23',
        number: 23,
        title: 'Français fluide (QWERTY US Standard)',
        keysLabel: 'Rythme français sans touches mortes',
        targetWpm: 34,
        tip: 'Entraînez la cadence des bigrammes français (qu, ou, on, en, ai, tion, ment).',
        prompts: [
          "apprendre un nouveau clavier demande un peu de calme et d'attention chaque jour.",
          "quand vos dix doigts trouvent chaque touche tout seuls, taper devient un vrai plaisir.",
        ],
      },
      {
        id: 'l24',
        number: 24,
        title: 'Accents Français (QWERTY US-International)',
        keysLabel: 'é  è  ê  à  ç  (Touches mortes)',
        targetWpm: 26,
        requiresIntl: true,
        tip: "Activez la disposition US-International dans votre OS : ' + e = é, ` + e = è, ^ + e = ê, ' + c = ç.",
        prompts: [
          'été café déjà très être là leçon français réussite régulière précis',
          "c'est déjà une très belle réussite d'écrire en français précis sur un clavier qwerty !",
        ],
      },
    ],
  },
];

export const ALL_LESSONS = CURRICULUM_MODULES.flatMap((mod) =>
  mod.lessons.map((lesson) => ({
    ...lesson,
    moduleId: mod.id,
    moduleNumber: mod.number,
    moduleTitle: mod.title,
  }))
);

export const WORD_CORPORA = {
  english: [
    'the', 'be', 'to', 'of', 'and', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with',
    'as', 'you', 'do', 'at', 'this', 'but', 'by', 'from', 'they', 'we', 'say', 'or', 'an',
    'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
    'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
    'just', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
    'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
    'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'system',
    'program', 'question', 'number', 'always', 'world', 'build', 'clean', 'focus', 'steady',
    'rhythm', 'keyboard', 'finger', 'practice', 'simple', 'modern', 'quick', 'value', 'design',
    'change', 'light', 'sound', 'water', 'place', 'point', 'right', 'small', 'large', 'early',
    'young', 'important', 'public', 'able', 'clear', 'moment', 'power', 'quiet', 'craft',
  ],
  french_ascii: [
    'le', 'la', 'les', 'de', 'des', 'un', 'une', 'et', 'en', 'dans', 'que', 'qui', 'pour',
    'sur', 'avec', 'plus', 'par', 'pas', 'tout', 'mais', 'comme', 'ou', 'son', 'sa', 'ses',
    'nous', 'vous', 'ils', 'elle', 'faire', 'dire', 'pouvoir', 'aller', 'voir', 'savoir',
    'vouloir', 'venir', 'prendre', 'trouver', 'donner', 'parler', 'aimer', 'passer', 'mettre',
    'demander', 'garder', 'sembler', 'laisser', 'rester', 'penser', 'entendre', 'regarder',
    'clavier', 'doigt', 'main', 'vitesse', 'calme', 'fluide', 'chaque', 'touche', 'temps',
    'jour', 'monde', 'travail', 'simple', 'rapide', 'juste', 'encore', 'toujours', 'jamais',
    'jamais', 'souvent', 'ensemble', 'exemple', 'question', 'qualite', 'musique', 'systeme',
    'programme', 'code', 'ligne', 'espace', 'point', 'virgule', 'phrase', 'mot', 'habitude',
    'memoire', 'naturel', 'precis', 'propre', 'clair', 'solide', 'moderne', 'pratique',
  ],
  french_accents: [
    'être', 'déjà', 'très', 'même', 'après', 'là', 'où', 'ça', 'français', 'réussite',
    'élève', 'école', 'idée', 'année', 'journée', 'qualité', 'vérité', 'liberté', 'clarté',
    'précis', 'régulier', 'mémoire', 'détente', 'équilibre', 'créer', 'écrire', 'répondre',
    'préférer', 'répéter', 'vérifier', 'améliorer', 'maîtriser', 'bientôt', 'plutôt', 'côté',
    'forêt', 'intérêt', 'fenêtre', 'tête', 'fête', 'leçon', 'façon', 'garçon', 'reçu',
    'aperçu', 'première', 'dernière', 'lumière', 'manière', 'matière', 'système', 'problème',
    'modèle', 'fidèle', 'sincère', 'légère', 'numéro', 'caméra', 'énergie', 'méthode',
  ],
  azerty_traps: [
    'quatre', 'qualite', 'question', 'quotidien', 'aquatique', 'equipe', 'remarque',
    'wagon', 'weekend', 'web', 'wifi', 'wizard', 'window', 'zero', 'zone', 'zigzag', 'zoom',
    'meme', 'moment', 'maximum', 'minimum', 'musique', 'montagne', 'maison', 'merci',
    "c'est", "l'ami", "d'accord", "aujourd'hui", "qu'il", '1999', '2026', '100%', '42',
    'simple;', 'clair,', 'net.', 'vrai?', 'oui!', 'a/b', 'q/a', 'w/z', 'm/;',
  ],
};

export const QUOTES_CORPUS = [
  "La vitesse vient toute seule quand la précision devient une seconde nature.",
  "Ne regardez pas vos mains : laissez l'erreur vous indiquer où s'est posé votre doigt.",
  'Simplicity is about subtracting the obvious and adding the meaningful.',
  'First make your keystrokes calm and accurate; speed follows effortless motion.',
  "Passer de l'AZERTY au QWERTY, c'est offrir des vacances définitives à ses auriculaires.",
  'Programs must be written for people to read, and only incidentally for machines to execute.',
];

export const CODE_SNIPPETS = [
  {
    lang: 'JavaScript',
    code: `const computeWpm = (chars, ms) => {\n  if (ms <= 0) return 0;\n  return Math.round((chars / 5) / (ms / 60000));\n};`,
  },
  {
    lang: 'TypeScript',
    code: `interface KeyStat {\n  code: string;\n  hits: number;\n  errors: number;\n}\nconst isMastered = (k: KeyStat) => k.hits >= 20 && k.errors === 0;`,
  },
  {
    lang: 'Python',
    code: `def top_weak_keys(stats: dict, limit: int = 4) -> list[str]:\n    ranked = sorted(stats.items(), key=lambda kv: kv[1]["error_rate"], reverse=True)\n    return [k for k, _ in ranked[:limit]]`,
  },
  {
    lang: 'Shell / Git',
    code: `git switch -c feat/qwerty-mastery && npm run test\ncurl -s https://api.example.dev/v1/status | jq '.ok == true'`,
  },
  {
    lang: 'Rust',
    code: `fn clamp_accuracy(ok: usize, total: usize) -> f64 {\n    if total == 0 { return 100.0; }\n    ((ok as f64 / total as f64) * 1000.0).round() / 10.0\n}`,
  },
];
