import * as THREE from 'three';
import { ModelBuilder } from '../graphics/ModelBuilder';
import { audioManager } from '../audio/AudioManager';
import { overlayUI } from '../ui/OverlayUI';
import { GAME_CONFIG } from '../config';

export type CameraViewMode = 'chase' | 'isometric';

interface TrackChunk {
  group: THREE.Group;
  zStart: number;
  zEnd: number;
}

interface ActiveEntity {
  group: THREE.Group;
  type: 'sheep' | 'star' | 'ramp' | 'box' | 'obstacle';
  z: number;
  x: number;
  y: number;
  radius: number;
  collected?: boolean;
  onUpdate?: (delta: number, time: number) => void;
}

export class Game3D {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  // Camera settings
  private cameraMode: CameraViewMode = 'chase';
  private currentCamPos = new THREE.Vector3();
  private currentCamLookAt = new THREE.Vector3();

  // Lighting & Sky
  private sunLight!: THREE.DirectionalLight;
  private sunMesh!: THREE.Group;
  private rainbowMesh!: THREE.Group;
  private clouds: THREE.Group[] = [];

  // Player & 3D Model
  private shepherdRoot!: THREE.Group;
  private shepherdAnimateRun!: (time: number, speed: number) => void;
  private shepherdY: number = 0;
  private shepherdVy: number = 0;
  private shepherdZ: number = 0;
  private shepherdX: number = 0;

  // Physics & Mechanics
  private isGameActive: boolean = false;
  private isTurbo: boolean = false;
  private turboTimer: number | null = null;
  private isInvulnerable: boolean = false;
  private jumpsLeft: number = 2;
  private wasOnGround: boolean = true;
  private lastOnGroundTime: number = 0;
  private lastJumpRequestTime: number = 0;
  private lastInteractionTime: number = 0;

  private sheepCount: number = 0;
  private starCount: number = 0;

  // Track Chunks & Pooling
  private chunks: TrackChunk[] = [];
  private entities: ActiveEntity[] = [];
  private nextChunkZ: number = 0;
  private nextEntityZ: number = -15;

  // Animation Loop
  private clock = new THREE.Clock();
  private animFrameId: number | null = null;

  constructor(containerId: string = 'game-container') {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Container #${containerId} not found`);
    this.container = el;

    this.initThree();
    this.createLightsAndSky();
    this.createPlayer();
    this.createInitialTrack();
    this.setupEventListeners();
  }

