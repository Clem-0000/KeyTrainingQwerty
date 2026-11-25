/* ================= QwertyLab v2 — parcours gamifié façon TypingClub ================= */
"use strict";

/* ============================================================
   1. CLAVIER QWERTY — layout + doigt responsable de chaque touche
   ============================================================ */
const ROWS = [
  [["`"],["1"],["2"],["3"],["4"],["5"],["6"],["7"],["8"],["9"],["0"],["-"],["="]],
  [["q"],["w"],["e"],["r"],["t"],["y"],["u"],["i"],["o"],["p"],["["],["]"]],
  [["a"],["s"],["d"],["f"],["g"],["h"],["j"],["k"],["l"],[";"],["'"]],
  [["z"],["x"],["c"],["v"],["b"],["n"],["m"],[","],["."],["/"]],
  [["SPACE","wide space"]],
];
const FINGER = {
  "`":"l-pinky","1":"l-pinky","2":"l-ring","3":"l-mid","4":"l-index","5":"l-index",
  "6":"r-index","7":"r-index","8":"r-mid","9":"r-ring","0":"r-pinky","-":"r-pinky","=":"r-pinky",
  "q":"l-pinky","w":"l-ring","e":"l-mid","r":"l-index","t":"l-index",
  "y":"r-index","u":"r-index","i":"r-mid","o":"r-ring","p":"r-pinky","[":"r-pinky","]":"r-pinky",
  "a":"l-pinky","s":"l-ring","d":"l-mid","f":"l-index","g":"l-index",
  "h":"r-index","j":"r-index","k":"r-mid","l":"r-ring",";":"r-pinky","'":"r-pinky",
  "z":"l-pinky","x":"l-ring","c":"l-mid","v":"l-index","b":"l-index",
  "n":"r-index","m":"r-index",",":"r-mid",".":"r-ring","/":"r-pinky",
  " ":"l-thumb",
};

/* ============================================================
   2. CURSUS — 8 unités, du doigt par doigt jusqu'aux phrases
   ============================================================ */
const rand = a => a[Math.floor(Math.random() * a.length)];
const shuffled = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };

function letterDrill(keys, extra = []){
  const pool = [...keys, ...extra.flatMap(k=>[k,k])];
  const groups = [];
  let total = 0;
  while(total < 110){
    const n = 3 + Math.floor(Math.random()*2);
    const g = Array.from({length:n},()=>rand(pool)).join("");
    groups.push(g); total += n + 1;
  }
  return groups.join(" ");
}

const WORDS_FR = "le la de un une et il elle ou en ce que qui pas sur les est pour dans plus mais comme avec tout son ses notre leur leur bien tres jour vie main temps monde coeur enfant ami ami".split(" ");
const WORDS_EN = "the and you that have for not are with this but from they one all when your can said there use each which she will people much before right through where work life year back give most very".split(" ");

const SENTENCES = [
  "Le chat dort sur le tapis pres de la fenetre.",
  "Il fait beau aujourd hui, allons marcher dehors.",
  "La pratique rend parfait, alors entraine toi chaque jour.",
  "Un bon typiste garde toujours ses mains bien posees.",
  "Speed comes from accuracy, so type each key with intent.",
  "The quick brown fox jumps over the lazy dog.",
  "Keep your fingers on the home row and stay relaxed.",
  "Un petit pas par jour mene a une grande victoire.",
  "Les doigts bien places font des mots rapides et justes.",
  "Respire, garde le rythme, et laisse tes mains voler.",
];

