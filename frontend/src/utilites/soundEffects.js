// Web Audio API based sound generator for zero-latency, zero-asset chess sound effects
class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, gainValue = 0.1) {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  playMove() {
    this.playTone(440, 'sine', 0.1, 0.15); // pleasant tap
  }

  playCapture() {
    this.playTone(320, 'triangle', 0.15, 0.25);
    setTimeout(() => this.playTone(480, 'sine', 0.1, 0.2), 50);
  }

  playCheck() {
    this.playTone(600, 'sawtooth', 0.2, 0.2);
    setTimeout(() => this.playTone(750, 'sawtooth', 0.25, 0.2), 100);
  }

  playIllegalMove() {
    this.playTone(200, 'square', 0.15, 0.1);
    setTimeout(() => this.playTone(160, 'square', 0.2, 0.1), 100);
  }

  playGameOver() {
    this.playTone(523.25, 'sine', 0.2, 0.2); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.2), 150); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.4, 0.25), 300); // G5
  }
}

export const sounds = new SoundEffects();
export default sounds;
