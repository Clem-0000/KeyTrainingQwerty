/**
 * Benchmark Hub Controller — Switch seamlessly between Antigravity, Mistral 4, and GLM
 */

const CANDIDATES = {
  antigravity: {
    id: 'antigravity',
    title: 'Antigravity — Keycraft QWERTY',
    url: './antigravity/index.html',
    dir: './antigravity/',
  },
  mistral: {
    id: 'mistral',
    title: 'Mistral 4 — KeyTrain',
    url: './mistral/index.html',
    dir: './mistral/',
  },
  glm: {
    id: 'glm',
    title: 'GLM — QwertyLab',
    url: './glm/index.html',
    dir: './glm/',
  },
};

const landingEl = document.getElementById('hub-landing');
const comparatorEl = document.getElementById('comparator-shell');
const frameEl = document.getElementById('comparator-iframe');
const directLinkEl = document.getElementById('comparator-direct-link');
const backBtn = document.getElementById('back-to-hub-btn');
const themeBtns = document.querySelectorAll('[data-toggle-theme]');
const pillBtns = document.querySelectorAll('[data-switch-target]');
const cardLaunchBtns = document.querySelectorAll('[data-launch-target]');

const THEME_KEY = 'qwerty_hub_theme';

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  themeBtns.forEach((btn) => {
    btn.textContent = theme === 'dark' ? 'Thème clair' : 'Thème sombre';
  });
}

function openCandidate(key, updateHash = true) {
  const target = CANDIDATES[key];
  if (!target) return showGallery(updateHash);

  landingEl.hidden = true;
  comparatorEl.hidden = false;
  document.title = `${target.title} · Banc d’essai QWERTY`;

  pillBtns.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.switchTarget === key);
  });

  directLinkEl.href = target.dir;
  if (frameEl.dataset.current !== key) {
    frameEl.dataset.current = key;
    frameEl.src = target.url;
  } else {
    focusIframe();
  }

  if (updateHash && window.location.hash !== `#${key}`) {
    history.pushState(null, '', `#${key}`);
  }
}

function showGallery(updateHash = true) {
  comparatorEl.hidden = true;
  landingEl.hidden = false;
  document.title = 'Banc d’essai IA — Apprendre le clavier QWERTY (Antigravity · Mistral 4 · GLM)';
  if (updateHash && window.location.hash) {
    history.pushState(null, '', window.location.pathname + window.location.search);
  }
}

function focusIframe() {
  try {
    frameEl.focus();
    frameEl.contentWindow?.focus();
  } catch {
    // Ignore cross-frame focus restrictions if any
  }
}

frameEl.addEventListener('load', () => {
  focusIframe();
});

cardLaunchBtns.forEach((btn) => {
  btn.addEventListener('click', () => openCandidate(btn.dataset.launchTarget));
});

pillBtns.forEach((btn) => {
  btn.addEventListener('click', () => openCandidate(btn.dataset.switchTarget));
});

backBtn.addEventListener('click', () => showGallery(true));

themeBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const curr = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(curr === 'dark' ? 'light' : 'dark');
  });
});

window.addEventListener('popstate', () => {
  const hash = window.location.hash.replace(/^#/, '');
  if (CANDIDATES[hash]) {
    openCandidate(hash, false);
  } else {
    showGallery(false);
  }
});

initTheme();
const initialHash = window.location.hash.replace(/^#/, '');
if (CANDIDATES[initialHash]) {
  openCandidate(initialHash, false);
}