const CURRICULUM = [
  { title:"La rangée de base", desc:"Pose tes index sur F et J. C'est ton camp de base.",
    lessons:[
      { id:"u1l1", title:"F et J", keys:["f","j"], goal:18,
        tip:"Tes deux index touchent les petites bosses de F et J. Après chaque touche, ils reviennent à la maison." },
      { id:"u1l2", title:"D et K", keys:["d","k"], goal:18,
        tip:"Les majeurs partent de D et K. Un petit mouvement vers le haut, puis retour immédiat." },
      { id:"u1l3", title:"S et L", keys:["s","l"], goal:18,
        tip:"Les annulaires sont les doigts les plus faibles. Ralentis volontairement pour les muscler." },
      { id:"u1l4", title:"A et ;", keys:["a",";"], goal:18,
        tip:"Les auriculaires gèrent A et le point-virgule. Ils mercent… pardon, méritent ton amour." },
      { id:"u1l5", title:"Révision : ASDF JKL;", review:["f","j","d","k","s","l","a",";"], goal:20,
        tip:"Toute la rangée de base ! Ne regarde ni tes mains ni le clavier : sens les bosses." },
    ]},
  { title:"La rangée du haut", desc:"QWERT au-dessus de la main gauche, YUIOP à droite.",
    lessons:[
      { id:"u2l1", title:"Q et P", keys:["q","p"], goal:18, tip:"Les auriculaires montent d'un cran. La paume ne bouge pas !" },
      { id:"u2l2", title:"W et O", keys:["w","o"], goal:18, tip:"Les annulaires s'étirent vers le haut. Retour immédiat à la base." },
      { id:"u2l3", title:"E et I", keys:["e","i"], goal:18, tip:"Les majeurs aiment l'aventure : E et I sont leurs touches préférées." },
      { id:"u2l4", title:"R, T, U, Y", keys:["r","t","u","y"], goal:20, tip:"Les index couvrent 4 touches chacun. C'est leur super-pouvoir." },
      { id:"u2l5", title:"Révision : QWERTY UIOP", review:["q","w","e","r","t","y","u","i","o","p"], goal:22,
        tip:"Rangée du haut complète. Garde le poignet flottant, l'avant-bras fait le travail." },
    ]},
  { title:"La rangée du bas", desc:"Les touches les plus lointaines : contrôlera ton retour à la base.",
    lessons:[
      { id:"u3l1", title:"Z et /", keys:["z","/"], goal:16, tip:"Les auriculaires descendent tout en bas. Le voyage le plus long du clavier." },
      { id:"u3l2", title:"X et .", keys:["x","."], goal:16, tip:"Les annulaires descendent d'un cran. Le point terminera bientôt tes phrases." },
      { id:"u3l3", title:"C et ,", keys:["c",","], goal:16, tip:"Majeur gauche sur C, majeur droit sur la virgule. Même mouvement, miroir." },
      { id:"u3l4", title:"V et N", keys:["v","n"], goal:18, tip:"Les index descendent d'un cran. Ne déplace jamais la main entière : seul le doigt part en mission." },
      { id:"u3l5", title:"B, puis révision", keys:["b"], review:["z","x","c","v","b","n","m",",",".","/"], goal:22,
        tip:"B est le grand écart de l'index gauche. Ensuite, toute la rangée du bas en révision !" },
    ]},
  { title:"Symboles courants", desc:"Les touches discretes qui donnent du sens à un texte.",
    lessons:[
      { id:"u4l1", title:"Le tiret -", keys:["-"], goal:16, tip:"L'auriculaire droit, juste à côté du 0. Un petit saut, un retour." },
      { id:"u4l2", title:"Crochets [ ]", keys:["[","]"], goal:16, tip:"Encore l'auriculaire droit. Ces deux-là s'appellent « les oubliés »." },
      { id:"u4l3", title:"L'apostrophe '", keys:["'"], goal:16, tip:"L'auriculaire droit encore. Il va devenir ta touche la plus musclée." },
      { id:"u4l4", title:"Révision symboles", review:["-","=","[","]",";","'","/",","], goal:20,
        tip:"Tous les symboles appris, mélangés. Concentre-toi sur la précision." },
    ]},
  { title:"Les chiffres", desc:"5 gauche, 5 droite : les index se partagent le centre.",
    lessons:[
      { id:"u5l1", title:"1 à 5", keys:["1","2","3","4","5"], goal:14, tip:"Le pouce ne bouge pas : l'index part de F, monte à 5, l'index droit à 6." },
      { id:"u5l2", title:"6 à 0", keys:["6","7","8","9","0"], goal:14, tip:"Les index étirent jusqu'à 6 et 7. Les autres doigts restent en base." },
      { id:"u5l3", title:"Tous les chiffres", review:["1","2","3","4","5","6","7","8","9","0"], goal:16,
        tip:"Chiffres mélangés. Un comptable rapide est un comptable précis." },
    ]},
  { title:"Lettres majuscules", desc:"Maj + la lettre. Les auriculaires appuient sur Maj, tes doigts habituels tapent.",
    lessons:[
      { id:"u6l1", title:"Majuscules", caps:true, goal:18,
        tip:"Maj gauche = auriculaire gauche (pour la main droite) et inversement. Touche maj, puis la lettre normalement." },
      { id:"u6l2", title:"Noms propres", caps:true, goal:20,
        tip:"N'écrase pas la touche Maj : un appui léger suffit. Rythme régulier." },
    ]},
  { title:"Mots entiers", desc:"Mets tout ensemble : des mots de plus en plus longs.",
    lessons:[
      { id:"u7l1", title:"Mots courts", words:WORDS_FR.filter(w=>w.length<=3), goal:22,
        tip:"Trois à quatre lettres. Cherche le flux, pas la vitesse brute." },
      { id:"u7l2", title:"Mots courants", words:WORDS_FR.concat(WORDS_EN), goal:25,
        tip:"Les mots les plus fréquents doivent devenir des réflexes." },
      { id:"u7l3", title:"Mots rapides", words:WORDS_EN.concat(WORDS_FR), goal:28,
        tip:"Objectif débit ! Mais précision d'abord : une erreur coûte plus cher qu'une hésitation." },
    ]},
  { title:"Phrases", desc:"Le vrai terrain : ponctuation, majuscules, espaces, rythme.",
    lessons:[
      { id:"u8l1", title:"Phrases simples", sentences:true, goal:25,
        tip:"Regarde un mot en avance. Tes yeux guident, tes doigts suivent." },
      { id:"u8l2", title:"Le grand final", sentences:true, goal:30,
        tip:"Dernière ligne droite ! Détends tes épaules, respire, et vole." },
    ]},
];

