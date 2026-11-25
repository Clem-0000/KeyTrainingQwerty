/* ================= QwertyLab — tout-en-un, 0 dépendance ================= */
"use strict";

/* ---------- définition du clavier QWERTY ---------- */
const ROWS = [
  [["`"],["1"],["2"],["3"],["4"],["5"],["6"],["7"],["8"],["9"],["0"],["-"],["="]],
  [["q"],["w"],["e"],["r"],["t"],["y"],["u"],["i"],["o"],["p"],["["],["]"]],
  [["a"],["s"],["d"],["f"],["g"],["h"],["j"],["k"],["l"],[";"],["'"]],
  [["z"],["x"],["c"],["v"],["b"],["n"],["m"],[","],["."],["/"]],
  [["SPACE","wide space"]],
];
const KEY_FINGER = {
  "`":"lpinky","1":"lpinky","2":"lring","3":"lmid","4":"lindex","5":"lindex",
  "6":"rindex","7":"rindex","8":"rmid","9":"rring","0":"rpinky","-":"rpinky","=":"rpinky",
  "q":"lpinky","w":"lring","e":"lmid","r":"lindex","t":"lindex",
  "y":"rindex","u":"rindex","i":"rmid","o":"rring","p":"rpinky","[":"rpinky","]":"rpinky",
  "a":"lpinky","s":"lring","d":"lmid","f":"lindex","g":"lindex",
  "h":"rindex","j":"rindex","k":"rmid","l":"rring",";":"rpinky","'":"rpinky",
  "z":"lpinky","x":"lring","c":"lmid","v":"lindex","b":"lindex",
  "n":"rindex","m":"rindex",",":"rmid",".":"rring","/":"rpinky",
  "SPACE":"lthumb", " ":"lthumb",
};
const FINGER_KEY = {};
for (const k in KEY_FINGER){ const f = KEY_FINGER[k]; (FINGER_KEY[f] ??= []).push(k); }

/* ---------- leçons (progressives, doigt par doigt) ---------- */
const rand = a => a[Math.floor(Math.random()*a.length)];
function rep(pool,n){ return Array.from({length:n},()=>rand(pool)).join(" "); }

const LESSONS = [
  { title:"Rangée de base", lvl:"1 · Ancrage", desc:"asdf jkl; — retrouve tes points d'ancrage F et J sans regarder.",
    gen:()=>rep(["asdf","jjj","fff","jkl","asdf","jkl;","ffjj","dkss","aa",";;","fj","fj","dk"],10) },
  { title:"Index gérés", lvl:"2 · Index", desc:"F/G pour l'index gauche, J/H pour le droit, tout en restant ancré.",
    gen:()=>rep(["gf","hj","fg","jh","gg","hh","gfjh","fjgh","gfhj"],10) },
  { title:"Majeurs & annulaires", lvl:"3 · Doigts faibles", desc:"D/K puis S/L — les doigts les plus lents. Prends ton temps.",
    gen:()=>rep(["dd","kk","ss","ll","sk","dl","dk","ls","dksl","sldk"],10) },
  { title:"Auriculaires", lvl:"4 · Auriculaires", desc:"A et ; — les oubliés du clavier. Renforce-les maintenant.",
    gen:()=>rep(["aa",";;","aj","a;","a;s","sla","a;l",";a"],10) },
  { title:"Rangée du haut", lvl:"5 · Extension", desc:"QWERT YUIOP — étire sans bouger la paume.",
    gen:()=>rep(["qq","pp","we","rt","yu","io","qwerty","poiuy","tre","uyo"],10) },
  { title:"> & <", lvl:"6 · Majuscules", desc:"Virgule et point avec les majeurs/annulaires droits.",
    gen:()=>rep(["..",",,","a,b.","n,m","b.c","..,,","a,z."],10) },
  { title:"Rangée du bas", lvl:"7 · Le grand saut", desc:"ZXCV BNM — contrôle ton retour à la base.",
    gen:()=>rep(["zz","xx","cv","bn","zxc","vbn","zxcvbnm","mm","nn"],10) },
  { title:"Nombres", lvl:"8 · Chiffres", desc:"12345 67890 — les deux index se partagent le milieu.",
    gen:()=>rep(["11","22","33","44","55","66","77","88","99","00","12","98","45","67"],10) },
  { title:"Mots courts", lvl:"9 · Vocabulaire", desc:"Mots de 3 lettres : rythme et régularité.",
    gen:()=>Array.from({length:14},()=>rand(["le","un","de","et","il","ou","en","ce","que","pas","sur","les","est","pour","dans","que"])).join(" ") },
  { title:"Mots courants", lvl:"10 · Vitesse", desc:"Les mots les plus fréquents de l'anglais.",
    gen:()=>Array.from({length:14},()=>rand(["the","and","you","that","have","for","not","are","with","this","but","his","from","they","one","all"])).join(" ") },
  { title:"Phrases", desc:"Texte continu : garde tes mains posées, respire, et ne baisse pas le rythme.",
    lvl:"11 · Terrain réel",
    gen:()=>rand([
      "the quick brown fox jumps over the lazy dog while typing at full speed",
      "practice makes perfect so keep your fingers on the home row and relax",
      "speed comes from accuracy first so type each letter with intent",
      "your hands should float over the keys like a pianist playing softly",
    ]),
  },
];
const TIPS = [
  "Ne regarde pas tes mains. Trouve les bosses sur F et J : ce sont tes points d'ancrage.",
  "La vitesse vient de la précision. Frappe juste avant de frapper vite.",
  "Revient toujours en position de base après chaque touche éloignée.",
  "Garde les poignets flottants, appuyés sur rien. Tes avant-bras font le travail.",
  "Si tu hésites sur une touche, ralentis volontairement une session entière.",
  "Respire ! Un typiste tendu tape avec des doigts de bois.",
];

