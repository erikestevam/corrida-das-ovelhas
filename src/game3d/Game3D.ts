/**
 * O Bom Pastor: Motor 3D do Mundo Aberto (Three.js WebGL)
 * Integrado com a lógica pura (rules.ts) e controles (InputManager.ts),
 * seguindo as melhores práticas do Claude Code Game Studios.
 */

import * as THREE from 'three';
import { ModelBuilder } from '../graphics/ModelBuilder';
import { audioManager } from '../audio/AudioManager';
import { overlayUI } from '../ui/OverlayUI';
import { inputManager } from '../input/InputManager';
import {
  createInitialState,
  updatePlayer,
  updateSheep,
  checkInteractions,
  getCompassTarget,
  type GameState,
  type InteractionEvent
} from '../game/rules';

export class Game3D {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  // Lógica do jogo (desacoplada)
  private state!: GameState;
  private isGameActive: boolean = false;

  // Câmera em 3ª pessoa suave
  private camDistance = 8.5;
  private camHeight = 5.2;
  private currentCamPos = new THREE.Vector3();
  private currentCamLookAt = new THREE.Vector3();

  // Modelos 3D
  private shepherdRoot!: THREE.Group;
  private shepherdAnimateRun!: (time: number, speed: number) => void;
  private guideArrow!: THREE.Group;
  private corralDeliveryBeacon!: THREE.Mesh;

  private sheepMeshes: Map<number, THREE.Group> = new Map();
  private starMeshes: Map<number, THREE.Group> = new Map();

  // Elementos do ambiente
  private sunLight!: THREE.DirectionalLight;
  private sunMesh!: THREE.Group;
  private rainbowMesh!: THREE.Group;
  private clouds: THREE.Group[] = [];

  // Loop de animação
  private clock = new THREE.Clock();
  private animFrameId: number | null = null;

  constructor(containerId: string = 'game-container') {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Container #${containerId} not found`);
    this.container = el;

    this.state = createInitialState();

    this.initThree();
    this.createSkyAndLighting();
    this.createOpenWorldEnvironment();
    this.createPlayer();
    this.createSheepEntities();
    this.createStarEntities();
    this.setupWindowResize();
  }

  private initThree(): void {
    this.container.innerHTML = '';

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 40, 110);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(54, aspect, 0.1, 180);

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  private createSkyAndLighting(): void {
    // 1. Luz ambiente suave
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x86efac, 0.95);
    this.scene.add(hemiLight);

    // 2. Luz do Sol com sombras suaves
    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    this.sunLight.position.set(30, 60, -25);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 150;
    const shadowD = 60;
    this.sunLight.shadow.camera.left = -shadowD;
    this.sunLight.shadow.camera.right = shadowD;
    this.sunLight.shadow.camera.top = shadowD;
    this.sunLight.shadow.camera.bottom = -shadowD;
    this.sunLight.shadow.bias = -0.0006;
    this.scene.add(this.sunLight);

    // 3. Sol sorridente cartoon no horizonte
    this.sunMesh = ModelBuilder.createSun();
    this.sunMesh.position.set(35, 42, -60);
    this.sunMesh.scale.setScalar(2.2);
    this.scene.add(this.sunMesh);

    // 4. Arco-íris magnífico no céu
    this.rainbowMesh = ModelBuilder.createRainbow();
    this.rainbowMesh.position.set(0, 0, -65);
    this.rainbowMesh.scale.set(2.2, 2.2, 2.2);
    this.scene.add(this.rainbowMesh);