// aplatissement du cursus -> liste ordonnée
const LESSON_LIST = CURRICULUM.flatMap((u,i)=>u.lessons.map(l=>({...l, unit:i, unitTitle:u.title})));
const UNIT_LESSONS = CURRICULUM.map((u,i)=>u.lessons);

const TIPS = [
  "Ne regarde jamais tes mains. Les bosses de F et J sont ton GPS.",
  "La précision d'abord : la vitesse vient toute seule ensuite.",
  "Tape du bout des doigts, comme un pianiste. Pas de doigts plats.",
  "Après chaque touche éloignée, reviens immédiatement en position de base.",
  "Épaules basses, poignets flottants : la frappe vient des avant-bras.",
  "Si tu hésites, ralentis plutôt que de chercher la touche à l'aveugle.",
  "Un rythme régulier bat toujours des pointes de vitesse irrégulières.",
];

const BADGES = [
  { id:"first", em:"🐣", name:"Premiers pas", desc:"Terminer ta première leçon", test:p=>doneCount(p)>=1 },
  { id:"oneshot", em:"💯", name:"Sans faute", desc:"Terminer une leçon à 100 % de précision", test:p=>p.history.some(h=>h.acc===100) },
  { id:"flash", em:"⚡", name:"Éclair", desc:"Atteindre 50 WPM sur une leçon", test:p=>p.history.some(h=>h.wpm>=50) },
  { id:"rooted", em:"🌱", name:"Racine solide", desc:"Unité 1 terminée avec 3★ partout", test:p=>UNIT_LESSONS[0].every(l=>(p.lessons[l.id]?.stars||0)===3) },
  { id:"star30", em:"✨", name:"Chasseur d'étoiles", desc:"Récolter 30 étoiles au total", test:p=>totalStars(p)>=30 },
  { id:"half", em:"🧗", name:"À mi-parcours", desc:"Terminer la moitié du parcours", test:p=>doneCount(p)>=Math.ceil(LESSON_LIST.length/2) },
  { id:"grad", em:"🎓", name:"Diplômé", desc:"Terminer toutes les leçons", test:p=>doneCount(p)>=LESSON_LIST.length },
  { id:"habit3", em:"📅", name:"Habitude", desc:"3 jours d'entraînement d'affilée", test:p=>p.streak>=3 },
  { id:"fire7", em:"🔥", name:"Inarrêtable", desc:"7 jours d'entraînement d'affilée", test:p=>p.streak>=7 },
  { id:"master", em:"👑", name:"Maître du clavier", desc:"3★ sur toutes les leçons", test:p=>LESSON_LIST.every(l=>(p.lessons[l.id]?.stars||0)===3) },
];
const doneCount  = p => LESSON_LIST.filter(l=>p.lessons[l.id]?.stars>0).length;
const totalStars = p => LESSON_LIST.reduce((a,l)=>a+(p.lessons[l.id]?.stars||0),0);