const WORDS = ("the of and to in is you that it he was for on are as with his they at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part over new sound take only little work know place year live me back give most very after thing our just name good sentence man think say great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end does another well large must big even such because").split(" ");

/* ---------- persistence ---------- */
const LS_KEY = "qwertylab.v1";
const store = {
  data: null,
  load(){ try{ this.data = JSON.parse(localStorage.getItem(LS_KEY)) || null }catch(e){ this.data = null }
    if(!this.data) this.data = { history:[], lessons:{}, keys:{} }; return this.data; },
  save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(this.data)) }catch(e){} },
  clear(){ this.data = { history:[], lessons:{}, keys:{} }; this.save(); },
};

/* ---------- construction du clavier visuel ---------- */
const kbEl = document.getElementById("keyboard");
const keyEls = {};
function buildKeyboard(){
  kbEl.innerHTML = "";
  ROWS.forEach(row=>{
    const r = document.createElement("div"); r.className = "krow";
    row.forEach(([label, cls])=>{
      const k = document.createElement("div");
      const d = cls && cls.includes("space") ? "SPACE" : label;
      k.className = `key ${cls||""} ${KEY_FINGER[d]||""} ${"fjh".includes(d)?"homing":""}`;
      k.textContent = d === "SPACE" ? "" : d;
      if (d==="SPACE") k.style.textTransform="none";
      keyEls[d] = k; r.appendChild(k);
    });
    kbEl.appendChild(r);
  });
}

/* ---------- références DOM ---------- */
const $ = id => document.getElementById(id);
const views = { learn:$("view-learn"), session:$("view-session"), wordrush:$("view-wordrush"), stats:$("view-stats") };
const textEl = $("textDisplay");
const lessonGrid = $("lessonGrid");

/* ---------- état de session ---------- */
let S = null; // session courante
function newSession(type, text, meta){
  S = {
    type, meta: meta||{},
    chars: [...text],
    idx: 0, errors: 0, totalTyped: 0,
    startAt: null, endAt: null, finished: false,
    wrongKeys: {},
    timerEnd: type === "wordrush" ? Date.now() + (meta.duration*1000) : null,
  };
  $("result").classList.add("hidden");
  $("lessonTitle").textContent = meta?.title || "Entraînement";
  $("mErr").textContent = "0"; $("mAcc").textContent = "100%"; $("mWpm").textContent="0"; $("mTime").textContent="0:00";
  renderText();
  showView("session");
  textEl.focus();
}

