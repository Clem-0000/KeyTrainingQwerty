/**
 * Synthesized Tactile & Gamified Audio Engine (Web Audio API — Zero External Files)
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.noiseBuffer = null;
    this.profile = 'thock'; // 'thock' | 'bubble' | 'tactile' | 'typewriter' | 'off'
  }

  setProfile(profile) {
    this.profile = profile;
  }

  ensureContext() {
    if (this.profile === 'off') return false;
    if (!this.ctx && typeof globalThis.window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.noiseBuffer = this.createNoiseBuffer();
    }
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  createNoiseBuffer() {
    const length = Math.floor(this.ctx.sampleRate * 0.045);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (length * 0.28));
    }
    return buffer;
  }

  playKey(isSpace = false) {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const jitter = 0.96 + Math.random() * 0.08;

    if (this.profile === 'bubble') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const base = isSpace ? 260 : 390;
      osc.frequency.setValueAtTime(base * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(base * 1.45, now + 0.038);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
      return;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (this.profile === 'thock') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime((isSpace ? 320 : 490) * jitter, now);
      filter.Q.setValueAtTime(1.8, now);
      gain.gain.setValueAtTime(0.17, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.036);
    } else if (this.profile === 'tactile') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime((isSpace ? 920 : 1420) * jitter, now);
      filter.Q.setValueAtTime(2.3, now);
      gain.gain.setValueAtTime(0.13, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
    } else {
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1750 * jitter, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);

    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'triangle';
    const baseFreq = this.profile === 'thock' ? (isSpace ? 115 : 150) : isSpace ? 145 : 210;
    bodyOsc.frequency.setValueAtTime(baseFreq * jitter, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(55, now + 0.032);
    bodyGain.gain.setValueAtTime(this.profile === 'thock' ? 0.1 : 0.055, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.034);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.ctx.destination);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.036);
  }

  playError() {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(175, now);
    osc.frequency.exponentialRampToValueAtTime(112, now + 0.09);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playDiscoveryHit() {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.055;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.17);
    });
  }

  playCombo(tier = 1) {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const scale = [523.25, 587.33, 659.25, 783.99, 1046.5];
    const freq = scale[Math.min(scale.length - 1, tier - 1)];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playStar(starIndex = 0) {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const notes = [440, 493.88, 554.37, 659.25, 880];
    const freq = notes[Math.min(4, starIndex)];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playFanfare() {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.075;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.09, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.34);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  }

  playLaser() {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(760, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.08);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }
}

export const soundEngine = new SoundEngine();