/* ============================================================
   3. PROFIL — XP, niveau, série, badges, stats (localStorage)
   ============================================================ */
const LS = "qwertylab.v2";
const profile = {
  xp:0, streak:0, lastDay:null, lessons:{}, badges:[], history:[], keyStats:{}, sound:true,
  load(){ try{ const d=JSON.parse(localStorage.getItem(LS)); if(d) Object.assign(this,d); }catch(e){} },
  save(){ try{ localStorage.setItem(LS, JSON.stringify({
    xp:this.xp, streak:this.streak, lastDay:this.lastDay, lessons:this.lessons,
    badges:this.badges, history:this.history, keyStats:this.keyStats, sound:this.sound })); }catch(e){} },
};
const levelOf = xp => Math.floor(xp/100)+1;

function bumpStreak(){
  const today = new Date().toISOString().slice(0,10);
  if(profile.lastDay === today) return;
  const yest = new Date(Date.now()-864e5).toISOString().slice(0,10);
  profile.streak = profile.lastDay === yest ? profile.streak+1 : 1;
  profile.lastDay = today;
  if(profile.streak>1) toast(`📅 Série de ${profile.streak} jours !`, "gold");
}

/* ============================================================
   4. DOM & vues
   ============================================================ */
const $ = id => document.getElementById(id);
const VIEWS = ["map","intro","type","result","stats","badges"];
function showView(name){
  VIEWS.forEach(v=>$("view-"+v).classList.toggle("hidden", v!==name));
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.view===name));
  if(name==="map") renderMap();
  if(name==="stats") renderStats();
  if(name==="badges") renderBadges();
}

/* ---------- clavier virtuel ---------- */
const keyEls = {};
(function buildKeyboard(){
  const kb = $("keyboard");
  ROWS.forEach(row=>{
    const r = document.createElement("div"); r.className = "krow";
    row.forEach(([label, cls])=>{
      const d = cls && cls.includes("space") ? "SPACE" : label;
      const k = document.createElement("div");
      k.className = `key ${cls||""} ${FINGER[d]?.replace("-","")||""} ${"fj".includes(d)?"homing":""}`;
      k.textContent = d==="SPACE" ? "␣" : d;
      keyEls[d] = k; r.appendChild(k);
    });
    kb.appendChild(r);
  });
})();
function clearGuides(){
  document.querySelectorAll(".key.next,.key.pressed,.key.error").forEach(e=>e.classList.remove("next","pressed","error"));
  document.querySelectorAll(".finger.active").forEach(e=>e.classList.remove("active"));
}
function guide(ch){
  clearGuides();
  const base = ch === " " ? "SPACE" : ch.toLowerCase();
  const kEl = keyEls[base];
  if(kEl) kEl.classList.add("next");
  const f = document.querySelector(`.finger[data-finger="${FINGER[base]||""}"]`);
  if(f) f.classList.add("active");
}

/* ---------- génération d'exercice ---------- */
function genExercise(lesson){
  if(lesson.sentences) return rand(SENTENCES);
  if(lesson.words){
    const pool = lesson.words;
    return Array.from({length:16},()=>rand(pool)).join(" ");
  }
  const base = lesson.keys || [];
  const rev = lesson.review || [];
  if(rev.length) return letterDrill(rev);
  return letterDrill(base);
}
function genCapsExercise(){
  const words = ["Le","Chat","Dort","Sur","Le","Tapis","Un","Chien","Heureux","Vit","Ici","Paris","Est","Beau","La","Maison","Du","Bonheur","Est","Vide"];
  return Array.from({length:14},()=>rand(words)).join(" ");
}

