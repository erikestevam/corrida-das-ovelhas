import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { overlayUI } from './ui/OverlayUI';
import './style.css';

/**
 * Calculates proportional game dimensions matching the screen orientation
 * to completely eliminate distortion/squashing on mobile devices.
 */
function getResponsiveGameDimensions() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isPortrait = h > w;

  if (isPortrait) {
    // Mobile Portrait: 540 width gives generous forward view and large, cute sprites
    const baseWidth = 540;
    const aspect = Math.max(1.3, Math.min(h / w, 2.2));
    const baseHeight = Math.round(baseWidth * aspect);
    return { width: baseWidth, height: baseHeight };
  } else {
    // Landscape / Desktop: 540 height with proportional width
    const baseHeight = 540;
    const aspect = Math.max(1.4, Math.min(w / h, 2.4));
    const baseWidth = Math.round(baseHeight * aspect);
    return { width: baseWidth, height: baseHeight };
  }
}

const initialDims = getResponsiveGameDimensions();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#87ceeb',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: initialDims.width,
    height: initialDims.height
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [BootScene, GameScene]
};

const game = new Phaser.Game(config);

// Dynamic resize handler for device rotation
window.addEventListener('resize', () => {
  const dims = getResponsiveGameDimensions();
  if (game.scale.width !== dims.width || game.scale.height !== dims.height) {
    game.scale.resize(dims.width, dims.height);
  }
});

// Connect HTML/Motion UI callbacks with Phaser scene
overlayUI.init(
  () => {
    const gameScene = game.scene.getScene('GameScene') as GameScene;
    if (gameScene) {
      gameScene.startGame();
    }
  },
  () => {
    const gameScene = game.scene.getScene('GameScene') as GameScene;
    if (gameScene) {
      gameScene.restartGame();
    }
  }
);
