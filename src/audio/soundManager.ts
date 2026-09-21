// Procedural Web Audio API Sound Synthesizer & Relaxing Ambient Lounge Engine
export class SoundManager {
  private static instance: SoundManager | null = null;
  private ctx: AudioContext | null = null;
  private volume: number = 0.6;
  private muted: boolean = false;

  // Background Music Engine
  private musicVolume: number = 0.35;
  private musicMuted: boolean = false;
  private musicGainNode: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private chordIndex: number = 0;

  private constructor() {
    const savedMuted = localStorage.getItem('ssp_sound_muted');
    const savedVol = localStorage.getItem('ssp_sound_volume');
    const savedMusicMuted = localStorage.getItem('ssp_music_muted');
    const savedMusicVol = localStorage.getItem('ssp_music_volume');

    if (savedMuted !== null) this.muted = savedMuted === 'true';
    if (savedVol !== null) this.volume = parseFloat(savedVol);
    if (savedMusicMuted !== null) this.musicMuted = savedMusicMuted === 'true';
    if (savedMusicVol !== null) this.musicVolume = parseFloat(savedMusicVol);
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initContext(): void {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound FX Controls ---
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

  // --- Background Music Controls ---
  public setMusicMuted(muted: boolean): void {
    this.musicMuted = muted;
    localStorage.setItem('ssp_music_muted', String(muted));
    if (this.musicGainNode && this.ctx) {
      const targetGain = muted ? 0.0001 : this.musicVolume;
      this.musicGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
  }

  public isMusicMuted(): boolean {
    return this.musicMuted;
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('ssp_music_volume', String(this.musicVolume));
    if (this.musicGainNode && this.ctx && !this.musicMuted) {
      this.musicGainNode.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.1);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public startMusic(): void {
    if (this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    if (!this.musicGainNode) {
      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.connect(this.ctx.destination);
    }

    const currentGain = this.musicMuted ? 0.0001 : this.musicVolume;
    this.musicGainNode.gain.setValueAtTime(currentGain, this.ctx.currentTime);

    this.chordIndex = 0;
    this.playNextMusicBar();
  }

  public stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
    }
  }

  // Procedural relaxing jazz / lofi chords: Dm9 -> G13 -> Cmaj9 -> Am9
  private playNextMusicBar(): void {
    if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode) return;

    const chords = [
      // Dm9
      { root: 146.83, notes: [146.83, 174.61, 220.0, 261.63, 329.63], mel: [329.63, 261.63, 220.0, 174.61] },
      // G13
      { root: 98.0, notes: [98.0, 174.61, 246.94, 329.63, 440.0], mel: [440.0, 329.63, 293.66, 246.94] },
      // Cmaj9
      { root: 130.81, notes: [130.81, 164.81, 196.0, 246.94, 293.66], mel: [293.66, 246.94, 196.0, 164.81] },
      // Am9
      { root: 110.0, notes: [110.0, 130.81, 164.81, 196.0, 246.94], mel: [246.94, 196.0, 220.0, 261.63] },
    ];

    const currentChord = chords[this.chordIndex % chords.length];
    const barDuration = 4.2; // ~60 bpm relaxed timing
    const t = this.ctx.currentTime;

    // Filter node for warm, rounded electric piano / velvet pad timbre
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, t);
    filter.Q.setValueAtTime(1.2, t);
    filter.connect(this.musicGainNode);

    // Warm Chord Pad (Soft swelling sine/triangle waves)
    currentChord.notes.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const noteGain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Gentle attack and slow release
      noteGain.gain.setValueAtTime(0.0001, t);
      noteGain.gain.linearRampToValueAtTime(0.038, t + 1.2);
      noteGain.gain.setValueAtTime(0.038, t + barDuration - 0.8);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + barDuration);

      osc.connect(noteGain);
      noteGain.connect(filter);

      osc.start(t);
      osc.stop(t + barDuration + 0.1);
    });

    // Gentle arpeggio plucks over the bar
    currentChord.mel.forEach((freq, idx) => {
      const noteTime = t + 0.8 + idx * 0.75;
      const melOsc = this.ctx!.createOscillator();
      const melGain = this.ctx!.createGain();

      melOsc.type = 'triangle';
      melOsc.frequency.setValueAtTime(freq, noteTime);

      melGain.gain.setValueAtTime(0.0001, noteTime);
      melGain.gain.linearRampToValueAtTime(0.045, noteTime + 0.05);
      melGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.1);

      melOsc.connect(melGain);
      melGain.connect(filter);

      melOsc.start(noteTime);
      melOsc.stop(noteTime + 1.2);
    });

    this.chordIndex++;
    this.musicTimer = window.setTimeout(() => {
      this.playNextMusicBar();
    }, (barDuration - 0.15) * 1000);
  }

  // --- Sound Effects ---

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

    const chords = [
      { freqs: [261.63, 329.63, 392.0], delay: 0, duration: 0.25 },
      { freqs: [349.23, 440.0, 523.25], delay: 0.25, duration: 0.25 },
      { freqs: [392.0, 493.88, 587.33], delay: 0.5, duration: 0.3 },
      { freqs: [523.25, 659.25, 783.99, 1046.5], delay: 0.8, duration: 0.8 },
    ];

    const t = this.ctx.currentTime;
    chords.forEach((chord) => {
      const startTime = t + chord.delay;
      chord.freqs.forEach((freq) => {
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