  private initThree(): void {
    // Clear container of any previous canvas
    this.container.innerHTML = '';

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 45, 95);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(58, aspect, 0.1, 150);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.appendChild(this.renderer.domElement);
  }

  private createLightsAndSky(): void {
    // Ambient soft skylight
    const ambient = new THREE.AmbientLight(0xfff7ed, 0.7);
    this.scene.add(ambient);

    // Hemisphere sky/ground light
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x4ade80, 0.6);
    this.scene.add(hemiLight);

    // Warm Directional Sunlight with Soft Shadows
    this.sunLight = new THREE.DirectionalLight(0xffedd5, 1.3);
    this.sunLight.position.set(15, 25, 20);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 80;
    this.sunLight.shadow.camera.left = -15;
    this.sunLight.shadow.camera.right = 15;
    this.sunLight.shadow.camera.top = 15;
    this.sunLight.shadow.camera.bottom = -15;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Giant Smiling 3D Sun
    this.sunMesh = ModelBuilder.createSun();
    this.sunMesh.position.set(14, 22, -45);
    this.scene.add(this.sunMesh);

    // 3D Rainbow Arch in distance
    this.rainbowMesh = ModelBuilder.createRainbow();
    this.rainbowMesh.position.set(0, 0, -65);
    this.scene.add(this.rainbowMesh);

    // Drifting Fluffy 3D Clouds
    for (let i = 0; i < 6; i++) {
      const cloud = ModelBuilder.createCloud();
      cloud.position.set(
        (Math.random() - 0.5) * 60,
        14 + Math.random() * 8,
        -10 - Math.random() * 60
      );
      this.clouds.push(cloud);
      this.scene.add(cloud);
    }
  }

  private createPlayer(): void {
    const shepherd = ModelBuilder.createShepherd();
    this.shepherdRoot = shepherd.root;
    this.shepherdAnimateRun = shepherd.animateRun;

    this.shepherdRoot.position.set(0, 0, 0);
    this.shepherdRoot.rotation.y = Math.PI; // Face forward along -Z axis
    this.scene.add(this.shepherdRoot);

    this.shepherdZ = 0;
    this.shepherdY = 0;
  }

  // =========================================================================
  // TRACK CHUNKS & RUNWAY
  // =========================================================================
  private createTrackChunk(zPos: number, length: number = 30): TrackChunk {
    const chunkGroup = new THREE.Group();

    // 1. Meadow Ground plane
    const groundGeo = new THREE.PlaneGeometry(36, length);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.9,
      metalness: 0.05
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI * 0.5;
    groundMesh.position.set(0, -0.02, -length * 0.5);
    groundMesh.receiveShadow = true;
    chunkGroup.add(groundMesh);

    // 2. Cobblestone / Dirt Track
    const trackGeo = new THREE.PlaneGeometry(3.6, length);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.8
    });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI * 0.5;
    trackMesh.position.set(0, 0, -length * 0.5);
    trackMesh.receiveShadow = true;
    chunkGroup.add(trackMesh);

    // 3. Side Grass Trim curbs
    const curbGeo = new THREE.BoxGeometry(0.3, 0.08, length);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
    const leftCurb = new THREE.Mesh(curbGeo, curbMat);
    leftCurb.position.set(-1.85, 0.04, -length * 0.5);
    leftCurb.receiveShadow = true;

    const rightCurb = leftCurb.clone();
    rightCurb.position.x = 1.85;
    chunkGroup.add(leftCurb, rightCurb);

    // 4. Colorful 3D Wildflowers on sides
    const flowerColors = [0xf43f5e, 0xfbbf24, 0x38bdf8, 0xffffff];
    const flowerGeo = new THREE.SphereGeometry(0.12, 6, 6);

    for (let f = 0; f < 8; f++) {
      const col = flowerColors[Math.floor(Math.random() * flowerColors.length)];
      const fMat = new THREE.MeshBasicMaterial({ color: col });
      const flower = new THREE.Mesh(flowerGeo, fMat);
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (2.4 + Math.random() * 3.5);
      const z = -Math.random() * length;
      flower.position.set(x, 0.1, z);
      chunkGroup.add(flower);
    }

    // 5. Background Rolling 3D Hills
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.95 });
    const hill1 = new THREE.Mesh(new THREE.SphereGeometry(8, 12, 12), hillMat);
    hill1.scale.set(1.5, 0.55, 1.2);
    hill1.position.set(-18, 0, -length * 0.5);
    const hill2 = new THREE.Mesh(new THREE.SphereGeometry(9, 12, 12), hillMat);
    hill2.scale.set(1.4, 0.6, 1.3);
    hill2.position.set(19, 0, -length * 0.5);
    chunkGroup.add(hill1, hill2);

    chunkGroup.position.z = zPos;
    this.scene.add(chunkGroup);

    return {
      group: chunkGroup,
      zStart: zPos,
      zEnd: zPos - length
    };
  }

  private createInitialTrack(): void {
    // Generate initial safe track chunks (starts at z=15 back to -75)
    this.nextChunkZ = 15;
    for (let i = 0; i < 4; i++) {
      const chunk = this.createTrackChunk(this.nextChunkZ, 30);
      this.chunks.push(chunk);
      this.nextChunkZ -= 30;
    }
  }

  // =========================================================================
  // CAMERA VIEW & INTERPOLATION
  // =========================================================================
  public setCameraMode(mode: CameraViewMode): void {
    this.cameraMode = mode;
    overlayUI.updateCameraIcon(mode);
  }

  public toggleCameraMode(): void {
    const nextMode: CameraViewMode = this.cameraMode === 'chase' ? 'isometric' : 'chase';
    this.setCameraMode(nextMode);
  }

  private updateCamera(delta: number): void {
    const pZ = this.shepherdZ;
    const pY = this.shepherdY;
    const pX = this.shepherdX;

    let targetPos = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3();

    if (this.cameraMode === 'chase') {
      // 3ª Pessoa atrás (Mario Kart / Minion Rush)
      targetPos.set(pX * 0.4, pY * 0.5 + 3.2, pZ + 6.2);
      targetLookAt.set(pX * 0.2, pY * 0.3 + 1.3, pZ - 8.0);
    } else {
      // 2.5D Lateral Isométrica (Super Mario 3D World / Kirby)
      targetPos.set(pX + 6.2, pY * 0.6 + 4.2, pZ + 4.4);
      targetLookAt.set(pX, pY * 0.4 + 1.1, pZ - 2.8);
    }

    // Smooth camera glide
    const lerpFactor = Math.min(delta * 6.5, 1.0);
    this.currentCamPos.lerp(targetPos, lerpFactor);
    this.currentCamLookAt.lerp(targetLookAt, lerpFactor);

    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentCamLookAt);

    // Keep sunlight moving forward with player for persistent crisp shadows
    this.sunLight.position.set(pX + 15, 25, pZ + 15);
    this.sunLight.target.position.set(pX, 0, pZ - 5);
    this.sunLight.target.updateMatrixWorld();

    // Drifting scenery following player horizon
    this.sunMesh.position.z = pZ - 55;
    this.rainbowMesh.position.z = pZ - 75;
  }

  // =========================================================================
  // INPUT & TODDLER ASSISTANCE (1-TOUCH / ZERO FRUSTRAÇÃO)
  // =========================================================================
  private setupEventListeners(): void {
    const onJumpAction = () => {
      this.lastInteractionTime = performance.now();
      overlayUI.hideInactivityGuide();
      this.onJumpInput();
    };

    // 1-Touch on screen (mobile touch or mouse click)
    window.addEventListener('pointerdown', (e) => {
      // Ignore if clicking UI buttons
      const target = e.target as HTMLElement;
      if (target && target.closest('button')) return;
      onJumpAction();
    });

    // Desktop keyboard: any key jumps
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code.startsWith('Arrow') || e.key) {
        onJumpAction();
      }
    });

    // Window Resize
    window.addEventListener('resize', () => {
      this.onWindowResize();
    });
  }

  public onJumpInput(): void {
    if (!this.isGameActive) return;

    const now = performance.now();
    this.lastJumpRequestTime = now;

    const onGround = this.shepherdY <= 0.001;
    const canCoyote = (now - this.lastOnGroundTime) <= GAME_CONFIG.COYOTE_TIME_MS;

    // 1st Jump (from ground or coyote time)
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
    const jumpPower = isDouble ? 10.2 : 11.8;
    this.shepherdVy = jumpPower;

    // Squash & stretch jump animation
    this.shepherdRoot.scale.set(0.85, 1.25, 0.85);

    if (isDouble) {
      audioManager.playDoubleJump();
    } else {
      audioManager.playJump();
    }
  }

  // =========================================================================
  // GAME LIFECYCLE
  // =========================================================================
  public start(): void {
    this.clock.start();
    this.currentCamPos.set(0, 3.2, 7.0);
    this.currentCamLookAt.set(0, 1.2, -8.0);

    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const delta = Math.min(this.clock.getDelta(), 0.1);
      const time = this.clock.getElapsedTime();
      this.update(delta, time);
    };
    animate();
  }

  public startGame(): void {
    this.isGameActive = false;
    this.shepherdVy = 0;
    this.shepherdY = 0;
    this.shepherdRoot.position.set(0, 0, this.shepherdZ);

    overlayUI.playCountdown(() => {
      this.isGameActive = true;
      audioManager.startMusic();
      this.lastInteractionTime = performance.now();
    });
  }

  public restartGame(): void {
    // Reset state & clear active entities
    this.isGameActive = false;
    this.isTurbo = false;
    this.isInvulnerable = false;
    this.sheepCount = 0;
    this.starCount = 0;
    this.jumpsLeft = 2;
    this.shepherdZ = 0;
    this.shepherdY = 0;
    this.shepherdVy = 0;
    this.shepherdRoot.position.set(0, 0, 0);

    this.entities.forEach(e => this.scene.remove(e.group));
    this.entities = [];
    this.nextEntityZ = -15;

    overlayUI.resetHud();
    this.startGame();
  }

  // =========================================================================
  // UPDATE LOOP & SPAWNER
  // =========================================================================
  private update(delta: number, time: number): void {
    const now = performance.now();

    // 1. Player Physics & Running
    if (this.isGameActive) {
      const runSpeed = this.isTurbo ? 23.0 : 13.5;
      this.shepherdZ -= runSpeed * delta;

      // Gravity & Vertical Movement
      const gravity = -26.0;
      this.shepherdVy += gravity * delta;
      this.shepherdY += this.shepherdVy * delta;

      // Ground Check
      if (this.shepherdY <= 0) {
        this.shepherdY = 0;
        this.shepherdVy = 0;
        this.lastOnGroundTime = now;
        this.jumpsLeft = 2;

        // Jump buffering check
        if (now - this.lastJumpRequestTime <= GAME_CONFIG.JUMP_BUFFER_MS) {
          this.performJump(false);
          this.lastJumpRequestTime = 0;
        }

        // Return squash/stretch to normal
        this.shepherdRoot.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 12);
      }

      this.shepherdRoot.position.set(this.shepherdX, this.shepherdY, this.shepherdZ);
      this.shepherdAnimateRun(time, runSpeed);

      // Procedural Track & Entities Spawning
      this.spawnChunksAndEntities();

      // Check Inactivity Assistance
      this.checkInactivity(now);
    } else {
      this.shepherdRoot.position.set(this.shepherdX, this.shepherdY, this.shepherdZ);
    }

    // 2. Entity Animations & Collision Detection
    this.updateEntities(delta, time);

    // 3. Clouds Drifting
    this.clouds.forEach((c, idx) => {
      c.position.x += delta * (0.3 + idx * 0.1);
      if (c.position.x > 35) c.position.x = -35;
    });

    // Sun gentle ray rotation
    if (this.sunMesh) {
      this.sunMesh.rotation.z += delta * 0.15;
    }

    // 4. Update Camera
    this.updateCamera(delta);

    // 5. Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  private spawnChunksAndEntities(): void {
    const forwardHorizon = this.shepherdZ - 70;

    // Extend track chunks forward
    while (this.nextChunkZ > forwardHorizon) {
      const chunk = this.createTrackChunk(this.nextChunkZ, 30);
      this.chunks.push(chunk);
      this.nextChunkZ -= 30;
    }

    // Clean up far behind chunks
    const cleanupZ = this.shepherdZ + 25;
    this.chunks = this.chunks.filter(chunk => {
      if (chunk.zEnd > cleanupZ) {
        this.scene.remove(chunk.group);
        return false;
      }
      return true;
    });

    // Spawn 3D entities ahead
    while (this.nextEntityZ > forwardHorizon) {
      const z = this.nextEntityZ;
      const pattern = Math.floor(Math.random() * 10);

      if (pattern <= 3 && this.sheepCount < GAME_CONFIG.TOTAL_SHEEP_GOAL) {
        // 3D Fluffy Sheep
        const sheep = ModelBuilder.createSheep();
        const isAir = Math.random() > 0.5;
        const y = isAir ? 1.6 : 0.0;
        sheep.position.set(0, y, z);
        this.scene.add(sheep);

        this.entities.push({
          group: sheep,
          type: 'sheep',
          z,
          x: 0,
          y,
          radius: 0.85,
          onUpdate: (dt, t) => {
            sheep.position.y = y + Math.sin(t * 3.5) * 0.15;
            sheep.rotation.y = Math.sin(t * 2) * 0.15;
          }
        });
      } else if (pattern === 4 || pattern === 5) {
        // Arc of 3 Golden Stars
        for (let s = 0; s < 3; s++) {
          const star = ModelBuilder.createStar();
          const starZ = z - s * 2.2;
          const starY = 1.0 + Math.sin((s * Math.PI) / 2) * 1.4;
          star.position.set(0, starY, starZ);
          this.scene.add(star);

          this.entities.push({
            group: star,
            type: 'star',
            z: starZ,
            x: 0,
            y: starY,
            radius: 0.65,
            onUpdate: (dt) => {
              star.rotation.y += dt * 3.0;
            }
          });
        }
      } else if (pattern === 6) {
        // 3D Rainbow Turbo Ramp
        const ramp = ModelBuilder.createTurboRamp();
        ramp.position.set(0, 0, z);
        this.scene.add(ramp);

        this.entities.push({
          group: ramp,
          type: 'ramp',
          z,
          x: 0,
          y: 0.2,
          radius: 1.2
        });
      } else if (pattern === 7) {
        // 3D Surprise Box (?)
        const box = ModelBuilder.createSurpriseBox();
        box.position.set(0, 2.1, z);
        this.scene.add(box);

        this.entities.push({
          group: box,
          type: 'box',
          z,
          x: 0,
          y: 2.1,
          radius: 0.8,
          onUpdate: (dt, t) => {
            box.position.y = 2.1 + Math.sin(t * 3) * 0.1;
            box.rotation.y += dt * 0.8;
          }
        });
      } else if (pattern === 8) {
        // 3D Sleepy Rock
        const rock = ModelBuilder.createRock();
        rock.position.set(0, 0, z);
        this.scene.add(rock);

        this.entities.push({
          group: rock,
          type: 'obstacle',
          z,
          x: 0,
          y: 0.2,
          radius: 0.65
        });
      } else if (pattern === 9) {
        // 3D Berry Bush
        const bush = ModelBuilder.createBush();
        bush.position.set(0, 0, z);
        this.scene.add(bush);

        this.entities.push({
          group: bush,
          type: 'obstacle',
          z,
          x: 0,
          y: 0.3,
          radius: 0.7
        });
      } else {
        // 3D Water Puddle
        const puddle = ModelBuilder.createPuddle();
        puddle.position.set(0, 0, z);
        this.scene.add(puddle);

        this.entities.push({
          group: puddle,
          type: 'obstacle',
          z,
          x: 0,
          y: 0.1,
          radius: 0.65
        });
      }

      this.nextEntityZ -= 8.5 + Math.random() * 3.5;
    }
  }

  private updateEntities(delta: number, time: number): void {
    const pZ = this.shepherdZ;
    const pY = this.shepherdY;

    this.entities = this.entities.filter(ent => {
      // Run entity idle animation
      ent.onUpdate?.(delta, time);

      // Clean up past entities
      if (ent.z > pZ + 12) {
        this.scene.remove(ent.group);
        return false;
      }

      if (ent.collected) return true;

      // Check collision distance
      const dz = Math.abs(ent.z - pZ);
      const dy = Math.abs(ent.y - pY);

      if (dz < ent.radius && dy < 1.3) {
        if (ent.type === 'sheep') {
          this.collectSheep(ent);
        } else if (ent.type === 'star') {
          this.collectStar(ent);
        } else if (ent.type === 'ramp') {
          this.activateTurboRamp(ent);
        } else if (ent.type === 'box') {
          this.hitSurpriseBox(ent);
        } else if (ent.type === 'obstacle') {
          this.hitObstacle(ent);
        }
      }

      return true;
    });
  }

  // =========================================================================
  // ACTIONS & ZERO-FRUSTRATION COLLISIONS
  // =========================================================================
  private collectSheep(ent: ActiveEntity): void {
    ent.collected = true;
    this.sheepCount++;
    overlayUI.updateSheepCount(this.sheepCount);

    audioManager.playSheepCollect(this.sheepCount - 1);
    overlayUI.showNumberPopup(this.sheepCount);

    // Sheep float up and spin
    const sheep = ent.group;
    const startY = sheep.position.y;
    let t = 0;
    const animInterval = setInterval(() => {
      t += 0.05;
      sheep.position.y = startY + t * 2.5;
      sheep.rotation.y += 0.3;
      sheep.scale.multiplyScalar(0.96);
      if (t >= 0.6) {
        clearInterval(animInterval);
        this.scene.remove(sheep);
      }
    }, 16);

    if (this.sheepCount >= GAME_CONFIG.TOTAL_SHEEP_GOAL) {
      this.triggerVictory();
    }
  }

  private collectStar(ent: ActiveEntity): void {
    ent.collected = true;
    this.starCount++;
    overlayUI.updateStarCount(this.starCount);

    audioManager.playStarCollect();

    // Star pop scale
    const star = ent.group;
    let t = 0;
    const anim = setInterval(() => {
      t += 0.08;
      star.position.y += 0.15;
      star.scale.multiplyScalar(0.92);
      if (t >= 0.4) {
        clearInterval(anim);
        this.scene.remove(star);
      }
    }, 16);
  }

  private activateTurboRamp(ent: ActiveEntity): void {
    if (this.isTurbo) return;
    this.isTurbo = true;

    audioManager.playTurbo();
    audioManager.speak('turbo', GAME_CONFIG.VOICE_LINES.TURBO, false);
    overlayUI.triggerTurboSparks();

    this.shepherdVy = 5.5; // Gentle upward turbo boost

    if (this.turboTimer) clearTimeout(this.turboTimer);
    this.turboTimer = window.setTimeout(() => {
      this.isTurbo = false;
    }, GAME_CONFIG.TURBO_DURATION_MS);
  }

  private hitSurpriseBox(ent: ActiveEntity): void {
    ent.collected = true;
    audioManager.playSurpriseBox();
    audioManager.speak('surpresa', GAME_CONFIG.VOICE_LINES.SURPRISE, false);
    overlayUI.triggerSurpriseConfetti();

    // Box pop & spin
    const box = ent.group;
    box.position.y += 0.4;
    setTimeout(() => {
      this.scene.remove(box);
    }, 300);

    // Spawn 4 burst stars
    for (let i = 0; i < 4; i++) {
      const star = ModelBuilder.createStar();
      const angle = (i * Math.PI) / 2;
      star.position.set(
        Math.cos(angle) * 1.2,
        2.2 + Math.sin(angle) * 0.8,
        ent.z - 1.5
      );
      this.scene.add(star);

      this.entities.push({
        group: star,
        type: 'star',
        z: ent.z - 1.5,
        x: Math.cos(angle) * 1.2,
        y: 2.2,
        radius: 0.8
      });
    }
  }

  /**
   * ZERO FRUSTRATION: touching an obstacle makes a funny spring bounce,
   * no game over, no score penalty!
   */
  private hitObstacle(ent: ActiveEntity): void {
    if (this.isInvulnerable || !this.isGameActive) return;
    this.isInvulnerable = true;

    this.shepherdVy = 8.5; // Funny spring bounce
    audioManager.playObstacleBump();
    audioManager.speak('ops', GAME_CONFIG.VOICE_LINES.OBSTACLE, false);

    // Obstacle squash
    ent.group.scale.set(1.3, 0.6, 1.3);
    setTimeout(() => {
      ent.group.scale.set(1, 1, 1);
    }, 250);

    // Shepherd soft blinking invulnerability for 1 sec
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      this.shepherdRoot.visible = !this.shepherdRoot.visible;
      blinkCount++;
      if (blinkCount >= 8) {
        clearInterval(blinkInterval);
        this.shepherdRoot.visible = true;
        this.isInvulnerable = false;
      }
    }, 125);
  }

  private triggerVictory(): void {
    this.isGameActive = false;
    audioManager.stopMusic();

    this.shepherdVy = 7.0;

    overlayUI.showVictoryScreen();
  }

  private checkInactivity(now: number): void {
    if (now - this.lastInteractionTime > GAME_CONFIG.INACTIVITY_HINT_TIME_MS) {
      const hasObstacleNear = this.entities.some(
        e => e.z < this.shepherdZ && (this.shepherdZ - e.z) < 9.0 && (e.type === 'obstacle' || e.type === 'sheep')
      );

      if (hasObstacleNear) {
        overlayUI.showInactivityGuide();
      }
    }
  }

  private onWindowResize(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
}
