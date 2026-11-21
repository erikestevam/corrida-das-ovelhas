import * as Tone from 'tone';
import { Howl } from 'howler';
import { GAME_CONFIG } from '../config';

class AudioManager {
  private isUnlocked: boolean = false;
  private isMuted: boolean = false;

  // Tone.js synths
  private beepSynth: Tone.Synth | null = null;
  private jumpSynth: Tone.MonoSynth | null = null;
  private chimeSynth: Tone.PolySynth | null = null;
  private turboSynth: Tone.Synth | null = null;
  private bumpSynth: Tone.MembraneSynth | null = null;
  private musicLoop: Tone.Loop | null = null;

  // Howler cache for custom recorded files
  private howlerCache: Map<string, Howl> = new Map();
  private currentVoiceSound: Howl | null = null;

  // Voice synthesis fallback
  private speechVoice: SpeechSynthesisVoice | null = null;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;

  constructor() {
    this.setupSpeechVoices();
    this.preloadAudioFiles();
  }

  /**
   * Unlock audio context on user gesture (e.g. Play button click)
   */
  public async unlock(): Promise<void> {
    if (this.isUnlocked) return;

    try {
      await Tone.start();
      this.initSynths();
      this.isUnlocked = true;
      console.log('🎵 Áudio inicializado com sucesso (Tone.js + Web Speech API)');
    } catch (e) {
      console.warn('Erro ao inicializar Tone.js:', e);
    }
  }

