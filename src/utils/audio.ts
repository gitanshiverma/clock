// Web Audio API Synthesizer for TimeBlocks Alerts
// Guarantees 100% offline, zero-dependency, reliable futuristic cyber sound effects

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.7;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  /**
   * Plays a siren-style audio alert when a scheduled task block reaches its end time.
   * Modulates frequency up and down dynamically with harmonics for a cyber siren alarm.
   */
  public playSirenAlert(durationSeconds: number = 2.4): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Master Gain
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(this.masterVolume * 0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);
      gainNode.connect(ctx.destination);

      // Main Siren Oscillator
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';

      // Pitch sweep LFO effect (Siren cycle ~ 3 sweeps)
      const numSweeps = 3;
      const sweepPeriod = durationSeconds / numSweeps;
      for (let i = 0; i < numSweeps; i++) {
        const t = now + i * sweepPeriod;
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.linearRampToValueAtTime(880, t + sweepPeriod * 0.5);
        osc.frequency.linearRampToValueAtTime(450, t + sweepPeriod);
      }

      // Secondary sub-oscillator for futuristic depth
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      for (let i = 0; i < numSweeps; i++) {
        const t = now + i * sweepPeriod;
        subOsc.frequency.setValueAtTime(225, t);
        subOsc.frequency.linearRampToValueAtTime(440, t + sweepPeriod * 0.5);
        subOsc.frequency.linearRampToValueAtTime(225, t + sweepPeriod);
      }

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gainNode);

      osc.start(now);
      subOsc.start(now);

      osc.stop(now + durationSeconds);
      subOsc.stop(now + durationSeconds);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Plays a pleasant neon chime for task completion / celebrations
   */
  public playChime(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(this.masterVolume * 0.3, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.65);
      });
    } catch (e) {
      console.warn('Chime audio error:', e);
    }
  }

  /**
   * UI Click / Tap feedback sound
   */
  public playClick(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(this.masterVolume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn('Click audio error:', e);
    }
  }
}

export const soundManager = new SoundManager();
