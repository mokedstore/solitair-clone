// Procedural Web Audio API Sound Synthesizer (Zero-asset, zero-latency, high-fidelity)
export class SoundManager {
  private static instance: SoundManager | null = null;
  private ctx: AudioContext | null = null;
  private volume: number = 0.6;
  private muted: boolean = false;

  private constructor() {
    const savedMuted = localStorage.getItem('ssp_sound_muted');
    const savedVol = localStorage.getItem('ssp_sound_volume');
    if (savedMuted !== null) this.muted = savedMuted === 'true';
    if (savedVol !== null) this.volume = parseFloat(savedVol);
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initContext(): void {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    localStorage.setItem('ssp_sound_muted', String(muted));
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('ssp_sound_volume', String(this.volume));
  }

  public getVolume(): number {
    return this.volume;
  }

  // 1. Crisp Card Flip / Snap
  public playCardSnap(): void {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.05);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);

    gain.gain.setValueAtTime(this.volume * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // 2. Soft Card Slide
  public playCardSlide(): void {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.setValueAtTime(2.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.volume * 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  // 3. Stock Deal (10 rapid card deals)
  public playDealStock(): void {
    if (this.muted || this.volume <= 0) return;
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.playCardSlide();
        if (i % 2 === 0) this.playCardSnap();
      }, i * 35);
    }
  }

  // 4. Suit Complete Chime (Pentatonic Arpeggio)
  public playSuitComplete(): void {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 880.0, 1046.5]; // C5, E5, G5, A5, C6
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = t + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  // 5. Grand Win Celebration Fanfare
  public playWinFanfare(): void {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    // Chords progression: C maj -> F maj -> G maj -> C high
    const chords = [
      { freqs: [261.63, 329.63, 392.0], delay: 0, duration: 0.25 },
      { freqs: [349.23, 440.0, 523.25], delay: 0.25, duration: 0.25 },
      { freqs: [392.0, 493.88, 587.33], delay: 0.5, duration: 0.3 },
      { freqs: [523.25, 659.25, 783.99, 1046.5], delay: 0.8, duration: 0.8 },
    ];

    const t = this.ctx.currentTime;
    chords.forEach(chord => {
      const startTime = t + chord.delay;
      chord.freqs.forEach(freq => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.2, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + chord.duration);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + chord.duration + 0.05);
      });
    });
  }

  // 6. UI Button Click
  public playClick(): void {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.03);

    gain.gain.setValueAtTime(this.volume * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // 7. Invalid Move / Buzz
  public playError(): void {
    if (this.muted || this.volume <= 0) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.setValueAtTime(120, t + 0.07);

    gain.gain.setValueAtTime(this.volume * 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }
}

export const sound = SoundManager.getInstance();
