/**
 * Synthesized Mechanical Keyboard Acoustics (Web Audio API — Zero External Assets)
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.noiseBuffer = null;
    this.profile = 'thock'; // 'thock' | 'tactile' | 'typewriter' | 'off'
  }

  setProfile(profile) {
    this.profile = profile;
  }

  ensureContext() {
    if (this.profile === 'off') return false;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.noiseBuffer = this.createNoiseBuffer();
    }
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

    // 1. Filtered transient click burst
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (this.profile === 'thock') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime((isSpace ? 320 : 480) * jitter, now);
      filter.Q.setValueAtTime(1.8, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.036);
    } else if (this.profile === 'tactile') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime((isSpace ? 950 : 1450) * jitter, now);
      filter.Q.setValueAtTime(2.4, now);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
    } else {
      // typewriter
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1750 * jitter, now);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.032);
    }

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);

    // 2. Low housing resonance ("bottom-out body")
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'triangle';
    const baseFreq = this.profile === 'thock' ? (isSpace ? 115 : 150) : isSpace ? 145 : 210;
    bodyOsc.frequency.setValueAtTime(baseFreq * jitter, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(55, now + 0.032);

    bodyGain.gain.setValueAtTime(this.profile === 'thock' ? 0.11 : 0.06, now);
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
    osc.type = 'sine';
    osc.frequency.setValueAtTime(175, now);
    osc.frequency.exponentialRampToValueAtTime(118, now + 0.085);

    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  playComplete() {
    if (!this.ensureContext()) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25]; // Warm A major triad
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.065;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.075, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }
}

export const soundEngine = new SoundEngine();
