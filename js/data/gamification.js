/**
 * Keycraft QWERTY V2 — Gamification System: Ranks, XP, 5-Star Grading, 14 Trophies & Confetti
 */

export const PLAYER_RANKS = [
  { level: 1, xpNeeded: 0, icon: '🌱', title: 'Explorateur F & J' },
  { level: 2, xpNeeded: 150, icon: '🧭', title: 'Apprenti Home Row' },
  { level: 3, xpNeeded: 400, icon: '⚡', title: 'Éclaireur QWERTY' },
  { level: 4, xpNeeded: 750, icon: '🛠️', title: 'Artisan des Touches' },
  { level: 5, xpNeeded: 1200, icon: '🎯', title: 'Dactylo Sans Regard' },
  { level: 6, xpNeeded: 1800, icon: '🚀', title: 'Pilote Haute Cadence' },
  { level: 7, xpNeeded: 2600, icon: '💎', title: 'Virtuose US-International' },
  { level: 8, xpNeeded: 3600, icon: '👑', title: 'Grand Maître 10 Doigts' },
];

export function getRankInfo(totalXp = 0) {
  let current = PLAYER_RANKS[0];
  let next = PLAYER_RANKS[1] || null;

  for (let i = 0; i < PLAYER_RANKS.length; i++) {
    if (totalXp >= PLAYER_RANKS[i].xpNeeded) {
      current = PLAYER_RANKS[i];
      next = PLAYER_RANKS[i + 1] || null;
    }
  }

  if (!next) {
    return {
      ...current,
      nextTitle: 'Rang Maximum',
      xpInLevel: totalXp - current.xpNeeded,
      xpSpan: 1000,
      pct: 100,
    };
  }

  const xpInLevel = totalXp - current.xpNeeded;
  const xpSpan = next.xpNeeded - current.xpNeeded;
  const pct = Math.max(0, Math.min(100, Math.round((xpInLevel / xpSpan) * 100)));

  return {
    ...current,
    nextTitle: next.title,
    xpInLevel,
    xpSpan,
    pct,
  };
}

/**
 * TypingClub-style 5-Star Grading:
 *  5★ : Accuracy >= 98% AND WPM >= 115% of target
 *  4★ : Accuracy >= 95% AND WPM >= 95% of target
 *  3★ : Accuracy >= 92% AND WPM >= 75% of target
 *  2★ : Accuracy >= 86%
 *  1★ : Completed (Accuracy >= 70% or any finish)
 */
export function computeStars(wpm, accuracy, targetWpm = 24) {
  const goal = Math.max(12, targetWpm);
  if (accuracy >= 98 && wpm >= Math.round(goal * 1.15)) return 5;
  if (accuracy >= 95 && wpm >= Math.round(goal * 0.95)) return 4;
  if (accuracy >= 92 && wpm >= Math.round(goal * 0.75)) return 3;
  if (accuracy >= 86) return 2;
  return 1;
}

export function computeXpReward({ stars, accuracy, maxCombo = 0, isBoss = false, isFirstClear = false }) {
  const base = stars * 22 + (isBoss ? 45 : 0) + (isFirstClear ? 30 : 0);
  const accBonus = accuracy === 100 ? 35 : accuracy >= 97 ? 20 : 0;
  const comboBonus = Math.min(45, Math.floor(maxCombo / 8) * 5);
  return {
    total: base + accBonus + comboBonus,
    base,
    accBonus,
    comboBonus,
  };
}

