import Phaser from 'phaser';
import { AssetGenerator } from '../graphics/AssetGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public create(): void {
    // Generate all vector cartoon graphics procedurally
    AssetGenerator.generateAll(this);

    // Launch the main gameplay scene
    this.scene.start('GameScene');
  }
}
