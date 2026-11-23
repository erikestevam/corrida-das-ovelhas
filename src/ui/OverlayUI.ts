import { animate } from 'motion';
import confetti from 'canvas-confetti';
import { audioManager } from '../audio/AudioManager';
import { GAME_CONFIG } from '../config';

export class OverlayUI {
  private startScreen = document.getElementById('start-screen') as HTMLElement;
  private topHud = document.getElementById('top-hud') as HTMLElement;
  private touchControls = document.getElementById('touch-controls') as HTMLElement;
  private btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
  private btnRestart = document.getElementById('btn-restart') as HTMLButtonElement;
  private btnAudioToggle = document.getElementById('btn-audio-toggle') as HTMLButtonElement;
  private audioIcon = document.getElementById('audio-icon') as HTMLElement;

  private hudSheepCount = document.getElementById('hud-sheep-count') as HTMLElement;
  private hudStarCount = document.getElementById('hud-star-count') as HTMLElement;

  private hudGuidePill = document.getElementById('hud-guide-pill') as HTMLElement;
  private hudGuideIcon = document.getElementById('hud-guide-icon') as HTMLElement;
  private hudGuideText = document.getElementById('hud-guide-text') as HTMLElement;

  private toastNotification = document.getElementById('toast-notification') as HTMLElement;
  private toastText = document.getElementById('toast-text') as HTMLElement;
  private toastTimeout: number | null = null;

  private numberPopupContainer = document.getElementById('number-popup-container') as HTMLElement;
  private numberPopupDigit = document.getElementById('number-popup-digit') as HTMLElement;
  private numberPopupLabel = document.getElementById('number-popup-label') as HTMLElement;
  private numberPopupTimeout: number | null = null;

  private victoryScreen = document.getElementById('victory-screen') as HTMLElement;
  private victorySheepCount = document.getElementById('victory-sheep-count') as HTMLElement;
  private victoryStarCount = document.getElementById('victory-star-count') as HTMLElement;

  constructor() {}

