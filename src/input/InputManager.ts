/**
 * Gerenciador de Controles Unificado (Teclado + Stick Analógico Virtual Mobile)
 * Baseado nas melhores práticas de jogos web mobile-first.
 */

export class InputManager {
  private keyState = new Map<string, boolean>();
  private moveVector = { dx: 0, dz: 0 };
  private jumpRequested = false;

  // Joystick visual elements
  private joystickContainer: HTMLElement | null = null;
  private joystickBase: HTMLElement | null = null;
  private joystickKnob: HTMLElement | null = null;
  private jumpButton: HTMLElement | null = null;

  // Touch tracking
  private activeTouchId: number | null = null;
  private touchOrigin = { x: 0, y: 0 };
  private readonly maxRadius = 45;
  private readonly deadzone = 6;

  constructor() {
    this.setupKeyboard();
    this.setupTouchControls();
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      this.keyState.set(e.code, true);

      // Prevent default scrolling for arrows and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Space') {
        this.jumpRequested = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keyState.set(e.code, false);
    });

    window.addEventListener('blur', () => {
      this.keyState.clear();
      this.moveVector = { dx: 0, dz: 0 };
      this.activeTouchId = null;
    });
  }

  private setupTouchControls(): void {
    // Joystick elements will be bound once DOM is ready or injected
    window.addEventListener('DOMContentLoaded', () => this.bindTouchElements());
    // Also bind immediately if DOM is already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      this.bindTouchElements();
    }
  }

  public bindTouchElements(): void {
    this.joystickContainer = document.getElementById('touch-joystick-zone');
    this.joystickBase = document.getElementById('joystick-base');
    this.joystickKnob = document.getElementById('joystick-knob');
    this.jumpButton = document.getElementById('btn-touch-jump');

    if (!this.joystickContainer || !this.joystickKnob || !this.joystickBase) return;

    // Touch start in joystick zone
    this.joystickContainer.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        if (this.activeTouchId !== null) return;

        const touch = e.changedTouches[0];
        this.activeTouchId = touch.identifier;

        const rect = this.joystickBase!.getBoundingClientRect();
        this.touchOrigin = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };

        this.updateJoystickPosition(touch.clientX, touch.clientY);
      },
      { passive: false }
    );

    // Touch move
    window.addEventListener(
      'touchmove',
      (e) => {
        if (this.activeTouchId === null) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === this.activeTouchId) {
            e.preventDefault();
            this.updateJoystickPosition(touch.clientX, touch.clientY);
            break;
          }
        }
      },
      { passive: false }
    );

    // Touch end / cancel
    const handleTouchEnd = (e: TouchEvent) => {
      if (this.activeTouchId === null) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.activeTouchId) {
          this.activeTouchId = null;
          this.resetJoystick();
          break;
        }
      }
    };

    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    // Jump Button touch
    if (this.jumpButton) {
      this.jumpButton.addEventListener(
        'touchstart',
        (e) => {
          e.preventDefault();
          this.jumpRequested = true;
          this.jumpButton?.classList.add('active');
        },
        { passive: false }
      );

      this.jumpButton.addEventListener('touchend', () => {
        this.jumpButton?.classList.remove('active');
      });
    }
  }

  private updateJoystickPosition(clientX: number, clientY: number): void {
    const rawDx = clientX - this.touchOrigin.x;
    const rawDy = clientY - this.touchOrigin.y;
    const distance = Math.hypot(rawDx, rawDy);

    if (distance < this.deadzone) {
      this.moveVector = { dx: 0, dz: 0 };
      if (this.joystickKnob) {
        this.joystickKnob.style.transform = 'translate(-50%, -50%)';
      }
      return;
    }

    const angle = Math.atan2(rawDy, rawDx);
    const clampedDist = Math.min(distance, this.maxRadius);

    const visualX = Math.cos(angle) * clampedDist;
    const visualY = Math.sin(angle) * clampedDist;

    if (this.joystickKnob) {
      this.joystickKnob.style.transform = `translate(calc(-50% + ${visualX}px), calc(-50% + ${visualY}px))`;
    }

    // Normalizado entre -1 e 1
    const normalizedMag = clampedDist / this.maxRadius;
    this.moveVector = {
      dx: Math.cos(angle) * normalizedMag,
      dz: Math.sin(angle) * normalizedMag // No 3D, Y da tela vira Z do mundo!
    };
  }

  private resetJoystick(): void {
    this.moveVector = { dx: 0, dz: 0 };
    if (this.joystickKnob) {
      this.joystickKnob.style.transform = 'translate(-50%, -50%)';
    }
  }

  /**
   * Retorna o vetor unificado de movimento considerando teclado e touch stick.
   */
  public getMoveVector(): { dx: number; dz: number } {
    let kx = 0;
    let kz = 0;

    // Setas e WASD
    if (this.keyState.get('ArrowLeft') || this.keyState.get('KeyA')) kx -= 1;
    if (this.keyState.get('ArrowRight') || this.keyState.get('KeyD')) kx += 1;
    if (this.keyState.get('ArrowUp') || this.keyState.get('KeyW')) kz -= 1;
    if (this.keyState.get('ArrowDown') || this.keyState.get('KeyS')) kz += 1;

    // Se houver comando de teclado
    if (kx !== 0 || kz !== 0) {
      const len = Math.hypot(kx, kz);
      return { dx: kx / len, dz: kz / len };
    }

    // Caso contrário, usa o stick do celular
    return { ...this.moveVector };
  }

  /**
   * Consome o pulo (retorna true e reseta).
   */
  public consumeJump(): boolean {
    if (this.jumpRequested) {
      this.jumpRequested = false;
      return true;
    }
    return false;
  }
}

export const inputManager = new InputManager();
