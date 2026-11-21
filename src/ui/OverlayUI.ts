import { animate } from 'motion';
import confetti from 'canvas-confetti';
import { audioManager } from '../audio/AudioManager';
import { GAME_CONFIG } from '../config';

export class OverlayUI {
  private startScreen = document.getElementById('start-screen') as HTMLElement;
  private topHud = document.getElementById('top-hud') as HTMLElement;
  private btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
  private btnRestart = document.getElementById('btn-restart') as HTMLButtonElement;
  private btnAudioToggle = document.getElementById('btn-audio-toggle') as HTMLButtonElement;
  private btnCameraToggle = document.getElementById('btn-camera-toggle') as HTMLButtonElement;
  private audioIcon = document.getElementById('audio-icon') as HTMLElement;

  private hudSheepCount = document.getElementById('hud-sheep-count') as HTMLElement;
  private hudStarCount = document.getElementById('hud-star-count') as HTMLElement;
  private progressTrack = document.getElementById('sheep-progress-track') as HTMLElement;

  private countdownOverlay = document.getElementById('countdown-overlay') as HTMLElement;
  private countdownText = document.getElementById('countdown-text') as HTMLElement;

  private numberPopupContainer = document.getElementById('number-popup-container') as HTMLElement;
  private numberPopupDigit = document.getElementById('number-popup-digit') as HTMLElement;
  private numberPopupLabel = document.getElementById('number-popup-label') as HTMLElement;

  private inactivityGuide = document.getElementById('inactivity-guide') as HTMLElement;
  private victoryScreen = document.getElementById('victory-screen') as HTMLElement;

  private sheepSlots: HTMLElement[] = [];
  private numberPopupTimeout: number | null = null;
  private isFingerGuideVisible: boolean = false;

  constructor() {
    this.createSheepSlots();
  }

  public init(onStartGame: () => void, onRestartGame: () => void, onToggleCamera?: () => void): void {
    // Animate Giant Play button breathing pulse with Motion
    if (this.btnPlay) {
      animate(
        this.btnPlay,
        { scale: [1, 1.06, 1] },
        { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
      );

      this.btnPlay.addEventListener('click', async (e) => {
        e.stopPropagation();
        await audioManager.unlock();
        audioManager.speak('vamos-correr', GAME_CONFIG.VOICE_LINES.START);
        this.hideStartScreen();
        onStartGame();
      });
    }

    if (this.btnRestart) {
      this.btnRestart.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideVictoryScreen();
        onRestartGame();
      });
    }