  public init(onStartGame: () => void, onRestartGame: () => void): void {
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

    if (this.btnAudioToggle) {
      this.btnAudioToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const muted = audioManager.toggleMute();
        this.updateAudioIcon(muted);
      });
    }
  }

  public showStartScreen(): void {
    this.startScreen?.classList.remove('hidden');
    this.topHud?.classList.add('hidden');
    this.touchControls?.classList.add('hidden');
    this.victoryScreen?.classList.add('hidden');
  }

  public hideStartScreen(): void {
    animate(
      this.startScreen,
      { opacity: [1, 0], scale: [1, 0.95] },
      { duration: 0.3 }
    ).then(() => {
      this.startScreen?.classList.add('hidden');
      this.showHud();
      this.showTouchControls();
    });
  }

  public showHud(): void {
    this.topHud?.classList.remove('hidden');
    animate(
      this.topHud,
      { y: [-20, 0], opacity: [0, 1] },
      { duration: 0.4, type: 'spring', bounce: 0.4 }
    );
  }

  public hideHud(): void {
    this.topHud?.classList.add('hidden');
  }

  public showTouchControls(): void {
    this.touchControls?.classList.remove('hidden');
    animate(
      this.touchControls,
      { opacity: [0, 1] },
      { duration: 0.3 }
    );
  }

  public hideTouchControls(): void {
    this.touchControls?.classList.add('hidden');
  }

  public updateSheepCount(count: number, total: number = 10): void {
    if (this.hudSheepCount) {
      this.hudSheepCount.textContent = `${count} / ${total}`;
      animate(
        this.hudSheepCount,
        { scale: [1, 1.35, 1] },
        { duration: 0.35, type: 'spring', bounce: 0.5 }
      );
    }
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
    if (this.hudSheepCount) this.hudSheepCount.textContent = '0 / 10';
    if (this.hudStarCount) this.hudStarCount.textContent = '0';
  }

  public updateAudioIcon(muted: boolean): void {
    if (this.audioIcon) {
      this.audioIcon.textContent = muted ? '🔇' : '🔊';
    }
  }

  // =========================================================================
  // BÚSSOLA E GUIA DIRECIONAL
  // =========================================================================
  public updateGuidePill(text: string, type: 'farm' | 'sheep' | 'done'): void {
    if (!this.hudGuideText || !this.hudGuidePill) return;

    this.hudGuideText.textContent = text;
    if (this.hudGuideIcon) {
      this.hudGuideIcon.textContent = type === 'farm' ? '🏡' : type === 'sheep' ? '🐑' : '🎉';
    }

    if (type === 'farm') {
      this.hudGuidePill.className = 'guide-pill to-farm';
    } else if (type === 'sheep') {
      this.hudGuidePill.className = 'guide-pill to-sheep';
    } else {
      this.hudGuidePill.className = 'guide-pill is-done';
    }
  }

  // =========================================================================
  // TOAST QUANDO ACHA UMA OVELHINHA
  // =========================================================================
  public showSheepFoundToast(sheepName: string): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }

    if (this.toastText) {
      this.toastText.textContent = `Você achou a ovelhinha ${sheepName}! Leve-a para a fazenda! 🏡`;
    }

    this.toastNotification?.classList.remove('hidden');
    animate(
      this.toastNotification,
      { y: [-30, 0], opacity: [0, 1], scale: [0.8, 1] },
      { duration: 0.4, type: 'spring', bounce: 0.5 }
    );

    this.toastTimeout = window.setTimeout(() => {
      animate(
        this.toastNotification,
        { opacity: [1, 0], y: [0, -20] },
        { duration: 0.3 }
      ).then(() => {
        this.toastNotification?.classList.add('hidden');
      });
    }, 2800);
  }

  // =========================================================================
  // GIANT SHEEP NUMBER POP-UP AO ENTREGAR NA FAZENDA
  // =========================================================================
  public showNumberPopup(count: number): void {
    if (this.numberPopupTimeout) {
      clearTimeout(this.numberPopupTimeout);
      this.numberPopupTimeout = null;
    }

    if (this.numberPopupDigit) this.numberPopupDigit.textContent = count.toString();
    if (this.numberPopupLabel) {
      this.numberPopupLabel.textContent = count === 1 ? '1ª Ovelhinha Salva! 🐑' : `${count}ª Ovelhinha Salva! 🐑`;
    }

    const colors = GAME_CONFIG.COLORS.RAINBOW;
    const color = colors[(count - 1) % colors.length];
    if (this.numberPopupDigit) this.numberPopupDigit.style.color = color;

    this.numberPopupContainer?.classList.remove('hidden');

    animate(
      this.numberPopupContainer,
      { scale: [0.2, 1.25, 1], y: [-30, 0], opacity: [0, 1] },
      { duration: 0.5, type: 'spring', bounce: 0.6 }
    );

    // Fala neural carinhosa com o número
    const voiceText = count === 1 ? 'Uma ovelhinha!' : `${count} ovelhinhas!`;
    audioManager.speak(`num-${count}`, voiceText, true);

    this.numberPopupTimeout = window.setTimeout(() => {
      animate(
        this.numberPopupContainer,
        { scale: [1, 0.8], opacity: [1, 0] },
        { duration: 0.3 }
      ).then(() => {
        this.numberPopupContainer?.classList.add('hidden');
      });
    }, 1400);
  }

  // =========================================================================
  // TELA DE VITÓRIA (TODAS AS 10 OVELHAS SALVAS NO APRISCO)
  // =========================================================================
  public showVictoryScreen(totalSheep: number = 10, totalStars: number = 0): void {
    if (this.victorySheepCount) this.victorySheepCount.textContent = totalSheep.toString();
    if (this.victoryStarCount) this.victoryStarCount.textContent = totalStars.toString();

    this.touchControls?.classList.add('hidden');
    this.victoryScreen?.classList.remove('hidden');

    const card = this.victoryScreen?.querySelector('.victory-card') as HTMLElement;
    if (card) {
      animate(
        card,
        { scale: [0.3, 1.12, 1], opacity: [0, 1] },
        { duration: 0.6, type: 'spring', bounce: 0.55 }
      );
    }

    this.triggerVictoryFireworks();
  }

  public hideVictoryScreen(): void {
    this.victoryScreen?.classList.add('hidden');
  }

  public triggerVictoryFireworks(): void {
    const end = Date.now() + 3500;
    const colors = ['#f43f5e', '#fbbf24', '#4ade80', '#38bdf8', '#c084fc'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 5,
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
      particleCount: 30,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#facc15', '#fbbf24', '#f59e0b', '#38bdf8', '#4ade80']
    });
  }
}

export const overlayUI = new OverlayUI();