function renderText(){
  textEl.innerHTML = "";
  S.chars.forEach((c,i)=>{
    const s = document.createElement("span");
    s.className = "char" + (i===0 ? " current caret":"");
    s.textContent = c;
    textEl.appendChild(s);
  });
}

function updateCaret(){
  [...textEl.children].forEach((el,i)=>{
    el.className = "char" + (i<S.idx ? (el.dataset.wrong ? " wrong" : " correct") : "") + (i===S.idx ? " current caret":"");
  });
  // clavier + mains
  document.querySelectorAll(".key.next,.key.error").forEach(e=>e.classList.remove("next","error"));
  document.querySelectorAll(".finger.active").forEach(e=>e.classList.remove("active"));
  const next = S.chars[S.idx];
  if(next !== undefined && !S.finished){
    const d = next === " " ? "SPACE" : next.toLowerCase();
    if(next === next.toUpperCase() && next.toLowerCase() !== next){ /* maj : pas géré visuellement */ }
    const kEl = keyEls[d]; if(kEl) kEl.classList.add("next");
    const fEl = document.querySelector(`.finger[data-finger="${KEY_FINGER[d]?.replace(/^(l|r)/,'$1-')}"]`);
    if(fEl) fEl.classList.add("active");
  }
  // barre de progression
  $("raceCar").style.left = `calc(${(S.idx/S.chars.length)*92}% + 4px)`;

}