    // 5. Nuvens fofas flutuando
    const cloudPositions: [number, number, number][] = [
      [-35, 32, -40], [28, 35, -30], [-18, 38, 15],
      [32, 34, 30], [-42, 30, -5], [15, 36, -50]
    ];
    cloudPositions.forEach(([cx, cy, cz]) => {
      const cloud = ModelBuilder.createCloud();
      cloud.position.set(cx, cy, cz);
      const s = 1.6 + Math.random() * 0.8;
      cloud.scale.setScalar(s);
      this.scene.add(cloud);
      this.clouds.push(cloud);
    });
  }

  private createOpenWorldEnvironment(): void {
    const bounds = this.state.tuning.worldBounds;
    const worldW = bounds.maxX - bounds.minX;
    const worldD = bounds.maxZ - bounds.minZ;

    // 1. Chão do Prado Verdejante
    const groundGeo = new THREE.PlaneGeometry(worldW + 30, worldD + 30, 48, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80,
      roughness: 0.85,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. A Fazenda (Celeiro Vermelho + O Aprisco)
    const farm = this.state.tuning.farm;

    // Celeiro posicionado harmoniosamente atrás do cercadinho
    const barn = ModelBuilder.createBarn();
    barn.position.set(farm.x - 1.5, 0, farm.z - 9.5);
    barn.rotation.y = 0;
    this.scene.add(barn);

    // Cercadinho do Aprisco
    const corralData = ModelBuilder.createCorral(farm.radius);
    corralData.root.position.set(farm.x, 0, farm.z);
    this.corralDeliveryBeacon = corralData.deliveryZone;
    this.scene.add(corralData.root);

    // 3. Cerca rústica de madeira ao redor de todo o mundo aberto
    this.createPerimeterFences(bounds);

    // 4. Árvores fofas (Macieiras, Carvalhos, Pinheiros)
    const treePositions: [number, number, 'oak' | 'apple' | 'pine'][] = [
      [-32, -25, 'apple'], [-42, -15, 'oak'], [-25, 20, 'apple'],
      [36, -30, 'oak'], [42, -10, 'apple'], [32, 25, 'oak'],
      [-18, 45, 'pine'], [24, 46, 'apple'], [-38, 35, 'pine'],
      [38, 38, 'pine'], [-48, 0, 'oak'], [48, 5, 'apple'],
      [-10, -48, 'pine'], [14, -48, 'pine'], [-28, -42, 'oak']
    ];
    treePositions.forEach(([tx, tz, type]) => {
      const tree = ModelBuilder.createTree(type);
      tree.position.set(tx, 0, tz);
      const s = 1.2 + Math.random() * 0.4;
      tree.scale.setScalar(s);
      this.scene.add(tree);
    });

    // 5. Flores coloridas espalhadas pelo campo
    const flowerColors = [0xf43f5e, 0xfacc15, 0xec4899, 0xa855f7, 0x38bdf8];
    for (let i = 0; i < 45; i++) {
      const angle = (i / 45) * Math.PI * 2;
      const r = 12 + (i % 6) * 6 + Math.random() * 4;
      const fx = Math.cos(angle) * r;
      const fz = Math.sin(angle) * r;
      const flower = ModelBuilder.createFlower(flowerColors[i % flowerColors.length]);
      flower.position.set(fx, 0, fz);
      flower.scale.setScalar(0.9 + Math.random() * 0.5);
      this.scene.add(flower);
    }

    // 6. Laguinho com água cristalina
    const puddle = ModelBuilder.createPuddle();
    puddle.position.set(22, 0.02, 10);
    puddle.scale.set(4.5, 1, 3.8);
    this.scene.add(puddle);

    // Pedrinhas e arbustos decorativos
    const decorPositions: [number, number][] = [
      [18, 8], [26, 12], [-20, -5], [12, -18], [-12, 28]
    ];
    decorPositions.forEach(([dx, dz]) => {
      const bush = ModelBuilder.createBush();
      bush.position.set(dx, 0, dz);
      this.scene.add(bush);
    });
  }

  private createPerimeterFences(bounds: { minX: number; maxX: number; minZ: number; maxZ: number }): void {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const postGeo = new THREE.CylinderGeometry(0.16, 0.18, 1.4, 8);
    const railGeo = new THREE.BoxGeometry(4.1, 0.12, 0.08);

    const addFenceLine = (x1: number, z1: number, x2: number, z2: number) => {
      const dist = Math.hypot(x2 - x1, z2 - z1);
      const steps = Math.floor(dist / 4.0);
      const dx = (x2 - x1) / steps;
      const dz = (z2 - z1) / steps;
      const angle = Math.atan2(z2 - z1, x2 - x1);

      for (let i = 0; i <= steps; i++) {
        const px = x1 + dx * i;
        const pz = z1 + dz * i;

        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(px, 0.7, pz);
        post.castShadow = true;
        this.scene.add(post);

        if (i < steps) {
          const midX = px + dx / 2;
          const midZ = pz + dz / 2;

          const r1 = new THREE.Mesh(railGeo, woodMat);
          r1.position.set(midX, 1.0, midZ);
          r1.rotation.y = -angle;
          r1.castShadow = true;
          this.scene.add(r1);

          const r2 = r1.clone();
          r2.position.y = 0.5;
          this.scene.add(r2);
        }
      }
    };

    // 4 lados da cerca delimitadora
    addFenceLine(bounds.minX, bounds.minZ, bounds.maxX, bounds.minZ);
    addFenceLine(bounds.maxX, bounds.minZ, bounds.maxX, bounds.maxZ);
    addFenceLine(bounds.maxX, bounds.maxZ, bounds.minX, bounds.maxZ);
    addFenceLine(bounds.minX, bounds.maxZ, bounds.minX, bounds.minZ);
  }

  private createPlayer(): void {
    const shepherdData = ModelBuilder.createShepherd();
    this.shepherdRoot = shepherdData.root;
    this.shepherdAnimateRun = shepherdData.animateRun;

    const p = this.state.player;
    this.shepherdRoot.position.set(p.x, p.y, p.z);
    this.scene.add(this.shepherdRoot);

    // Seta 3D flutuante de navegação (Bússola visual para a criança)
    this.guideArrow = ModelBuilder.createGuideArrow();
    this.guideArrow.position.set(p.x, 2.8, p.z);
    this.scene.add(this.guideArrow);

    // Posiciona a câmera inicial suavemente atrás do pastor
    const initCamX = p.x - Math.sin(p.rotation) * this.camDistance;
    const initCamZ = p.z - Math.cos(p.rotation) * this.camDistance;
    this.currentCamPos.set(initCamX, p.y + this.camHeight, initCamZ);
    this.currentCamLookAt.set(p.x, p.y + 1.2, p.z);
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentCamLookAt);
  }

  private createSheepEntities(): void {
    const collarColors = [
      0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6,
      0xec4899, 0x06b6d4, 0x84cc16, 0xf97316, 0x6366f1
    ];

    this.state.sheep.forEach((s, idx) => {
      const sheepMesh = ModelBuilder.createSheep();
      sheepMesh.position.set(s.x, s.y, s.z);
      sheepMesh.rotation.y = s.rotation;
      sheepMesh.scale.setScalar(1.05);

      // Coleira com sininho fofo colorido
      const collarGeo = new THREE.TorusGeometry(0.26, 0.035, 8, 16);
      const collarMat = new THREE.MeshStandardMaterial({
        color: collarColors[idx % collarColors.length],
        roughness: 0.4
      });
      const collar = new THREE.Mesh(collarGeo, collarMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, 0.52, 0.22);
      sheepMesh.add(collar);

      this.scene.add(sheepMesh);
      this.sheepMeshes.set(s.id, sheepMesh);
    });
  }

  private createStarEntities(): void {
    this.state.stars.forEach((star) => {
      const starMesh = ModelBuilder.createStar();
      starMesh.position.set(star.x, star.y, star.z);
      starMesh.scale.setScalar(1.2);
      this.scene.add(starMesh);
      this.starMeshes.set(star.id, starMesh);
    });
  }

  public startGame(): void {
    this.isGameActive = true;
    audioManager.startMusic();
    overlayUI.resetHud();
    overlayUI.updateSheepCount(0, this.state.tuning.totalSheep);
    overlayUI.updateStarCount(0);
    this.updateCompassUI();
  }

  public restartGame(): void {
    this.state = createInitialState();

    // Reseta posições visuais
    const p = this.state.player;
    this.shepherdRoot.position.set(p.x, p.y, p.z);
    this.shepherdRoot.rotation.y = 0;

    this.state.sheep.forEach((s) => {
      const mesh = this.sheepMeshes.get(s.id);
      if (mesh) {
        mesh.position.set(s.x, s.y, s.z);
        mesh.rotation.y = s.rotation;
        mesh.visible = true;
      }
    });

    this.state.stars.forEach((star) => {
      const mesh = this.starMeshes.get(star.id);
      if (mesh) {
        mesh.visible = true;
      }
    });

    this.startGame();
  }

  public start(): void {
    this.clock.start();
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      this.update();
      this.render();
    };
    animate();
  }

  public stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    audioManager.stopMusic();
  }

  private update(): void {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    // Rotação suave do sol e pulsação do beacon da fazenda
    if (this.sunMesh) this.sunMesh.rotation.z = elapsed * 0.12;
    if (this.corralDeliveryBeacon) {
      const beaconMat = this.corralDeliveryBeacon.material as THREE.MeshBasicMaterial;
      beaconMat.opacity = 0.5 + Math.sin(elapsed * 4) * 0.25;
      this.corralDeliveryBeacon.scale.setScalar(1 + Math.sin(elapsed * 3) * 0.05);
    }

    // Nuvens passeando lentamente pelo céu
    this.clouds.forEach((c) => {
      c.position.x += dt * 0.8;
      if (c.position.x > 55) c.position.x = -55;
    });

    if (!this.isGameActive) return;

    // 1. Processa input de movimento (Teclado e Stick Analógico Mobile)
    const moveInput = inputManager.getMoveVector();
    const jump = inputManager.consumeJump();

    if (jump) {
      audioManager.playJump();
    }

    // 2. Atualiza simulação pura via rules.ts
    updatePlayer(this.state, { ...moveInput, jump }, dt);
    updateSheep(this.state, dt);

    // 3. Verifica interações e eventos de gameplay
    const events = checkInteractions(this.state);
    this.handleInteractionEvents(events);

    // 4. Sincroniza malhas Three.js com o estado puro
    const p = this.state.player;
    this.shepherdRoot.position.set(p.x, p.y, p.z);
    this.shepherdRoot.rotation.y = p.rotation;

    // Animação de corrida do pastor
    const speed = p.isMoving ? 1.0 : 0.0;
    this.shepherdAnimateRun(p.stepCycle, speed);

    // Sincroniza ovelhas
    this.state.sheep.forEach((s) => {
      const mesh = this.sheepMeshes.get(s.id);
      if (mesh) {
        mesh.position.set(s.x, s.y, s.z);
        mesh.rotation.y = s.rotation;
      }
    });

    // Animação das estrelas (rotação)
    this.state.stars.forEach((star) => {
      const mesh = this.starMeshes.get(star.id);
      if (mesh) {
        mesh.visible = !star.collected;
        if (!star.collected) {
          mesh.rotation.y = elapsed * 2.2;
          mesh.position.y = 0.8 + Math.sin(elapsed * 3 + star.id) * 0.15;
        }
      }
    });

    // 5. Atualiza a Seta Guia 3D (Bússola visual para a criança)
    this.updateGuideArrow(elapsed);

    // 6. Atualiza câmera em 3ª pessoa suave
    this.updateCameraFollow(dt);
  }

  private handleInteractionEvents(events: InteractionEvent[]): void {
    events.forEach((ev) => {
      switch (ev.type) {
        case 'SHEEP_FOUND':
          audioManager.playDoubleJump();
          audioManager.speak('pula', `Você achou a ${ev.sheep.name}! Leve-a para a fazenda!`);
          overlayUI.showSheepFoundToast(ev.sheep.name);
          overlayUI.triggerSurpriseConfetti();
          this.updateCompassUI();
          break;

        case 'SHEEP_DELIVERED':
          audioManager.playSheepCollect(ev.totalRescued);
          // Voz neural natural com o número da ovelha salva!
          overlayUI.showNumberPopup(ev.totalRescued);
          overlayUI.updateSheepCount(ev.totalRescued, this.state.tuning.totalSheep);
          overlayUI.triggerSurpriseConfetti();
          this.updateCompassUI();
          break;

        case 'STAR_COLLECTED':
          audioManager.playStarCollect();
          overlayUI.updateStarCount(ev.totalStars);
          break;

        case 'ALL_SHEEP_RESCUED':
          this.isGameActive = false;
          audioManager.playVictory();
          audioManager.speak('parabens', 'Parabéns! Todas as ovelhinhas estão seguras na fazenda!');
          overlayUI.showVictoryScreen(ev.totalRescued, this.state.collectedStarsCount);
          break;
      }
    });
  }

  private updateGuideArrow(elapsed: number): void {
    const compass = getCompassTarget(this.state);
    const p = this.state.player;

    // Posiciona acima do pastor
    this.guideArrow.position.set(p.x, p.y + 2.5 + Math.sin(elapsed * 4) * 0.18, p.z);
    this.guideArrow.rotation.y = compass.angleToTarget;

    // Cor da seta: Dourada quando busca ovelha, Verde quando volta para a fazenda
    const arrowMat = (this.guideArrow.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;
    if (this.state.carriedSheepId !== null) {
      arrowMat.color.setHex(0x22c55e); // Verde para a fazenda!
      arrowMat.emissive.setHex(0x15803d);
    } else {
      arrowMat.color.setHex(0xfacc15); // Amarelo para a ovelha!
      arrowMat.emissive.setHex(0xca8a04);
    }
  }

  private updateCompassUI(): void {
    const compass = getCompassTarget(this.state);
    overlayUI.updateGuidePill(compass.guideText, compass.type);
  }

  private updateCameraFollow(dt: number): void {
    const p = this.state.player;

    // Câmera posicionada suavemente atrás e acima do pastor na direção em que ele olha
    const targetCamX = p.x - Math.sin(p.rotation) * this.camDistance;
    const targetCamZ = p.z - Math.cos(p.rotation) * this.camDistance;
    const targetCamY = p.y + this.camHeight;

    const smoothFactor = Math.min(1, dt * 5.0);
    this.currentCamPos.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), smoothFactor);

    const lookTarget = new THREE.Vector3(p.x, p.y + 1.2, p.z);
    this.currentCamLookAt.lerp(lookTarget, smoothFactor);

    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentCamLookAt);
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private setupWindowResize(): void {
    window.addEventListener('resize', () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }
}