/* ============================================================
   5. MOTEUR DE FRAPPE
   ============================================================ */
let S = null; // session
function startLesson(lesson){
  const text = lesson.caps ? genCapsExercise() : genExercise(lesson);
  S = { lesson, chars:[...text], idx:0, errors:0, typed:0, startAt:null, over:false, wrong:{} };
  $("typeCrumb").textContent = `Unité ${lesson.unit+1} · ${lesson.title}`;
  $("mWpm").textContent="0"; $("mAcc").textContent="100%"; $("mErr").textContent="0"; $("mTime").textContent="0:00";
  $("pbFill").style.width = "0%";
  const td = $("textDisplay"); td.innerHTML = "";
  S.chars.forEach((c,i)=>{
    const s = document.createElement("span");
    s.className = "char" + (i===0?" current caret":"");
    s.textContent = c; td.appendChild(s);
  });
  showView("type"); guide(S.chars[0]); td.focus();
}

function onChar(ch){
  if(!S || S.over) return;
  if(!S.startAt) S.startAt = Date.now();
  const expected = S.chars[S.idx];
  const el = $("textDisplay").children[S.idx];
  S.typed++;
  const base = expected===" "?"SPACE":expected.toLowerCase();
  const kEl = keyEls[base];
  if(ch === expected){
    S.idx++; el.classList.remove("current","caret","wrong"); el.classList.add("correct");
    if(kEl){ kEl.classList.add("pressed"); setTimeout(()=>kEl.classList.remove("pressed"),90); }
    beep(true, true);
    if(S.idx<S.chars.length){
      $("textDisplay").children[S.idx].classList.add("current","caret");
      guide(S.chars[S.idx]);
    } else finish();
  }else{
    S.errors++;
    S.wrong[base] = (S.wong===undefined?0:(S.wong||0)); // compat
    S.wong = 1;
    S.wrong[base] = (S.wrong[base]||0)+1;
    el.classList.add("wrong");
    if(kEl){ kEl.classList.add("error"); setTimeout(()=>kEl.classList.remove("error"),220); }
    beep(false);
  }
  const acc = Math.round((1-S.errors/Math.max(1,S.typed))*100);
  $("mAcc").textContent = acc+"%"; $("mErr").textContent = S.errors;
  $("pbFill").style.width = (S.idx/S.chars.length*100)+"%";
  if(S.idx<S.chars.length) guide(S.chars[S.idx]);
}
setInterval(()=>{
  if(!S || !S.startAt || S.over) return;
  const el = (Date.now()-S.startAt)/1000;
  $("mTime").textContent = `${Math.floor(el/60)}:${String(Math.floor(el%60)).padStart(2,"0")}`;
  const wpm = Math.round((S.idx/5)/(el/60));
  $("mWpm").textContent = Math.max(0,wpm);
},250);

/* ============================================================
   6. FIN DE SESSION — étoiles, XP, badges
   ============================================================ */