function fmtTime(s){ return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,"0")}` }
function tick(){
  if(!S || S.finished) return;
  const now = Date.now();
  if(S.timerEnd && now >= S.timerEnd){ finish(); return; }
  if(S.startAt){
    const el = (now - S.startAt)/1000;
    $("mTime").textContent = fmtTime(el);
    const wpm = el > 0 ? (S.idx/5)/(el/60) : 0;
    $("mWpm").textContent = Math.max(0,Math.round(wpm));
    $("liveWpm").textContent = Math.max(0,Math.round(wpm));
    if(S.timerEnd) $("raceCar").style.left = `calc(${100*(1-(S.timerEnd-now)/(S.meta.duration*1000))*0.92}% + 4px)`;
  }
}

function handleChar(ch){
  if(!S || S.finished) return;
  if(!S.startAt) S.startAt = Date.now();
  const expected = S.chars[S.idx];
  const el = textEl.children[S.idx];
  const dExpect = expected === " " ? "SPACE" : expected.toLowerCase();
  const dGot = ch === " " ? "SPACE" : ch.toLowerCase();

  S.totalTyped++;
  if(ch === expected){
    delete el.dataset.wrong;
    S.idx++;
    const kEl = keyEls[dExpect];
    if(kEl){ kEl.classList.add("pressed"); setTimeout(()=>kEl.classList.remove("pressed"),90); }
  }else{
    S.errors++;
    el.dataset.wrong = "1";
    if(dExpect !== " ") S.wrongKeys[dExpect] = (S.wrongKeys[dExpect]||0)+1;
    const kEl = keyEls[dGot] || keyEls[dExpect];
    if(kEl){ kEl.classList.add("error"); setTimeout(()=>kEl.classList.remove("error"),180); return; } // erreur : n'avance pas
  }
  const acc = Math.round((1 - S.errors/Math.max(1,S.totalTyped))*100);
  $("mAcc").textContent = acc+"%"; $("mErr").textContent = S.errors;
  updateCaret();
  if(S.idx >= S.chars.length && !S.timerEnd) finish();
}

function finish(){
  if(!S || S.finished) return;
  S.finished = true; S.endAt = Date.now();
  const dur = Math.max(1,(S.endAt - S.startAt)/1000);
  const correct = S.idx;
  const wpm = Math.round((correct/5)/(dur/60));
  const acc = Math.round((1 - S.errors/Math.max(1,S.totalTyped))*100);

  // recommencer un rush d'un mot si temps restant ? non : fin.
  const entry = { t:Date.now(), type:S.type, title:S.meta.title||S.type, wpm, acc, dur:Math.round(dur), errors:S.errors };
  const d = store.load();
  d.history.push(entry);
  if(S.type==="learn"){
    const id = S.meta.id;
    const prev = d.lessons[id];
    const stars = acc>=95 ? (wpm>=50?3:wpm>=35?2:1) : acc>=90 ? 1 : 0;
    if(!prev || wpm > prev.wpm || stars > (prev.stars||0))
      d.lessons[id] = { wpm:Math.max(wpm,prev?.wpm||0), stars:Math.max(stars,prev?.stars||0), acc };
  }
  for(const k in S.wrongKeys) d.keys[k] = (d.keys[k]||0) + S.wrongKeys[k];
  store.save();

  $("rWpm").textContent = wpm; $("rAcc").textContent = acc+"%";
  $("rTime").textContent = Math.round(dur)+"s"; $("rErr").textContent = S.errors;
  $("resultTitle").textContent = acc >= 95 && wpm >= 40 ? "🔥 Excellent !" : acc >= 90 ? "Bien joué !" : "Continue, la précision d'abord !";
  const worst = Object.entries(S.wrongKeys).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,n])=>`« ${k==="SPACE"?"espace":k} » (${n}×)`);
  $("resultKeys").textContent = worst.length ? "À retravailler : " + worst.join(", ") : "Aucune touche faible sur cette session 👌";
  $("btnNext").classList.toggle("hidden", S.type!=="learn");
  $("result").classList.remove("hidden");
}

/* ---------- navigation / vues ---------- */
function showView(name){
  Object.entries(views).forEach(([k,v])=>v.classList.toggle("hidden", k!==name));
  if(name==="learn") renderLessons();
  if(name==="stats") renderStats();
  if(name!=="session") $("liveWpm").textContent = "0";
  if(name==="wordrush") $("lessonTitle");
}
function renderLessons(){
  const d = store.load();
  lessonGrid.innerHTML = "";
  LESSONS.forEach((L,i)=>{
    const b = d.lessons[i];
    const card = document.createElement("div");
    card.className = "lesson";
    card.innerHTML = `
      ${b?`<span class="best">${b.wpm} wpm</span>`:""}
      <span class="lvl">${L.lvl}</span>
      <h3>${L.title}</h3>
      <p>${L.desc}</p>
      <div class="stars">${"★".repeat(b?.stars||0)}${"☆".repeat(3-(b?.stars||0))}</div>`;
    card.onclick = ()=> newSession("learn", L.gen(), {id:i, title:`${L.lvl} — ${L.title}`});
    lessonGrid.appendChild(card);
  });
}

function renderStats(){
  const d = store.load();
  const h = d.history;
  const cards = $("statCards"); cards.innerHTML = "";
  if(!h.length){
    cards.innerHTML = `<div class="stat-card" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">
      Aucune session enregistrée — lance un cours et reviens ici !</div>`;
    $("chart").innerHTML = ""; $("weakKeys").innerHTML = ""; return;
  }
  const best = Math.max(...h.map(s=>s.wpm));
  const avg = Math.round(h.reduce((a,s)=>a+s.wpm,0)/h.length);
  const avgAcc = Math.round(h.reduce((a,s)=>a+s.acc,0)/h.length);
  const total = h.length;
  [["Meilleur WPM",best],["WPM moyen",avg],["Précision moy.",avgAcc+"%"],["Sessions",total]].forEach(([l,v])=>{
    cards.insertAdjacentHTML("beforeend",`<div class="stat-card"><small>${l}</small><b>${v}</b></div>`);
  });
  // courbe WPM (20 dernières sessions)
  const last = h.slice(-20);
  const W=600,H=200,P=10;
  const maxY = Math.max(...last.map(s=>s.wpm),20);
  const pts = last.map((s,i)=>{
    const x = P + (i/Math.max(1,last.length-1))*(W-2*P);
    const y = H-P - (s.wpm/maxY)*(H-2*P);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const accLine = last.map((s,i)=>{
    const x = P + (i/Math.max(1,last.length-1))*(W-2*P);
    const y = H-P - (s.acc/100)*(H-2*P);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  $("chart").innerHTML = `
    <polyline points="${accLine}" fill="none" stroke="var(--warn)" stroke-width="1.5" opacity=".6"/>
    <polyline points="${pts}" fill="none" stroke="var(--neon2)" stroke-width="2.5"
      style="filter:drop-shadow(0 0 4px var(--neon2))"/>`;
  // touches faibles
  const wk = $("weakKeys"); wk.innerHTML = "";
  const sorted = Object.entries(d.keys).filter(([k])=>k!=="SPACE").sort((a,b)=>b[1]-a[1]).slice(0,10);
  if(!sorted.length) wk.innerHTML = `<p style="color:var(--muted)">Rien à signaler pour l'instant.</p>`;
  sorted.forEach(([k,n])=> wk.insertAdjacentHTML("beforeend",
    `<div class="weak-key">${k.toUpperCase()==k?k:k.toUpperCase()}<small>${n} erreurs</small></div>`));
}