  private initSynths(): void {
    Tone.Destination.volume.value = -4;

    // Countdown and UI Beeps
    this.beepSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.1 }
    }).toDestination();

    // Jump "Boing" Synth
    this.jumpSynth = new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.22, sustain: 0.05, release: 0.15 },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.1,
        release: 0.2,
        baseFrequency: 240,
        octaves: 2.8
      }
    }).toDestination();
    this.jumpSynth.volume.value = -2;

    // Chime synth for sheep and stars
    this.chimeSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle8' },
      envelope: { attack: 0.01, decay: 0.35, sustain: 0.1, release: 0.3 }
    }).toDestination();
    this.chimeSynth.volume.value = -3;

    // Turbo boost synth
    this.turboSynth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.08, decay: 0.4, sustain: 0.3, release: 0.5 }
    }).toDestination();
    this.turboSynth.volume.value = -6;

    // Obstacle soft bump / boing
    this.bumpSynth = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0.01, release: 0.3 }
    }).toDestination();
    this.bumpSynth.volume.value = 0;

    this.setupBgmMelody();
  }

  /**
   * Gentle, cheerful procedural BGM in C Major Pentatonic using Tone.js
   */
  private setupBgmMelody(): void {
    const bgmSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.1, release: 0.2 }
    }).toDestination();
    bgmSynth.volume.value = -18; // Soft background level

    const notes = [
      ['C4', 'E4'], ['G4'], ['A4'], ['G4'],
      ['E4'], ['D4'], ['C4'], ['E4'],
      ['F4'], ['A4'], ['G4'], ['E4'],
      ['D4'], ['G4'], ['C5'], ['C4']
    ];
    let step = 0;

    this.musicLoop = new Tone.Loop((time) => {
      const chord = notes[step % notes.length];
      bgmSynth.triggerAttackRelease(chord, '8n', time);
      step++;
    }, '4n');

    Tone.Transport.bpm.value = 124;
  }

  public startMusic(): void {
    if (!this.isUnlocked || this.isMuted) return;
    try {
      Tone.Transport.start();
      this.musicLoop?.start(0);
    } catch (e) {
      console.warn('Erro ao tocar música de fundo:', e);
    }
  }

  public stopMusic(): void {
    try {
      this.musicLoop?.stop();
      Tone.Transport.stop();
    } catch (e) {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    Tone.Destination.mute = this.isMuted;
    Howler.mute(this.isMuted);
    if (this.isMuted) {
      window.speechSynthesis?.cancel();
      this.currentVoiceSound?.stop();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // =========================================================================
  // SOUND EFFECTS (Tone.js)
  // =========================================================================

  public playCountdownBeep(isGo: boolean = false): void {
    if (!this.isUnlocked || this.isMuted || !this.beepSynth) return;
    const now = Tone.now();
    if (isGo) {
      this.beepSynth.triggerAttackRelease('C6', '0.35s', now);
      this.chimeSynth?.triggerAttackRelease(['C5', 'E5', 'G5', 'C6'], '0.4s', now);
    } else {
      this.beepSynth.triggerAttackRelease('G5', '0.12s', now);
    }
  }

  public playJump(): void {
    if (!this.isUnlocked || this.isMuted || !this.jumpSynth) return;
    const now = Tone.now();
    this.jumpSynth.triggerAttackRelease('C4', '0.18s', now);
    // Pitch envelope ramp up for cartoon boing
    this.jumpSynth.frequency.setValueAtTime('C4', now);
    this.jumpSynth.frequency.exponentialRampTo('G5', 0.18, now);
  }

  public playDoubleJump(): void {
    if (!this.isUnlocked || this.isMuted || !this.chimeSynth) return;
    const now = Tone.now();
    this.chimeSynth.triggerAttackRelease(['G5', 'E6'], '0.15s', now);
  }

  /**
   * Rescued sheep chime with ascending scale notes (Mario-style progression)
   */
  public playSheepCollect(index: number): void {
    if (!this.isUnlocked || this.isMuted || !this.chimeSynth) return;
    const scale = ['C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'C7'];
    const note = scale[Math.min(index, scale.length - 1)];
    const now = Tone.now();
    this.chimeSynth.triggerAttackRelease([note, 'E6'], '0.3s', now);
  }

  public playStarCollect(): void {
    if (!this.isUnlocked || this.isMuted || !this.chimeSynth) return;
    const now = Tone.now();
    this.chimeSynth.triggerAttackRelease(['E6', 'B6'], '0.15s', now);
  }

  public playSurpriseBox(): void {
    if (!this.isUnlocked || this.isMuted || !this.chimeSynth) return;
    const now = Tone.now();
    this.chimeSynth.triggerAttackRelease(['C5', 'G5', 'C6', 'E6'], '0.4s', now);
  }

  public playTurbo(): void {
    if (!this.isUnlocked || this.isMuted || !this.turboSynth) return;
    const now = Tone.now();
    this.turboSynth.triggerAttackRelease('A4', '0.4s', now);
    this.turboSynth.frequency.setValueAtTime('A4', now);
    this.turboSynth.frequency.exponentialRampTo('E6', 0.4, now);
  }

  public playObstacleBump(): void {
    if (!this.isUnlocked || this.isMuted || !this.bumpSynth) return;
    const now = Tone.now();
    this.bumpSynth.triggerAttackRelease('G2', '0.25s', now);
    // Add cute wobble
    this.jumpSynth?.triggerAttackRelease('G3', '0.12s', now);
  }

  public playVictory(): void {
    if (!this.isUnlocked || this.isMuted || !this.chimeSynth) return;
    const now = Tone.now();
    const chords = [
      { notes: ['C5', 'E5', 'G5'], time: 0 },
      { notes: ['E5', 'G5', 'C6'], time: 0.2 },
      { notes: ['F5', 'A5', 'C6'], time: 0.4 },
      { notes: ['G5', 'B5', 'D6'], time: 0.65 },
      { notes: ['C5', 'G5', 'C6', 'E6'], time: 0.95 }
    ];

    chords.forEach(c => {
      this.chimeSynth?.triggerAttackRelease(c.notes, '0.35s', now + c.time);
    });
  }

  // =========================================================================
  // NARRATION & VOICE (Web Speech API + Howler.js Fallback)
  // =========================================================================

  private setupSpeechVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Look for Brazilian Portuguese voice
      const ptVoice = voices.find(v => v.lang === 'pt-BR') ||
                      voices.find(v => v.lang.startsWith('pt'));
      if (ptVoice) {
        this.speechVoice = ptVoice;
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  /**
   * Preload high-quality natural voice audio files from /public/audio/
   */
  private preloadAudioFiles(): void {
    const keys = [
      'vamos-correr', 'largada-3', 'largada-2', 'largada-1', 'largada-ja',
      'pula', 'turbo', 'surpresa', 'ops', 'toca', 'parabens',
      ...Array.from({ length: 40 }, (_, i) => `num-${i + 1}`)
    ];

    keys.forEach(key => {
      const sound = new Howl({
        src: [`/audio/${key}.mp3`],
        preload: true,
        html5: false, // Web Audio API for fast zero-latency triggering
        volume: 1.0
      });
      this.howlerCache.set(key, sound);
    });
  }

  /**
   * Speak text with enthusiastic child-friendly voice (Howler MP3 first, Web Speech API fallback)
   */
  public speak(key: string, text: string, immediate: boolean = true): void {
    if (this.isMuted) return;

    // Prevent duplicate speech triggers within 800ms
    const now = Date.now();
    if (this.lastSpokenText === text && now - this.lastSpokenTime < 800) {
      return;
    }
    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    // Cancel any synthetic browser voice
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // 1. Play high-quality neural voice MP3 via Howler
    let sound = this.howlerCache.get(key);
    if (!sound) {
      try {
        sound = new Howl({
          src: [`/audio/${key}.mp3`],
          preload: true,
          html5: false,
          volume: 1.0
        });
        this.howlerCache.set(key, sound);
      } catch (e) {
        // Fallback
      }
    }

    if (sound) {
      if (immediate && this.currentVoiceSound && this.currentVoiceSound.playing()) {
        this.currentVoiceSound.stop();
      }
      this.currentVoiceSound = sound;
      sound.play();
      return;
    }

    // 2. Fallback to Web Speech API in pt-BR if MP3 is unavailable
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.05; // Lively pace
      utterance.pitch = 1.35; // Cheerful, friendly pitch
      utterance.volume = 1.0;

      if (this.speechVoice) {
        utterance.voice = this.speechVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  }
}

export const audioManager = new AudioManager();
