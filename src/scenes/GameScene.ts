import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { audioManager } from '../audio/AudioManager';
import { overlayUI } from '../ui/OverlayUI';

export class GameScene extends Phaser.Scene {
  // UI & Overlay
  private overlayUI = overlayUI;

  // Player & Physics
  private shepherd!: Phaser.Physics.Arcade.Sprite;
  private groundGroup!: Phaser.Physics.Arcade.StaticGroup;
  private obstaclesGroup!: Phaser.Physics.Arcade.Group;
  private sheepGroup!: Phaser.Physics.Arcade.Group;
  private starsGroup!: Phaser.Physics.Arcade.Group;
  private rampsGroup!: Phaser.Physics.Arcade.Group;
  private boxesGroup!: Phaser.Physics.Arcade.Group;

  // Parallax elements
  private sun!: Phaser.GameObjects.Image;
  private clouds: Phaser.GameObjects.Image[] = [];
  private hillBack!: Phaser.GameObjects.TileSprite;
  private hillMid!: Phaser.GameObjects.TileSprite;
  private hillFore!: Phaser.GameObjects.TileSprite;

  // Particle emitters
  private sparkleEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Game state
  private isGameActive: boolean = false;
  private isTurbo: boolean = false;
  private turboTimer: Phaser.Time.TimerEvent | null = null;
  private isInvulnerable: boolean = false;
  private sheepCount: number = 0;
  private starCount: number = 0;

  // Jump assistance mechanics
  private jumpsLeft: number = 2;
  private wasOnGround: boolean = true;
  private lastOnGroundTime: number = 0;
  private lastJumpRequestTime: number = 0;
  private lastInteractionTime: number = 0;

  // Procedural generation
  private nextSpawnX: number = 0;
  private nextEntitySpawnX: number = 650;
  private groundHeight: number = 440;

  constructor() {
    super({ key: 'GameScene' });
  }

  public create(): void {
    const { width, height } = this.scale;

    // Reset state
    this.isGameActive = false;
    this.isTurbo = false;
    this.isInvulnerable = false;
    this.sheepCount = 0;
    this.starCount = 0;
    this.jumpsLeft = 2;
    this.groundHeight = height - 90;
    this.nextEntitySpawnX = 650;
    this.overlayUI?.resetHud();

    // 1. Sky & Parallax Background
    this.createBackground(width, height);

    // 2. Physics Groups
    this.groundGroup = this.physics.add.staticGroup();
    this.obstaclesGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.sheepGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.starsGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.rampsGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.boxesGroup = this.physics.add.group({ allowGravity: false, immovable: true });

    // 3. Create initial ground tiles
    this.createInitialTerrain();

    // 4. Create Shepherd Character
    this.createShepherd();

    // 5. Particle Effects
    this.createParticles();

    // 6. Physics Colliders & Overlaps
    this.setupColliders();

    // 7. Input Handling (1-Touch for mobile & desktop)
    this.setupControls();

    // 8. Camera follow setup
    this.cameras.main.startFollow(this.shepherd, true, 0.1, 0.1, -160, 40);
    this.cameras.main.setBackgroundColor('#87ceeb');
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, height);