export const BADGES = [
  {
    id: 'first_step',
    icon: '🎉',
    title: 'Premier Pas',
    desc: 'Terminer votre toute première étape QWERTY.',
    check: (st) => Object.keys(st.stages).length >= 1,
  },
  {
    id: 'sniper_100',
    icon: '🎯',
    title: 'Précision Chirurgicale',
    desc: 'Réussir une étape avec 100 % de précision.',
    check: (st, ctx) => ctx?.accuracy === 100 && (ctx?.charsTyped || 0) >= 25,
  },
  {
    id: 'combo_40',
    icon: '🔥',
    title: 'En Feu (Combo ×40)',
    desc: 'Enchaîner 40 frappes consécutives sans la moindre faute.',
    check: (st, ctx) => (ctx?.maxCombo || 0) >= 40,
  },
  {
    id: 'combo_100',
    icon: '⚡',
    title: 'Intouchable (Combo ×100)',
    desc: 'Enchaîner 100 frappes justes d’affilée.',
    check: (st, ctx) => (ctx?.maxCombo || 0) >= 100,
  },
  {
    id: 'first_crown',
    icon: '👑',
    title: 'Première Couronne 5★',
    desc: 'Obtenir 5 étoiles sur une étape du parcours.',
    check: (st) => Object.values(st.stages).some((s) => s.stars >= 5),
  },
  {
    id: 'star_hunter_30',
    icon: '⭐',
    title: 'Collectionneur (30 ★)',
    desc: 'Cumuler au moins 30 étoiles dans le parcours.',
    check: (st) => Object.values(st.stages).reduce((a, s) => a + (s.stars || 0), 0) >= 30,
  },
  {
    id: 'star_master_90',
    icon: '🌟',
    title: 'Constellation (90 ★)',
    desc: 'Cumuler au moins 90 étoiles sur l’ensemble des mondes.',
    check: (st) => Object.values(st.stages).reduce((a, s) => a + (s.stars || 0), 0) >= 90,
  },
  {
    id: 'home_row_hero',
    icon: '🏠',
    title: 'Roi de la Home Row',
    desc: 'Valider les 6 étapes du Monde 1 (Fondations).',
    check: (st) => ['s01', 's02', 's03', 's04', 's05', 's06'].every((id) => (st.stages[id]?.stars || 0) >= 3),
  },
  {
    id: 'bye_azerty',
    icon: '🇫🇷',
    title: 'Adieu AZERTY !',
    desc: 'Vaincre le Boss du Monde 4 (Détox AZERTY → QWERTY).',
    check: (st) => (st.stages.s24?.stars || 0) >= 3,
  },
  {
    id: 'blind_ninja',
    icon: '🙈',
    title: 'Ninja Sans Regard',
    desc: 'Obtenir au moins 4★ avec le Mode Clavier Muet activé.',
    check: (st, ctx) => Boolean(ctx?.blindMode) && (ctx?.stars || 0) >= 4,
  },
  {
    id: 'speed_40',
    icon: '🏎️',
    title: 'Cap des 40 MPM',
    desc: 'Atteindre 40 mots par minute (précision ≥ 94 %).',
    check: (st) => st.totals.bestWpm >= 40,
  },
  {
    id: 'speed_65',
    icon: '🚀',
    title: 'Fusée 65 MPM',
    desc: 'Atteindre 65 mots par minute (précision ≥ 94 %).',
    check: (st) => st.totals.bestWpm >= 65,
  },
  {
    id: 'arcade_ace',
    icon: '🕹️',
    title: 'Pilote d’Arcade',
    desc: 'Remporter une victoire en mini-jeu AstroType ou NitroSprint.',
    check: (st, ctx) => Boolean(ctx?.arcadeWin),
  },
  {
    id: 'intl_polyglot',
    icon: '✨',
    title: 'Plume US-International',
    desc: 'Valider l’étape 34 des accents français sur QWERTY.',
    check: (st) => (st.stages.s34?.stars || 0) >= 3,
  },
];

/**
 * Lightweight 60fps Particle Confetti System
 */
export class ConfettiSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.particles = [];
    this.rafId = null;
  }

  burst(count = 75) {
    if (!this.ctx || !this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    const palette = ['#f26419', '#f6ae2d', '#22a06b', '#1d7afc', '#ff4d6d'];
    const cx = this.canvas.width * 0.5;
    const cy = this.canvas.height * 0.34;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 90,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4.5,
        size: 6 + Math.random() * 6,
        color: palette[i % palette.length],
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.25,
        life: 1,
        decay: 0.011 + Math.random() * 0.009,
      });
    }

    if (!this.rafId) {
      this.loop();
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.26; // gravity
      p.vx *= 0.985;
      p.rot += p.vrot;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.life);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rot);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.rafId = requestAnimationFrame(() => this.loop());
    } else {
      this.rafId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