/* ---------- éditeur de mots (wordrush) ---------- */
function genWords(seconds){
  const count = 60 * seconds / 3; // dense, régénéré à la fin si besoin
  let text = Array.from({length:Math.round(count)},()=>rand(WORDS)).join(" ");
  return text;
}

/* ---------- events ---------- */
document.getElementById("tabs").addEventListener("click", e=>{
  const b = e.target.closest(".tab"); if(!b) return;
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===b));
  const mode = b.dataset.mode;
  if(mode==="drill"){ newSession("drill", genDrill(), {title:"Cadence ciblée · tes touches faibles"}); return; }
  showView(mode);
});

textEl.addEventListener("click", ()=> textEl.focus());
window.addEventListener("keydown", e=>{
  if(!views.session || views.session.classList.contains("hidden")) {
    if(e.key==="Escape") return;
    return;
  }
  if(!$("result").classList.contains("hidden")){
    if(e.key==="Enter"){ e.preventDefault(); $("btnAgain").click(); }
    return;
  }
  if(e.key==="Escape"){ showView(S?.type==="learn" ? "learn" : "wordrush"); return; }
  if(e.key==="Tab"){ e.preventDefault(); $("btnRestart").click(); return; }
  if(e.key.length===1){ e.preventDefault(); handleChar(e.key); }
});

$("btnBack").onclick = ()=> showView(S?.type==="wordrush" ? "wordrush" : "learn");
$("btnRestart").onclick = ()=>{
  if(!S) return;
  let text;
  if(S.type==="learn") text = LESSONS[S.meta.id].gen();
  else if(S.type==="drill") text = genDrill();
  else text = genWords(S.meta.duration);
  newSession(S.type, text, S.meta);
};
$("btnAgain").onclick = ()=> $("btnRestart").click();
$("btnNext").onclick = ()=>{
  const nextId = (S.meta.id+1) % LESSONS.length;
  S.meta.id = nextId; $("btnRestart").click();
};
$("btnClearStats").onclick = ()=>{ if(confirm("Effacer tout l'historique ?")){ store.clear(); renderStats(); } };
document.querySelectorAll("[data-rush]").forEach(b=>{
  b.onclick = ()=>{ const dur = +b.dataset.rush; newSession("wordrush", genWords(dur), {duration:dur, title:`Mots · ${dur}s`}); };
});

/* mode drill : mots ciblant tes touches faibles */
function genDrill(){
  const d = store.load();
  const weak = Object.entries(d.keys).filter(([k])=>k!=="SPACE").sort((a,b)=>b[1]-a[1])
    .slice(0,4).map(([k])=>k);
  let pool;
  if(weak.length){
    pool = WORDS.filter(w => weak.some(k => w.includes(k)));
    if(pool.length < 10) pool = WORDS;
  } else pool = WORDS.slice(0,120);
  return Array.from({length:15},()=>rand(pool)).join(" ");
}

/* astuce rotative */
setInterval(()=>{ $("tip").textContent = TIPS[Math.floor(Math.random()*TIPS.length)] }, 9000);

/* perturbation focale du défilement */
window.addEventListener("keydown", e=>{
  if([" ","ArrowUp","ArrowDown"].includes(e.key) && !views.session.classList.contains("hidden")) e.preventDefault();
}, {passive:false});

/* ---------- init ---------- */
store.load();
buildKeyboard();
newSessionInit: {
  showView("learn");
}