    this.lastInteractionTime = this.time.now;
  }

  // =========================================================================
  // ENVIRONMENT & PARALLAX
  // =========================================================================
  private createBackground(width: number, height: number): void {
    // Rainbow Arc in distance
    this.add.image(width * 0.45, height * 0.42, 'rainbow')
      .setScrollFactor(0.04)
      .setScale(1.2);

    // Smiling Sun
    this.sun = this.add.image(width * 0.82, height * 0.22, 'sun')
      .setScrollFactor(0.02)
      .setScale(0.9);

    // Sun gentle bobbing tween
    this.tweens.add({
      targets: this.sun,
      y: this.sun.y - 10,
      angle: 6,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Parallax Hill Layers
    this.hillBack = this.add.tileSprite(0, height - 130, width * 2, 160, 'hill-back')
      .setOrigin(0, 0)
      .setScrollFactor(0.08);

    this.hillMid = this.add.tileSprite(0, height - 120, width * 2, 160, 'hill-mid')
      .setOrigin(0, 0)
      .setScrollFactor(0.22);

    this.hillFore = this.add.tileSprite(0, height - 105, width * 2, 160, 'hill-fore')
      .setOrigin(0, 0)
      .setScrollFactor(0.45);

    // Fluffy Clouds
    for (let i = 0; i < 5; i++) {
      const cloud = this.add.image(
        Phaser.Math.Between(40, width * 1.5),
        Phaser.Math.Between(40, height * 0.4),
        'cloud'
      )
        .setScrollFactor(Phaser.Math.FloatBetween(0.05, 0.15))
        .setScale(Phaser.Math.FloatBetween(0.7, 1.1))
        .setAlpha(0.85);
      this.clouds.push(cloud);
    }
  }

  private createInitialTerrain(): void {
    const tileWidth = 128;
    // Spawn initial safe runway from x = -256 to 1024
    for (let x = -256; x <= 1024; x += tileWidth) {
      const tile = this.groundGroup.create(x, this.groundHeight, 'ground') as Phaser.Physics.Arcade.Sprite;
      tile.setOrigin(0, 0);
      tile.refreshBody();
    }
    this.nextSpawnX = 1024 + tileWidth;
    this.nextEntitySpawnX = 650;
  }

  private createShepherd(): void {
    this.shepherd = this.physics.add.sprite(200, this.groundHeight - 75, 'shepherd');
    this.shepherd.setDepth(10);
    this.shepherd.setGravityY(GAME_CONFIG.WORLD_GRAVITY);
    this.shepherd.setCollideWorldBounds(false);

    // Hitbox tuning (forgiving for child)
    const body = this.shepherd.body as Phaser.Physics.Arcade.Body;
    body.setSize(44, 68);
    body.setOffset(14, 18);
  }

  private createParticles(): void {
    this.sparkleEmitter = this.add.particles(0, 0, 'sparkle', {
      speed: { min: 40, max: 120 },
      angle: { min: 140, max: 220 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.9, end: 0 },
      lifespan: 400,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false
    });
    this.sparkleEmitter.setDepth(9);
  }

  private setupColliders(): void {
    // Ground collision
    this.physics.add.collider(this.shepherd, this.groundGroup);

    // Sheep rescue overlap
    this.physics.add.overlap(this.shepherd, this.sheepGroup, (_p, obj) => {
      this.collectSheep(obj as Phaser.GameObjects.Sprite);
    });

    // Star collection overlap
    this.physics.add.overlap(this.shepherd, this.starsGroup, (_p, obj) => {
      this.collectStar(obj as Phaser.GameObjects.Sprite);
    });

    // Turbo Ramp overlap
    this.physics.add.overlap(this.shepherd, this.rampsGroup, (_p, obj) => {
      this.activateTurboRamp(obj as Phaser.GameObjects.Sprite);
    });

    // Surprise Box (?) overlap
    this.physics.add.overlap(this.shepherd, this.boxesGroup, (_p, obj) => {
      this.hitSurpriseBox(obj as Phaser.GameObjects.Sprite);
    });

    // Obstacle collision (NO GAME OVER - funny spring bounce!)
    this.physics.add.overlap(this.shepherd, this.obstaclesGroup, (_p, obj) => {
      this.hitObstacle(obj as Phaser.GameObjects.Sprite);
    });
  }

  private setupControls(): void {
    // 1-Touch on screen (mobile tap or mouse click)
    this.input.on('pointerdown', () => {
      this.onJumpInput();
    });

    // PC keyboard accessibility: any key jumps
    this.input.keyboard?.on('keydown', () => {
      this.onJumpInput();
    });
  }

  // =========================================================================
  // JUMP & ZERO-FRUSTRATION ASSISTANCE
  // =========================================================================
  public onJumpInput(): void {
    this.lastInteractionTime = this.time.now;
    this.overlayUI?.hideInactivityGuide();

    if (!this.isGameActive) return;

    this.lastJumpRequestTime = this.time.now;

    const body = this.shepherd.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;
    const canCoyote = (this.time.now - this.lastOnGroundTime) <= GAME_CONFIG.COYOTE_TIME_MS;

    // 1st Jump (from ground or during Coyote Time)
    if (onGround || canCoyote) {
      this.performJump(false);
      this.jumpsLeft = 1;
      return;
    }

    // 2nd Jump (Double jump in mid-air)
    if (this.jumpsLeft > 0) {
      this.performJump(true);
      this.jumpsLeft = 0;
    }
  }

  private performJump(isDouble: boolean): void {
    const velocity = isDouble ? GAME_CONFIG.DOUBLE_JUMP_VELOCITY : GAME_CONFIG.JUMP_VELOCITY;
    this.shepherd.setVelocityY(velocity);
    this.shepherd.setTexture('shepherd-jump');

    // Squash & Stretch spring
    this.shepherd.setScale(0.85, 1.25);
    this.tweens.add({
      targets: this.shepherd,
      scaleX: 1,
      scaleY: 1,
      duration: 250,
      ease: 'Back.easeOut'
    });

    // Sparkles burst at feet
    this.sparkleEmitter.explode(10, this.shepherd.x, this.shepherd.y + 30);

    if (isDouble) {
      audioManager.playDoubleJump();
    } else {
      audioManager.playJump();
    }
  }

  // =========================================================================
  // COLLECTIBLES & MECHANICS
  // =========================================================================
  private collectSheep(sheep: Phaser.GameObjects.Sprite): void {
    if (!sheep.active) return;
    sheep.setActive(false);

    this.sheepCount++;
    this.overlayUI?.updateSheepCount(this.sheepCount);

    // Ascending scale audio chime (Tone.js)
    audioManager.playSheepCollect(this.sheepCount - 1);

    // Show giant number pop-up with spring physics in Motion UI
    this.overlayUI?.showNumberPopup(this.sheepCount);

    // Cute float-up and sparkle effect
    this.sparkleEmitter.explode(15, sheep.x, sheep.y);
    this.tweens.add({
      targets: sheep,
      y: sheep.y - 70,
      alpha: 0,
      scale: 1.4,
      angle: 15,
      duration: 500,
      ease: 'Back.easeOut',
      onComplete: () => {
        sheep.destroy();
      }
    });

    // Check 10 sheep goal (Victory!)
    if (this.sheepCount >= GAME_CONFIG.TOTAL_SHEEP_GOAL) {
      this.triggerVictory();
    }
  }

  private collectStar(star: Phaser.GameObjects.Sprite): void {
    if (!star.active) return;
    star.setActive(false);

    this.starCount++;
    this.overlayUI?.updateStarCount(this.starCount);

    audioManager.playStarCollect();
    this.sparkleEmitter.explode(8, star.x, star.y);

    this.tweens.add({
      targets: star,
      y: star.y - 40,
      scale: 1.3,
      alpha: 0,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        star.destroy();
      }
    });
  }

  private activateTurboRamp(ramp: Phaser.GameObjects.Sprite): void {
    if (this.isTurbo) return;
    this.isTurbo = true;

    audioManager.playTurbo();
    audioManager.speak('turbo', GAME_CONFIG.VOICE_LINES.TURBO, false);
    this.overlayUI?.triggerTurboSparks();

    // Visual squash of the ramp
    this.tweens.add({
      targets: ramp,
      scaleY: 0.65,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeInOut'
    });

    // Give little hop & trail sparkles
    this.shepherd.setVelocityY(-180);
    this.sparkleEmitter.start();

    if (this.turboTimer) this.turboTimer.remove();
    this.turboTimer = this.time.delayedCall(GAME_CONFIG.TURBO_DURATION_MS, () => {
      this.isTurbo = false;
      this.sparkleEmitter.stop();
    });
  }

  private hitSurpriseBox(box: Phaser.GameObjects.Sprite): void {
    if (!box.active) return;
    box.setActive(false);

    audioManager.playSurpriseBox();
    audioManager.speak('surpresa', GAME_CONFIG.VOICE_LINES.SURPRISE, false);
    this.overlayUI?.triggerSurpriseConfetti();

    // Box pop animation
    this.tweens.add({
      targets: box,
      y: box.y - 25,
      duration: 120,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        box.setTint(0x94a3b8); // Visually "opened"
      }
    });

    // Spawn 5 burst stars outward
    for (let i = 0; i < 5; i++) {
      const star = this.starsGroup.create(box.x, box.y - 10, 'star') as Phaser.Physics.Arcade.Sprite;
      const angle = (i * Math.PI) / 4;
      const targetX = box.x + Math.cos(angle) * 70;
      const targetY = box.y - 60 + Math.sin(angle) * 40;

      this.tweens.add({
        targets: star,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Cubic.easeOut'
      });
    }
  }

  /**
   * ZERO FRUSTRATION: touching an obstacle makes a funny spring bounce,
   * never dies, never loses points, blinks for 1 sec.
   */
  private hitObstacle(obstacle: Phaser.GameObjects.Sprite): void {
    if (this.isInvulnerable || !this.isGameActive) return;

    this.isInvulnerable = true;

    // Funny spring bounce
    this.shepherd.setVelocityY(GAME_CONFIG.OBSTACLE_BOUNCE_VELOCITY);
    audioManager.playObstacleBump();
    audioManager.speak('ops', GAME_CONFIG.VOICE_LINES.OBSTACLE, false);

    // Obstacle wiggle & squash
    this.tweens.add({
      targets: obstacle,
      scaleX: 1.25,
      scaleY: 0.75,
      duration: 120,
      yoyo: true,
      ease: 'Bounce.easeOut'
    });

    // Shepherd soft blinking invulnerability for 1 sec
    this.tweens.add({
      targets: this.shepherd,
      alpha: 0.35,
      duration: 120,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.shepherd.setAlpha(1.0);
        this.isInvulnerable = false;
      }
    });
  }

  // =========================================================================
  // VICTORY CELEBRATION
  // =========================================================================
  private triggerVictory(): void {
    this.isGameActive = false;
    audioManager.stopMusic();

    // Shepherd joyful victory jump
    this.shepherd.setVelocityX(0);
    this.shepherd.setVelocityY(-350);
    this.shepherd.setTexture('shepherd-jump');

    // Continuous joyful bounce
    this.time.addEvent({
      delay: 700,
      repeat: 6,
      callback: () => {
        this.shepherd.setVelocityY(-320);
        this.sparkleEmitter.explode(15, this.shepherd.x, this.shepherd.y);
      }
    });

    this.overlayUI?.showVictoryScreen();
  }

  // =========================================================================
  // PUBLIC CONTROLS CALLED BY OVERLAY UI
  // =========================================================================
  public startGame(): void {
    this.isGameActive = false;
    this.shepherd.setVelocityX(0);

    this.overlayUI?.playCountdown(() => {
      this.isGameActive = true;
      audioManager.startMusic();
      this.lastInteractionTime = this.time.now;
    });
  }

  public restartGame(): void {
    this.overlayUI?.resetHud();
    this.scene.restart();
    this.time.delayedCall(100, () => {
      this.startGame();
    });
  }

  // =========================================================================
  // GAME LOOP & PROCEDURAL GENERATION
  // =========================================================================
  public update(time: number, delta: number): void {
    const body = this.shepherd.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down || body.touching.down;

    // Track Coyote Time
    if (onGround) {
      this.lastOnGroundTime = time;
      this.jumpsLeft = 2;

      // Handle Jump Buffering (if player tapped up to 160ms before landing)
      if (time - this.lastJumpRequestTime <= GAME_CONFIG.JUMP_BUFFER_MS) {
        this.performJump(false);
        this.lastJumpRequestTime = 0;
      }

      // Restore running sprite
      if (!this.wasOnGround) {
        this.shepherd.setTexture('shepherd');
        // Gentle squash on landing
        this.shepherd.setScale(1.15, 0.85);
        this.tweens.add({
          targets: this.shepherd,
          scaleX: 1,
          scaleY: 1,
          duration: 180,
          ease: 'Quad.easeOut'
        });
      }
    }
    this.wasOnGround = onGround;

    // Update runner velocity
    if (this.isGameActive) {
      const currentSpeed = this.isTurbo ? GAME_CONFIG.TURBO_SPEED : GAME_CONFIG.RUN_SPEED;
      this.shepherd.setVelocityX(currentSpeed);

      // Cute running bob
      if (onGround) {
        this.shepherd.setAngle(Math.sin(time * 0.015) * 3);
      } else {
        this.shepherd.setAngle(0);
      }

      // Parallax update
      const camX = this.cameras.main.scrollX;
      this.hillBack.tilePositionX = camX * 0.1;
      this.hillMid.tilePositionX = camX * 0.25;
      this.hillFore.tilePositionX = camX * 0.55;

      // Drift clouds slowly
      this.clouds.forEach((c, idx) => {
        c.x -= delta * (0.015 + idx * 0.005);
        if (c.x < camX - 150) {
          c.x = camX + this.scale.width + Phaser.Math.Between(100, 300);
        }
      });

      // Procedural chunk spawning ahead
      this.spawnChunksAhead();

      // Check inactivity assistance for toddlers
      this.checkInactivity(time);
    } else {
      this.shepherd.setVelocityX(0);
    }

    // Clean up far behind objects
    this.cleanupOldObjects();
  }

  private spawnChunksAhead(): void {
    const camRight = this.cameras.main.scrollX + this.scale.width + 600;
    const tileWidth = 128;

    // 1. Extend ground tiles seamlessly
    while (this.nextSpawnX < camRight) {
      const tile = this.groundGroup.create(this.nextSpawnX, this.groundHeight, 'ground') as Phaser.Physics.Arcade.Sprite;
      tile.setOrigin(0, 0);
      tile.refreshBody();
      this.nextSpawnX += tileWidth;
    }

    // 2. Procedural entity placement (sheep, stars, ramps, boxes, obstacles)
    while (this.nextEntitySpawnX < camRight) {
      const spawnX = this.nextEntitySpawnX;
      const pattern = Phaser.Math.Between(0, 10);

      if (pattern <= 3 && this.sheepCount < GAME_CONFIG.TOTAL_SHEEP_GOAL) {
        // Cute Sheep to rescue
        const isAir = Phaser.Math.Between(0, 1) === 1;
        const sheepY = isAir ? this.groundHeight - 75 : this.groundHeight - 45;
        this.sheepGroup.create(spawnX, sheepY, 'sheep');
      } else if (pattern === 4 || pattern === 5) {
        // Arc of 3 Stars
        for (let s = 0; s < 3; s++) {
          const arcY = this.groundHeight - (55 + Math.sin((s * Math.PI) / 2) * 45);
          this.starsGroup.create(spawnX + s * 35, arcY, 'star');
        }
      } else if (pattern === 6) {
        // Rainbow Turbo Ramp
        this.rampsGroup.create(spawnX, this.groundHeight - 20, 'turbo-ramp');
      } else if (pattern === 7) {
        // Surprise Box (?)
        this.boxesGroup.create(spawnX, this.groundHeight - 95, 'box-question');
      } else if (pattern === 8) {
        // Cute friendly Rock obstacle
        this.obstaclesGroup.create(spawnX, this.groundHeight - 16, 'rock');
      } else if (pattern === 9) {
        // Fluffy Berry Bush obstacle
        this.obstaclesGroup.create(spawnX, this.groundHeight - 18, 'bush');
      } else {
        // Shiny Water puddle obstacle
        this.obstaclesGroup.create(spawnX, this.groundHeight - 8, 'puddle');
      }

      // Spacing between items: 250px - 320px for pleasant pacing
      this.nextEntitySpawnX += Phaser.Math.Between(250, 320);
    }
  }

  private checkInactivity(time: number): void {
    if (time - this.lastInteractionTime > GAME_CONFIG.INACTIVITY_HINT_TIME_MS) {
      // Check if an obstacle or sheep is approaching within 400px ahead
      let isItemNear = false;
      const shepherdX = this.shepherd.x;

      this.obstaclesGroup.getChildren().forEach((child) => {
        const c = child as Phaser.Physics.Arcade.Sprite;
        if (c.active && c.x > shepherdX && c.x - shepherdX < 360) {
          isItemNear = true;
        }
      });

      this.sheepGroup.getChildren().forEach((child) => {
        const c = child as Phaser.Physics.Arcade.Sprite;
        if (c.active && c.x > shepherdX && c.x - shepherdX < 360) {
          isItemNear = true;
        }
      });

      if (isItemNear) {
        this.overlayUI?.showInactivityGuide();
      }
    }
  }

  private cleanupOldObjects(): void {
    const camLeft = this.cameras.main.scrollX - 350;

    const cleanup = (group: Phaser.Physics.Arcade.Group | Phaser.Physics.Arcade.StaticGroup) => {
      group.getChildren().forEach((child) => {
        const item = child as Phaser.GameObjects.Sprite;
        if (item.x < camLeft) {
          item.destroy();
        }
      });
    };

    cleanup(this.groundGroup);
    cleanup(this.obstaclesGroup);
    cleanup(this.sheepGroup);
    cleanup(this.starsGroup);
    cleanup(this.rampsGroup);
    cleanup(this.boxesGroup);
  }
}