function starsFor(acc, wpm, goal){
  if(acc < 85) return 0;
  if(acc >= 95 && wpm >= goal) return 3;
  if(acc >= 92) return 2;
  return 1;
}
function finish(){
  S.over = true; clearGuides();
  const dur = Math.max(1,(Date.now()-S.startAt)/1000);
  const wpm = Math.max(0, Math.round((S.idx/5)/(dur/60)));
  const acc = Math.round((1-S.errors/Math.max(1,S.typed))*100);
  const stars = starsFor(acc, wpm, S.lesson.goal);
  const prev = profile.lessons[S.lesson.id] || { stars:0, wpm:0 };
  const newStars = Math.max(stars, prev.stars);
  const newWpm = Math.max(wpm, prev.wpm);
  const firstTime = stars>0 && prev.stars===0;

  profile.lessons[S.lesson.id] = { stars:newStars, wpm:newWpm, acc:Math.max(acc, prev.acc||0) };
  for(const k in S.wrong) profile.keyStats[k] = (profile.keyStats[k]||0)+S.wrong[k];
  profile.history.push({ t:Date.now(), wpm, acc, lesson:S.lesson.id });

  let xpGain = 0;
  if(stars>0){
    xpGain = 10 + stars*8 + (firstTime?12:0) + Math.min(30, Math.max(0, Math.round((newWpm-prev.wpm)/2)));
    if(stars<newStars) {} // retry
  } else { xpGain = 2; }
  profile.xp += xpGain;
  bumpStreak();
  profile.save();

  const nextId = LESSON_LIST.findIndex(l=>(profile.lessons[l.id]?.stars||0)===0);
  $("resTitle").textContent = stars===3 ? "Parfait !" : stars===2 ? "Très bien joué !" : stars===1 ? "Validé !" : "Presque… réessaie !";
  const starEls = $("starsRow");
  starEls.innerHTML = "";
  [1,2,3].forEach(i=>{
    const s = document.createElement("div");
    s.className = "star" + (i<=stars?" on":"");
    s.textContent = "⭐"; starEls.appendChild(s);
  });
  $("rWpm").textContent = wpm; $("rAcc").textContent = acc+"%";
  $("rTime").textContent = Math.round(dur)+"s"; $("rXp").textContent = "+"+xpGain;
  let msg;
  if(stars===0) msg = `Il te faut ${Math.max(wpm,S.lesson.goal)} WPM et 85 % de précision pour valider. Tu y es presque !`;
  else if(stars===3) msg = `Objectif ${S.lesson.goal} WPM atteint. Passe à la suite, champion !`;
  else msg = `Pour 3★ : ${S.lesson.goal} WPM avec 95 % de précision. Tu peux le faire !`;
  $("resMsg").textContent = msg;
  checkBadges();

  if(stars===3){ confetti(); toast(`⭐ ${S.lesson.title} : 3 étoiles !`,"gold"); }
  else if(stars>0){ toast(`✅ ${S.lesson.title} validé (+${xpGain} XP)`,"ok"); }
  beep(stars>0);

  const idxInList = LESSON_LIST.findIndex(l=>l.id===S.lesson.id);
  const hasNext = idxInList>=0 && idxInList<LESSON_LIST.length-1 && newStars>0;
  $("btnNext").disabled = !hasNext;
  updateHeader();
  showView("result");
}
function checkBadges(){
  BADGES.forEach(b=>{ if(!profile.badges.includes(b.id) && b.test(profile)){
    profile.badges.push(b.id); profile.save(); toast(`${b.em} Badge débloqué : ${b.name}`,"gold");
  }});
}

/* ============================================================
   7. RENDU — carte, header, stats, badges
   ============================================================ */
function lessonAvailable(lesson){
  const idx = LESSON_LIST.findIndex(l=>l.id===lesson.id);
  return idx===0 || (profile.lessons[LESSON_LIST[idx-1].id]?.stars||0)>0;
}
function currentLesson(){
  return LESSON_LIST.find(l=>(profile.lessons[l.id]?.stars||0)===0) || LESSON_LIST[LESSON_LIST.length-1];
}
function starsOfUnit(u){
  const total = UNIT_LESSONS[u].length*3;
  const got = UNIT_LESSONS[u].reduce((a,l)=>a+(profile.lessons[l.id]?.stars||0),0);
  return {got,total};
}
function updateHeader(){
  $("streak").textContent = profile.streak;
  $("level").textContent = levelOf(profile.xp);
  const lvlXp = profile.xp - (levelOf(profile.xp)-1)*100;
  $("xpTxt").textContent = `${profile.xp} XP`;
  $("xpFill").style.width = Math.min(100, lvlXp)+"%";
}
function renderMap(){
  const cur = currentLesson();
  $("contTitle").textContent = (profile.lessons[cur.id]?.stars||0)>0 ? "Parcours terminé — libre !" : cur.title;
  $("contSub").textContent = `Unité ${cur.unit+1} · ${CURRICULUM[cur.unit].title}`;
  const list = $("unitList"); list.innerHTML = "";
  CURRICULUM.forEach((u,i)=>{
    const s = starsOfUnit(i);
    const unitEl = document.createElement("div"); unitEl.className = "unit";
    const done = s.got===s.total;
    unitEl.innerHTML = `
      <div class="unit-head ${done?"done":""}">
        <div class="unit-num">${i+1}</div>
        <div><h3>${u.title}</h3><p>${u.desc}</p></div>
        <span class="unit-stars">${s.got>=s.total?"🏆":`${s.got}/${s.total} ⭐`}</span>
      </div>`;
    const row = document.createElement("div"); row.className = "lessons";
    u.lessons.forEach(l=>{
      const st = profile.lessons[l.id]?.stars||0;
      const available = lessonAvailable(l);
      const b = document.createElement("div");
      b.className = "lesson" + (available?"":" locked") + (st>0?" done":"") + (l.id===cur.id?" current":"");
      b.innerHTML = `
        <div class="ln">${available?(st>0?"✓":"▸"):"🔒"}</div>
        <div class="lt">${l.title}</div>
        <div class="ls">${"★".repeat(st)}${"☆".repeat(3-st)}</div>`;
      if(available) b.onclick = ()=>openIntro(l);
      row.appendChild(b);
    });
    unitEl.appendChild(row); list.appendChild(unitEl);
  });
}

