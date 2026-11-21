import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { overlayUI } from './ui/OverlayUI';
import { GAME_CONFIG } from './config';
import './style.css';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#87ceeb',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.BASE_WIDTH,
    height: GAME_CONFIG.BASE_HEIGHT
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
