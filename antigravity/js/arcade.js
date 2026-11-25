/**
 * Keycraft QWERTY V2 — Arcade Canvas Mini-Games (AstroType & NitroSprint)
 * Used both as embedded TypingClub World Checkpoints and standalone Arcade games.
 */

import { soundEngine } from './audio.js?v=20261125-3';

export class ArcadeController {
  constructor(canvas, { onHudUpdate, onFinish }) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.onHudUpdate = onHudUpdate;
    this.onFinish = onFinish;

    this.mode = null; // 'astro' | 'sprint'
    this.running = false;
    this.rafId = null;
    this.lastTs = 0;

    // Shared stats
    this.score = 0;
    this.goalScore = 160;
    this.shields = 3;
    this.hits = 0;
    this.errors = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.startTime = 0;

    // AstroType state
    this.pool = [];
    this.meteors = [];
    this.lasers = [];
    this.particles = [];
    this.lockedId = null;
    this.spawnCooldown = 0;
    this.nextId = 1;

    // NitroSprint state
    this.raceText = '';
    this.raceCursor = 0;
    this.botWpm = 26;
    this.boostGlow = 0;
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(600, Math.round(rect.width || 860));
    this.canvas.height = Math.max(360, Math.round(rect.height || 410));
  }

  startAstro({ pool, goalScore = 160 }) {
    this.stop();
    this.resizeCanvas();
    this.mode = 'astro';
    this.pool = pool && pool.length > 0 ? pool : ['fast', 'jump', 'code', 'zero', 'calm'];
    this.goalScore = goalScore;
    this.score = 0;
    this.shields = 3;
    this.hits = 0;
    this.errors = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.meteors = [];
    this.lasers = [];
    this.particles = [];
    this.lockedId = null;
    this.spawnCooldown = 0.25;
    this.startTime = performance.now();
    this.lastTs = this.startTime;
    this.running = true;

    this.emitHud();
    this.loop(this.startTime);
  }

  startSprint({ text, botWpm = 26 }) {
    this.stop();
    this.resizeCanvas();
    this.mode = 'sprint';
    this.raceText = (text || 'keep your steady rhythm and win the race').trim();
    this.raceCursor = 0;
    this.botWpm = botWpm;
    this.score = 0;
    this.shields = 3;
    this.hits = 0;
    this.errors = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.boostGlow = 0;
    this.particles = [];
    this.startTime = performance.now();
    this.lastTs = this.startTime;
    this.running = true;

    this.emitHud();
    this.loop(this.startTime);
  }

  handleChar(ch) {
    if (!this.running || !ch) return;

    if (this.mode === 'astro') {
      this.handleAstroChar(ch);
    } else if (this.mode === 'sprint') {
      this.handleSprintChar(ch);
    }
  }

  handleAstroChar(ch) {
    let target = this.meteors.find((m) => m.id === this.lockedId);

    if (!target) {
      // Lock onto lowest meteor matching typed first character
      const candidates = this.meteors
        .filter((m) => m.word[m.typed] === ch)
        .sort((a, b) => b.y - a.y);
      target = candidates[0] || null;
      if (target) {
        this.lockedId = target.id;
      }
    }

    if (target && target.word[target.typed] === ch) {
      target.typed += 1;
      this.hits += 1;
      this.combo += 1;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      soundEngine.playLaser();

      const w = this.canvas.width;
      const h = this.canvas.height;
      this.lasers.push({
        x1: w * 0.5,
        y1: h - 34,
        x2: target.x,
        y2: target.y,
        life: 1,
      });
      this.spawnSparks(target.x, target.y, '#38bdf8', 6);

      if (target.typed >= target.word.length) {
        this.score += target.word.length * 10 + Math.min(25, this.combo * 2);
        this.spawnSparks(target.x, target.y, '#f59e0b', 18);
        soundEngine.playDiscoveryHit();
        this.meteors = this.meteors.filter((m) => m.id !== target.id);
        this.lockedId = null;

        if (this.score >= this.goalScore) {
          this.completeGame(true);
          return;
        }
      }
    } else {
      this.errors += 1;
      this.combo = 0;
      soundEngine.playError();
    }

    this.emitHud();
  }

  handleSprintChar(ch) {
    const expected = this.raceText[this.raceCursor];
    if (ch === expected) {
      this.raceCursor += 1;
      this.hits += 1;
      this.combo += 1;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.boostGlow = 1;
      soundEngine.playKey(ch === ' ');

      if (this.raceCursor >= this.raceText.length) {
        this.completeGame(true);
        return;
      }
    } else {
      this.errors += 1;
      this.combo = 0;
      soundEngine.playError();
    }
    this.emitHud();
  }

  spawnMeteor() {
    const w = this.canvas.width;
    const word = this.pool[Math.floor(Math.random() * this.pool.length)];
    const margin = 90;
    const x = margin + Math.random() * Math.max(120, w - margin * 2);
    const speed = 36 + Math.random() * 24 + Math.min(28, this.score * 0.09);
    this.meteors.push({
      id: this.nextId++,
      word,
      typed: 0,
      x,
      y: -22,
      speed,
    });
  }

  spawnSparks(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color,
        life: 1,
      });
    }
  }

  loop(ts) {
    if (!this.running) return;
    const dt = Math.min(0.05, Math.max(0.001, (ts - this.lastTs) / 1000));
    this.lastTs = ts;

    if (this.mode === 'astro') {
      this.updateAstro(dt);
      this.drawAstro();
    } else {
      this.updateSprint(dt);
      this.drawSprint();
    }

    if (this.running) {
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }
  }

  updateAstro(dt) {
    this.spawnCooldown -= dt;
    if (this.spawnCooldown <= 0 && this.meteors.length < 6) {
      this.spawnMeteor();
      this.spawnCooldown = Math.max(0.85, 1.75 - this.score * 0.0025);
    }

    const bottomY = this.canvas.height - 46;
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.y += m.speed * dt;
      if (m.y >= bottomY) {
        if (this.lockedId === m.id) this.lockedId = null;
        this.meteors.splice(i, 1);
        this.shields -= 1;
        this.combo = 0;
        this.spawnSparks(m.x, bottomY, '#ef4444', 20);
        soundEngine.playError();
        this.emitHud();
        if (this.shields <= 0) {
          this.completeGame(false);
          return;
        }
      }
    }

    for (let i = this.lasers.length - 1; i >= 0; i--) {
      this.lasers[i].life -= dt * 7.5;
      if (this.lasers[i].life <= 0) this.lasers.splice(i, 1);
    }

    this.updateParticles(dt);
  }

  updateSprint(dt) {
    this.boostGlow = Math.max(0, this.boostGlow - dt * 2.5);
    this.updateParticles(dt);
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.life -= dt * 2.4;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  drawAstro() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, w, h);

    // Subtle horizon defense line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h - 42);
    ctx.lineTo(w, h - 42);
    ctx.stroke();

    // Lasers
    for (const l of this.lasers) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, l.life);
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
      ctx.restore();
    }

    // Turret base
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(w * 0.5, h - 28, 18, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(w * 0.5 - 4, h - 48, 8, 14);

    // Meteors & word pills
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';

    for (const m of this.meteors) {
      const isLocked = m.id === this.lockedId;
      const donePart = m.word.slice(0, m.typed);
      const remPart = m.word.slice(m.typed);
      const textW = ctx.measureText(m.word).width;
      const boxW = textW + 24;
      const boxH = 34;

      ctx.fillStyle = isLocked ? 'rgba(249, 115, 22, 0.24)' : 'rgba(30, 41, 59, 0.92)';
      ctx.strokeStyle = isLocked ? '#fb923c' : 'rgba(148, 163, 184, 0.45)';
      ctx.lineWidth = isLocked ? 2.2 : 1.3;
      this.roundRect(ctx, m.x - boxW / 2, m.y - boxH / 2, boxW, boxH, 9);
      ctx.fill();
      ctx.stroke();

      const startX = m.x - textW / 2;
      ctx.fillStyle = '#34d399';
      ctx.fillText(donePart, startX, m.y + 1);
      const doneW = ctx.measureText(donePart).width;
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(remPart, startX + doneW, m.y + 1);
    }

    this.drawParticles();
  }

  drawSprint() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, w, h);

    const elapsedMin = Math.max(0.001, (performance.now() - this.startTime) / 60000);
    const botChars = elapsedMin * this.botWpm * 5;
    const botRatio = Math.min(1, botChars / Math.max(1, this.raceText.length));
    const playerRatio = Math.min(1, this.raceCursor / Math.max(1, this.raceText.length));

    const trackLeft = 70;
    const trackRight = w - 95;
    const trackSpan = trackRight - trackLeft;

    // Lanes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 2;
    [95, 165, 235].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w - 40, y);
      ctx.stroke();
    });

    // Finish line
    ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
    ctx.fillRect(trackRight + 22, 95, 6, 140);

    // Bot Pod (Top Lane)
    const botX = trackLeft + botRatio * trackSpan;
    this.drawRacer(botX, 130, '#38bdf8', `Rival (${this.botWpm} MPM)`, false);

    // Player Pod (Bottom Lane)
    const playerX = trackLeft + playerRatio * trackSpan;
    this.drawRacer(playerX, 200, '#f97316', 'Vous', this.boostGlow > 0.1);

    // Prompt window at bottom of canvas
    const boxY = 268;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 36, boxY, w - 72, 108, 12);
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 21px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';

    const windowStart = Math.max(0, this.raceCursor - 18);
    const slice = this.raceText.slice(windowStart, windowStart + 46);
    let drawX = 60;
    const drawY = boxY + 54;

    for (let i = 0; i < slice.length; i++) {
      const idx = windowStart + i;
      const ch = slice[i];
      const cw = ctx.measureText(ch).width;

      if (idx === this.raceCursor) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
        ctx.fillRect(drawX - 1, drawY - 15, cw + 2, 30);
        ctx.fillStyle = '#ffffff';
      } else if (idx < this.raceCursor) {
        ctx.fillStyle = '#34d399';
      } else {
        ctx.fillStyle = '#94a3b8';
      }

      ctx.fillText(ch === ' ' && idx === this.raceCursor ? '␣' : ch, drawX, drawY);
      drawX += cw;
    }

    this.drawParticles();
  }

  drawRacer(x, y, color, label, boosting) {
    const { ctx } = this;
    if (boosting) {
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(x - 26, y);
      ctx.lineTo(x - 46 - Math.random() * 12, y - 7);
      ctx.lineTo(x - 46 - Math.random() * 12, y + 7);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = color;
    this.roundRect(ctx, x - 26, y - 13, 52, 26, 8);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(label, x - 24, y - 22);
  }

  drawParticles() {
    const { ctx } = this;
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  }

  emitHud() {
    const elapsedMs = Math.max(250, performance.now() - this.startTime);
    const wpm = this.hits >= 3 ? Math.round(this.hits / 5 / (elapsedMs / 60000)) : 0;
    const total = this.hits + this.errors;
    const accuracy = total > 0 ? Math.round((this.hits / total) * 100) : 100;

    this.onHudUpdate?.({
      mode: this.mode,
      score: this.score,
      goalScore: this.goalScore,
      shields: this.shields,
      wpm,
      accuracy,
      combo: this.combo,
    });
  }

  completeGame(won) {
    this.stop();
    const elapsedMs = Math.max(500, performance.now() - this.startTime);
    const wpm = this.hits >= 3 ? Math.round(this.hits / 5 / (elapsedMs / 60000)) : 20;
    const total = this.hits + this.errors;
    const accuracy = total > 0 ? Math.round((this.hits / total) * 100) : 100;

    let stars = 2;
    if (won) {
      if (this.mode === 'astro') {
        stars = this.shields === 3 && accuracy >= 95 ? 5 : this.shields >= 2 ? 4 : 3;
      } else {
        const beatBot = wpm >= this.botWpm;
        stars = beatBot && accuracy >= 96 ? 5 : beatBot ? 4 : 3;
      }
    } else {
      stars = this.score >= this.goalScore * 0.5 ? 2 : 1;
    }

    this.onFinish?.({
      won,
      stars,
      wpm,
      rawWpm: wpm,
      accuracy,
      elapsedMs,
      charsTyped: this.hits,
      maxCombo: this.maxCombo,
      timeline: [],
      sessionWeakList: [],
    });
  }
}