/* ---------- stats ---------- */
function renderStats(){
  const cards = $("statCards"); cards.innerHTML = "";
  const h = profile.history, done = doneCount(profile), stars = totalStars(profile);
  const best = h.length?Math.max(...h.map(x=>x.wpm)):0;
  const avg = h.length?Math.round(h.reduce((a,x)=>a+x.wpm,0)/h.length):0;
  const avgAcc = h.length?Math.round(h.reduce((a,x)=>a+x.acc,0)/h.length):0;
  [["Niveau",levelOf(profile.xp)],["XP total",profile.xp],
   ["Leçons terminées",done+" / "+LESSON_LIST.length],["Étoiles",stars],
   ["Meilleur WPM",best],["WPM moyen",avg],["Précision moy.",avgAcc+"%"],["Série",profile.streak+" j"]
  ].forEach(([l,v])=>cards.insertAdjacentHTML("beforeend",
    `<div class="stat-card"><small>${l}</small><b>${v}</b></div>`));
  const svg = $("wpmChart");
  const last = profile.history.slice(-24);
  if(!last.length){ svg.innerHTML = `<text x="300" y="90" text-anchor="middle" fill="#7a84a1" font-size="13">Lance une leçon pour voir ta courbe !</text>`; }
  else{
    const W=600,H=180,P=14;
    const maxY = Math.max(...last.map(x=>x.wpm),30);
    const line = last.map((x,i)=>{
      const lx = P+(i/Math.max(1,last.length-1))*(W-2*P);
      const ly = H-P-(x.wpm/maxY)*(H-2*P);
      return `${lx.toFixed(1)},${ly.toFixed(1)}`;
    }).join(" ");
    svg.innerHTML = `
      <line x1="${P}" y1="${H-P}" x2="${W-P}" y2="${H-P}" stroke="#e3e8f4" stroke-width="1"/>
      <polyline points="${line}" fill="none" stroke="#5b5ef2" stroke-width="2.5" style="filter:drop-shadow(0 0 4px rgba(91,94,242,.5))"/>`;
  }
  const wk = $("weakKeys"); wk.innerHTML = "";
  const sorted = Object.entries(profile.keyStats).filter(([k])=>k!=="SPACE").sort((a,b)=>b[1]-a[1]).slice(0,10);
  if(!sorted.length) wk.innerHTML = `<p class="no-weak">Rien à signaler — continue comme ça ! 💪</p>`;
  sorted.forEach(([k,n])=>wk.insertAdjacentHTML("beforeend",
    `<div class="weak-key">${k.toUpperCase()}<small>${n} err.</small></div>`));
}
function renderBadges(){
  const g = $("badgeGrid"); g.innerHTML = "";
  BADGES.forEach(b=>{
    const un = profile.badges.includes(b.id);
    g.insertAdjacentHTML("beforeend",
      `<div class="badge ${un?"unlocked":""}"><span class="em">${b.em}</span><h4>${b.name}</h4><p>${b.desc}</p></div>`);
  });
}

/* ============================================================
   8. PUBILS — sons, confettis, toasts
   ============================================================ */