    if (this.btnCameraToggle && onToggleCamera) {
      this.btnCameraToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        onToggleCamera();
      });
    }

    if (this.btnAudioToggle) {
      this.btnAudioToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const muted = audioManager.toggleMute();
        this.updateAudioIcon(muted);
      });
    }
  }

  public updateCameraIcon(mode: 'chase' | 'isometric'): void {
    const icon = document.getElementById('camera-icon');
    if (icon) {
      icon.textContent = mode === 'chase' ? '🏎️' : '📐';
    }
  }

  private createSheepSlots(): void {
    if (!this.progressTrack) return;
    this.progressTrack.innerHTML = '';
    this.sheepSlots = [];

    for (let i = 0; i < GAME_CONFIG.TOTAL_SHEEP_GOAL; i++) {
      const slot = document.createElement('div');
      slot.className = 'sheep-slot';
      slot.textContent = '🐑';
      this.progressTrack.appendChild(slot);
      this.sheepSlots.push(slot);
    }
  }

  public showStartScreen(): void {
    this.startScreen.classList.remove('hidden');
    this.topHud.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.inactivityGuide.classList.add('hidden');
  }

  public hideStartScreen(): void {
    animate(
      this.startScreen,
      { opacity: [1, 0], scale: [1, 0.95] },
      { duration: 0.3 }
    ).then(() => {
      this.startScreen.classList.add('hidden');
      this.showHud();
    });
  }

  public showHud(): void {
    this.topHud.classList.remove('hidden');
    animate(
      this.topHud,
      { y: [-20, 0], opacity: [0, 1] },
      { duration: 0.4, type: 'spring', bounce: 0.4 }
    );
  }

  public hideHud(): void {
    this.topHud.classList.add('hidden');
  }

  public updateSheepCount(count: number): void {
    if (this.hudSheepCount) {
      this.hudSheepCount.textContent = count.toString();
      animate(
        this.hudSheepCount,
        { scale: [1, 1.4, 1] },
        { duration: 0.35, type: 'spring', bounce: 0.5 }
      );
    }

    this.sheepSlots.forEach((slot, idx) => {
      if (idx < count) {
        if (!slot.classList.contains('filled')) {
          slot.classList.add('filled');
          animate(
            slot,
            { scale: [0.6, 1.4, 1.15] },
            { duration: 0.45, type: 'spring', bounce: 0.6 }
          );
        }
      } else {
        slot.classList.remove('filled');
      }
    });
  }

  public updateStarCount(count: number): void {
    if (this.hudStarCount) {
      this.hudStarCount.textContent = count.toString();
      animate(
        this.hudStarCount,
        { scale: [1, 1.3, 1] },
        { duration: 0.3, type: 'spring', bounce: 0.4 }
      );
    }
  }

  public resetHud(): void {
    if (this.hudSheepCount) this.hudSheepCount.textContent = '0';
    if (this.hudStarCount) this.hudStarCount.textContent = '0';
    this.sheepSlots.forEach(slot => slot.classList.remove('filled'));
  }

  public updateAudioIcon(muted: boolean): void {
    if (this.audioIcon) {
      this.audioIcon.textContent = muted ? '🔇' : '🔊';
    }
  }

  // =========================================================================
  // 3... 2... 1... JÁ! COUNTDOWN WITH MOTION & AUDIO
  // =========================================================================
  public async playCountdown(onComplete: () => void): Promise<void> {
    this.countdownOverlay.classList.remove('hidden');

    const steps = [
      { text: '3', color: '#fbbf24', voiceKey: 'largada-3', voiceText: GAME_CONFIG.VOICE_LINES.COUNTDOWN_3, isGo: false },
      { text: '2', color: '#f59e0b', voiceKey: 'largada-2', voiceText: GAME_CONFIG.VOICE_LINES.COUNTDOWN_2, isGo: false },
      { text: '1', color: '#ef4444', voiceKey: 'largada-1', voiceText: GAME_CONFIG.VOICE_LINES.COUNTDOWN_1, isGo: false },
      { text: 'JÁ! 🚀', color: '#22c55e', voiceKey: 'largada-ja', voiceText: GAME_CONFIG.VOICE_LINES.COUNTDOWN_GO, isGo: true }
    ];

    for (const step of steps) {
      this.countdownText.textContent = step.text;
      this.countdownText.style.color = step.color;

      audioManager.playCountdownBeep(step.isGo);
      audioManager.speak(step.voiceKey, step.voiceText, true);

      // Spring pop animation with Motion
      await animate(
        this.countdownText,
        { scale: [0.2, 1.35, 1], opacity: [0, 1] },
        { duration: 0.45, type: 'spring', bounce: 0.6 }
      );

      // Small pause before next count
      await new Promise(r => setTimeout(r, step.isGo ? 550 : 380));
    }

    animate(
      this.countdownOverlay,
      { opacity: [1, 0] },
      { duration: 0.25 }
    ).then(() => {
      this.countdownOverlay.classList.add('hidden');
      this.countdownOverlay.style.opacity = '1';
      onComplete();
    });
  }

  // =========================================================================
  // GIANT SHEEP NUMBER POP-UP (1 to 10)
  // =========================================================================
  public showNumberPopup(count: number): void {
    if (this.numberPopupTimeout) {
      clearTimeout(this.numberPopupTimeout);
      this.numberPopupTimeout = null;
    }

    this.numberPopupDigit.textContent = count.toString();
    this.numberPopupLabel.textContent = count === 1 ? '1ª Ovelhinha! 🐑' : `${count}ª Ovelhinha! 🐑`;

    // Dynamic rainbow color per number
    const colors = GAME_CONFIG.COLORS.RAINBOW;
    const color = colors[(count - 1) % colors.length];
    this.numberPopupDigit.style.color = color;

    this.numberPopupContainer.classList.remove('hidden');

    animate(
      this.numberPopupContainer,
      { scale: [0.2, 1.28, 1], y: [-30, 0], opacity: [0, 1] },
      { duration: 0.5, type: 'spring', bounce: 0.6 }
    );

    // Speak enthusiastic number
    const voiceText = GAME_CONFIG.VOICE_LINES.NUMBERS[count - 1] || `${count}!`;
    audioManager.speak(`num-${count}`, voiceText, true);

    // Auto dismiss after 1.3s
    this.numberPopupTimeout = window.setTimeout(() => {
      animate(
        this.numberPopupContainer,
        { scale: [1, 0.8], opacity: [1, 0] },
        { duration: 0.3 }
      ).then(() => {
        this.numberPopupContainer.classList.add('hidden');
      });
    }, 1300);
  }

  // =========================================================================
  // INACTIVITY FINGER ASSISTANCE
  // =========================================================================
  public showInactivityGuide(): void {
    if (this.isFingerGuideVisible) return;
    this.isFingerGuideVisible = true;
    this.inactivityGuide.classList.remove('hidden');

    animate(
      this.inactivityGuide,
      { scale: [0.4, 1.15, 1], opacity: [0, 1] },
      { duration: 0.4, type: 'spring', bounce: 0.5 }
    );

    audioManager.speak('toca', GAME_CONFIG.VOICE_LINES.INACTIVITY_HINT);
  }

  public hideInactivityGuide(): void {
    if (!this.isFingerGuideVisible) return;
    this.isFingerGuideVisible = false;

    animate(
      this.inactivityGuide,
      { opacity: [1, 0], scale: [1, 0.6] },
      { duration: 0.2 }
    ).then(() => {
      this.inactivityGuide.classList.add('hidden');
    });
  }

  // =========================================================================
  // VICTORY CELEBRATION (At 10 Sheep)
  // =========================================================================
  public showVictoryScreen(): void {
    this.victoryScreen.classList.remove('hidden');

    const card = this.victoryScreen.querySelector('.victory-card') as HTMLElement;
    if (card) {
      animate(
        card,
        { scale: [0.3, 1.12, 1], opacity: [0, 1] },
        { duration: 0.6, type: 'spring', bounce: 0.55 }
      );
    }

    // Play triumphant audio & voice
    audioManager.playVictory();
    audioManager.speak('parabens', GAME_CONFIG.VOICE_LINES.VICTORY, true);

    // Celebration fireworks & confetti rain!
    this.triggerVictoryFireworks();
  }

  public hideVictoryScreen(): void {
    this.victoryScreen.classList.add('hidden');
  }

  public triggerVictoryFireworks(): void {
    const end = Date.now() + 3000;
    const colors = ['#f43f5e', '#fbbf24', '#4ade80', '#38bdf8', '#c084fc'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  public triggerSurpriseConfetti(): void {
    confetti({
      particleCount: 35,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#facc15', '#fbbf24', '#f59e0b', '#38bdf8', '#4ade80']
    });
  }

  public triggerTurboSparks(): void {
    confetti({
      particleCount: 20,
      spread: 90,
      startVelocity: 25,
      origin: { y: 0.7 },
      colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
    });
  }
}

export const overlayUI = new OverlayUI();