let AC = null;
function beep(ok, tick){
  if(!profile.sound) return;
  try{
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = ok ? "sine" : "sawtooth";
    o.frequency.value = tick ? 880 : ok ? 660 : 150;
    g.gain.setValueAtTime(tick ? .04 : .12, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + (ok?.09:.2));
    o.connect(g).connect(AC.destination);
    o.start(); o.stop(AC.currentTime + (ok?.1:.22));
  }catch(e){}
}
const COLORS = ["#5b5ef2","#ffb93d","#22c58b","#ff5b6e","#8f8cff","#4dc9ff"];
function confetti(){
  const cv = $("confetti"), ctx = cv.getContext("2d");
  cv.width = innerWidth; cv.height = innerHeight;
  const parts = Array.from({length:90},()=>({
    x: cv.width/2 + (Math.random()-.5)*200, y: cv.height*.35,
    vx:(Math.random()-.5)*13, vy:-Math.random()*13-4,
    s:5+Math.random()*5, c:rand(COLORS), r:Math.random()*Math.PI, vr:(Math.random()-.5)*.3 }));
  let frames = 0;
  (function anim(){
    ctx.clearRect(0,0,cv.width,cv.height);
    parts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=.45; p.r+=p.vr;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r);
      ctx.fillStyle=p.c; ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s); ctx.restore();
    });
    if(++frames < 130) requestAnimationFrame(anim);
    else ctx.clearRect(0,0,cv.width,cv.height);
  })();
}
function toast(msg, kind=""){
  const t = document.createElement("div");
  t.className = "toast "+kind; t.textContent = msg;
  $("toasts").appendChild(t);
  setTimeout(()=>{ t.style.transition="all .4s"; t.style.opacity="0"; t.style.transform="translateX(30px)"; }, 2600);
  setTimeout(()=>t.remove(), 3100);
}

/* ============================================================
   9. ÉVÉNEMENTS & INIT
   ============================================================ */
$("tabs").addEventListener("click", e=>{
  const b = e.target.closest(".tab"); if(!b) return;
  showView(b.dataset.view);
});
$("btnContinue").onclick = ()=>openIntro(currentLesson());
function openIntro(l){
  $("introCrumb").textContent = `Unité ${l.unit+1} · ${l.unitTitle}`;
  $("introTitle").textContent = l.title;
  const ik = $("introKeys"); ik.innerHTML = "";
  const dk = l.sentences ? ["Aa"] : l.words ? ["abc"] : l.caps ? ["Aa"] : (l.keys||l.review);
  dk.forEach(k=>{ const d=document.createElement("div"); d.className="new-key"; d.textContent=k; ik.appendChild(d); });
  $("introTip").textContent = l.tip;
  $("introGoal").textContent = l.goal;
  showView("intro");
  $("btnStartLesson").onclick = ()=>startLesson(l);
}
$("btnRetry").onclick = ()=>{ if(S) startLesson(S.lesson); };
$("btnNext").onclick = ()=>{
  const i = LESSON_LIST.findIndex(l=>l.id===S.lesson.id);
  if(i>=0 && i<LESSON_LIST.length-1) openIntro(LESSON_LIST[i+1]);
};
$("btnSkip").onclick = ()=>{ showView("map"); clearGuides(); };
$("btnSound").onclick = ()=>{
  profile.sound = !profile.sound; profile.save();
  $("btnSound").textContent = profile.sound ? "🔊" : "🔇";
  toast(profile.sound ? "🔊 Sons activés" : "🔇 Sons coupés");
};
window.addEventListener("keydown", e=>{
  const typing = !$("view-type").classList.contains("hidden");
  if(!typing) return;
  if(e.key==="Escape"){ e.preventDefault(); showView("map"); clearGuides(); return; }
  if(e.key.length===1 || e.key===" "){
    e.preventDefault();
    if(e.key.length===1) onChar(e.key);
  }
});
window.addEventListener("keydown", e=>{
  if([" ","ArrowUp","ArrowDown","PageUp","PageDown"].includes(e.key)
     && !$("view-type").classList.contains("hidden")) e.preventDefault();
},{passive:false});
setInterval(()=>{ $("tip").textContent = TIPS[Math.floor(Math.random()*TIPS.length)] }, 10000);

profile.load();
$("btnSound").textContent = profile.sound ? "🔊" : "🔇";
updateHeader();
showView("map");
