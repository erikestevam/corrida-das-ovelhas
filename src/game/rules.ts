/**
 * O Bom Pastor: Regras do Jogo e Estado Puro (Open World)
 * Arquitetura baseada em boas práticas do Claude Code Game Studios:
 * Lógica pura em TypeScript desacoplada do motor gráfico, testável via Vitest.
 */

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface SheepData {
  id: number;
  name: string;
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetZ: number;
  state: 'wild' | 'following' | 'rescued';
  rotation: number;
  hopTimer: number;
  colorName?: string;
}

export interface StarData {
  id: number;
  x: number;
  y: number;
  z: number;
  collected: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  z: number;
  rotation: number;
  isMoving: boolean;
  isJumping: boolean;
  jumpVelocity: number;
  stepCycle: number;
}

export interface FarmCorral {
  x: number;
  z: number;
  radius: number;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface WorldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface TuningConfig {
  worldBounds: WorldBounds;
  playerSpeed: number;
  sheepFollowSpeed: number;
  sheepPickupDistance: number;
  farmDeliveryDistance: number;
  totalSheep: number;
  farm: FarmCorral;
  gravity: number;
  jumpForce: number;
}

export interface GameState {
  time: number;
  player: PlayerState;
  sheep: SheepData[];
  stars: StarData[];
  carriedSheepId: number | null; // Apenas 1 ovelhinha por vez deve ser levada à fazenda!
  rescuedCount: number;
  collectedStarsCount: number;
  isComplete: boolean;
  tuning: TuningConfig;
}

export interface MoveInput {
  dx: number; // -1 to 1 (left to right)
  dz: number; // -1 to 1 (forward/backward)
  jump?: boolean;
}

export type InteractionEvent =
  | { type: 'SHEEP_FOUND'; sheep: SheepData }
  | { type: 'SHEEP_DELIVERED'; sheep: SheepData; totalRescued: number }
  | { type: 'STAR_COLLECTED'; star: StarData; totalStars: number }
  | { type: 'ALL_SHEEP_RESCUED'; totalRescued: number };

export const DEFAULT_TUNING: TuningConfig = {
  worldBounds: { minX: -55, maxX: 55, minZ: -55, maxZ: 55 },
  playerSpeed: 11.5,
  sheepFollowSpeed: 10.5,
  sheepPickupDistance: 2.8,
  farmDeliveryDistance: 6.0,
  totalSheep: 10,
  farm: {
    x: 0,
    z: -32,
    radius: 7.0,
    minX: -8,
    maxX: 8,
    minZ: -40,
    maxZ: -24
  },
  gravity: 28,
  jumpForce: 10.5
};

/**
 * Cria um gerador de números aleatórios com semente (Mulberry32) para reprodutibilidade.
 */
export function makeRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), s | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Inicializa o estado completo do jogo em mundo aberto.
 */
export function createInitialState(customTuning?: Partial<TuningConfig>, seed = 42): GameState {
  const tuning: TuningConfig = { ...DEFAULT_TUNING, ...customTuning };
  const rng = makeRng(seed);

  // O pastor parte da entrada da fazenda
  const player: PlayerState = {
    x: tuning.farm.x,
    y: 0,
    z: tuning.farm.z + tuning.farm.radius + 1.5, // Na frente do portão
    rotation: 0,
    isMoving: false,
    isJumping: false,
    jumpVelocity: 0,
    stepCycle: 0
  };

  // Posiciona 10 ovelhinhas espalhadas pelas colinas e pradarias fora da fazenda
  const sheepNames = [
    'Branquinha', 'Fofinha', 'Pompom', 'Estrelinha', 'Pipoca',
    'Florzinha', 'Nuvem', 'Bebê', 'Douradinha', 'Alegria'
  ];

  // Regiões de espalhamento com coordenadas agradáveis ao redor do vale
  const spawnPoints: [number, number][] = [
    [-22, -10], [22, -12], [-35, 15], [35, 12],
    [-15, 30],  [18, 32],  [-40, -25], [42, -22],
    [-5, 42],   [28, 40]
  ];

  const sheep: SheepData[] = [];
  for (let i = 0; i < tuning.totalSheep; i++) {
    const basePt = spawnPoints[i % spawnPoints.length];
    const jitterX = (rng() - 0.5) * 6;
    const jitterZ = (rng() - 0.5) * 6;
    const sx = Math.min(tuning.worldBounds.maxX - 4, Math.max(tuning.worldBounds.minX + 4, basePt[0] + jitterX));
    const sz = Math.min(tuning.worldBounds.maxZ - 4, Math.max(tuning.worldBounds.minZ + 4, basePt[1] + jitterZ));

    sheep.push({
      id: i + 1,
      name: sheepNames[i % sheepNames.length],
      x: sx,
      y: 0,
      z: sz,
      targetX: sx,
      targetZ: sz,
      state: 'wild',
      rotation: rng() * Math.PI * 2,
      hopTimer: rng() * 2
    });
  }

  // Gera estrelinhas colecionáveis pela trilha
  const stars: StarData[] = [];
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const dist = 14 + rng() * 32;
    const starX = Math.cos(angle) * dist;
    const starZ = Math.sin(angle) * dist;
    stars.push({
      id: i + 1,
      x: Math.min(tuning.worldBounds.maxX - 3, Math.max(tuning.worldBounds.minX + 3, starX)),
      y: 0.8,
      z: Math.min(tuning.worldBounds.maxZ - 3, Math.max(tuning.worldBounds.minZ + 3, starZ)),
      collected: false
    });
  }

  return {
    time: 0,
    player,
    sheep,
    stars,
    carriedSheepId: null,
    rescuedCount: 0,
    collectedStarsCount: 0,
    isComplete: false,
    tuning
  };
}

/**
 * Atualiza o movimento do jogador através do input (teclado ou joystick analógico mobile).
 */
export function updatePlayer(state: GameState, input: MoveInput, dt: number): void {
  const p = state.player;
  const tuning = state.tuning;

  // Normaliza o vetor de movimento se exceder magnitude 1
  let len = Math.hypot(input.dx, input.dz);
  let dirX = 0;
  let dirZ = 0;

  if (len > 0.05) {
    p.isMoving = true;
    if (len > 1.0) {
      dirX = input.dx / len;
      dirZ = input.dz / len;
    } else {
      dirX = input.dx;
      dirZ = input.dz;
    }

    // Calcula rotação voltada para a direção de movimento
    const targetAngle = Math.atan2(dirX, dirZ);
    // Interpolação suave de ângulo
    let angleDiff = targetAngle - p.rotation;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    p.rotation += angleDiff * Math.min(1, dt * 14);

    // Atualiza posição do jogador
    p.x += dirX * tuning.playerSpeed * dt;
    p.z += dirZ * tuning.playerSpeed * dt;

    p.stepCycle += dt * 10;
  } else {
    p.isMoving = false;
  }

  // Pulo do jogador
  if (input.jump && !p.isJumping) {
    p.isJumping = true;
    p.jumpVelocity = tuning.jumpForce;
  }

  if (p.isJumping) {
    p.y += p.jumpVelocity * dt;
    p.jumpVelocity -= tuning.gravity * dt;
    if (p.y <= 0) {
      p.y = 0;
      p.isJumping = false;
      p.jumpVelocity = 0;
    }
  }

  // Clampa jogador dentro dos limites do mundo aberto
  p.x = Math.max(tuning.worldBounds.minX + 1.5, Math.min(tuning.worldBounds.maxX - 1.5, p.x));
  p.z = Math.max(tuning.worldBounds.minZ + 1.5, Math.min(tuning.worldBounds.maxZ - 1.5, p.z));
}

/**
 * Atualiza o comportamento das ovelhinhas:
 * - 'wild': pastando e saltitando suavemente
 * - 'following': seguindo o pastor com pulinhos alegres
 * - 'rescued': comemorando dentro do cercadinho da fazenda
 */
export function updateSheep(state: GameState, dt: number): void {
  const p = state.player;
  const tuning = state.tuning;

  for (const s of state.sheep) {
    s.hopTimer += dt;

    if (s.state === 'following') {
      // Segue o pastor mantendo uma distância aconchegante atrás dele
      const followOffsetDistance = 1.8;
      const followAngle = p.rotation + Math.PI; // Atrás do pastor
      const desiredX = p.x + Math.sin(followAngle) * followOffsetDistance;
      const desiredZ = p.z + Math.cos(followAngle) * followOffsetDistance;

      const toDesiredX = desiredX - s.x;
      const toDesiredZ = desiredZ - s.z;
      const distToDesired = Math.hypot(toDesiredX, toDesiredZ);

      if (distToDesired > 0.1) {
        const moveDist = Math.min(distToDesired, tuning.sheepFollowSpeed * dt);
        s.x += (toDesiredX / distToDesired) * moveDist;
        s.z += (toDesiredZ / distToDesired) * moveDist;
        s.rotation = Math.atan2(toDesiredX, toDesiredZ);
      }

      // Pulinho animado de felicidade ao seguir
      s.y = Math.abs(Math.sin(s.hopTimer * 8)) * 0.45;
    } else if (s.state === 'wild') {
      // Pastando livremente com pequenos pulos ocasionais
      s.y = Math.max(0, Math.sin(s.hopTimer * 2) * 0.15);

      // Anda devagar para um ponto próximo a cada poucos segundos
      const distToTarget = Math.hypot(s.targetX - s.x, s.targetZ - s.z);
      if (distToTarget > 0.2) {
        s.x += ((s.targetX - s.x) / distToTarget) * 1.5 * dt;
        s.z += ((s.targetZ - s.z) / distToTarget) * 1.5 * dt;
        s.rotation = Math.atan2(s.targetX - s.x, s.targetZ - s.z);
      }
    } else if (s.state === 'rescued') {
      // Salva dentro da fazenda: passeia e pula feliz dentro do cercadinho
      s.y = Math.abs(Math.sin(s.hopTimer * 4)) * 0.25;

      const distToTarget = Math.hypot(s.targetX - s.x, s.targetZ - s.z);
      if (distToTarget > 0.2) {
        s.x += ((s.targetX - s.x) / distToTarget) * 1.2 * dt;
        s.z += ((s.targetZ - s.z) / distToTarget) * 1.2 * dt;
        s.rotation = Math.atan2(s.targetX - s.x, s.targetZ - s.z);
      }
    }
  }
}

/**
 * Verifica colisões e interações:
 * 1. Encontrar ovelhinha perdida (passa a seguir o pastor).
 *    *Regra solicitada pelo usuário*: Cada ovelha que ele pegar deve voltar na fazenda para soltá-la e pegar outras depois.
 * 2. Entregar a ovelhinha na fazenda (solta dentro do cercadinho).
 * 3. Coleta de estrelinhas pela paisagem.
 */
export function checkInteractions(state: GameState): InteractionEvent[] {
  const events: InteractionEvent[] = [];
  const p = state.player;
  const tuning = state.tuning;

  // 1. Ovelhinha perdida: se não estiver carregando nenhuma ovelha atualmente
  if (state.carriedSheepId === null) {
    for (const s of state.sheep) {
      if (s.state === 'wild') {
        const dist = Math.hypot(p.x - s.x, p.z - s.z);
        if (dist <= tuning.sheepPickupDistance) {
          s.state = 'following';
          state.carriedSheepId = s.id;
          events.push({ type: 'SHEEP_FOUND', sheep: s });
          break; // Pega no máximo uma ovelhinha por vez
        }
      }
    }
  }

  // 2. Entregar a ovelhinha na fazenda
  if (state.carriedSheepId !== null) {
    const distToFarm = Math.hypot(p.x - tuning.farm.x, p.z - tuning.farm.z);
    if (distToFarm <= tuning.farmDeliveryDistance) {
      const deliveredSheep = state.sheep.find(s => s.id === state.carriedSheepId);
      if (deliveredSheep) {
        deliveredSheep.state = 'rescued';
        // Posiciona a ovelha dentro do cercadinho da fazenda em um ponto acolhedor
        const offsetAngle = (state.rescuedCount / tuning.totalSheep) * Math.PI * 2;
        const corralDist = 1.8 + (state.rescuedCount % 3) * 1.2;
        deliveredSheep.x = tuning.farm.x + Math.cos(offsetAngle) * corralDist;
        deliveredSheep.z = tuning.farm.z + Math.sin(offsetAngle) * corralDist;
        deliveredSheep.targetX = deliveredSheep.x;
        deliveredSheep.targetZ = deliveredSheep.z;

        state.carriedSheepId = null;
        state.rescuedCount += 1;

        events.push({
          type: 'SHEEP_DELIVERED',
          sheep: deliveredSheep,
          totalRescued: state.rescuedCount
        });

        if (state.rescuedCount >= tuning.totalSheep) {
          state.isComplete = true;
          events.push({
            type: 'ALL_SHEEP_RESCUED',
            totalRescued: state.rescuedCount
          });
        }
      }
    }
  }

  // 3. Coleta de estrelas
  for (const star of state.stars) {
    if (!star.collected) {
      const dist = Math.hypot(p.x - star.x, p.z - star.z);
      if (dist <= 2.0) {
        star.collected = true;
        state.collectedStarsCount += 1;
        events.push({
          type: 'STAR_COLLECTED',
          star,
          totalStars: state.collectedStarsCount
        });
      }
    }
  }

  return events;
}

/**
 * Bússola e guia direcional com "Zero Frustração":
 * Calcula para onde a seta/guia deve apontar para guiar uma criança pequena:
 * - Se estiver com uma ovelhinha: aponta para a Fazenda ("Leve a ovelhinha para casa! 🏡")
 * - Se estiver sem ovelhinha: aponta para a ovelhinha perdida mais próxima ("Encontre a ovelhinha! 🐑")
 * - Se terminou todas: aponta para a Fazenda celebrando ("Todas as ovelhas salvas! 🎉")
 */
export function getCompassTarget(state: GameState): {
  targetX: number;
  targetZ: number;
  type: 'farm' | 'sheep' | 'done';
  distance: number;
  angleToTarget: number;
  guideText: string;
} {
  const p = state.player;
  const tuning = state.tuning;

  if (state.carriedSheepId !== null) {
    // Aponta para a fazenda
    const dx = tuning.farm.x - p.x;
    const dz = tuning.farm.z - p.z;
    const distance = Math.round(Math.hypot(dx, dz));
    const angleToTarget = Math.atan2(dx, dz);

    return {
      targetX: tuning.farm.x,
      targetZ: tuning.farm.z,
      type: 'farm',
      distance,
      angleToTarget,
      guideText: `🏡 Leve a ovelhinha para a Fazenda! (${distance}m)`
    };
  }

  if (state.isComplete) {
    const dx = tuning.farm.x - p.x;
    const dz = tuning.farm.z - p.z;
    return {
      targetX: tuning.farm.x,
      targetZ: tuning.farm.z,
      type: 'done',
      distance: Math.round(Math.hypot(dx, dz)),
      angleToTarget: Math.atan2(dx, dz),
      guideText: '🎉 Todas as ovelhinhas estão seguras na fazenda!'
    };
  }

  // Encontra a ovelhinha perdida mais próxima
  let nearestSheep: SheepData | null = null;
  let nearestDist = Infinity;

  for (const s of state.sheep) {
    if (s.state === 'wild') {
      const d = Math.hypot(s.x - p.x, s.z - p.z);
      if (d < nearestDist) {
        nearestDist = d;
        nearestSheep = s;
      }
    }
  }

  if (nearestSheep) {
    const dx = nearestSheep.x - p.x;
    const dz = nearestSheep.z - p.z;
    const distance = Math.round(nearestDist);
    const angleToTarget = Math.atan2(dx, dz);

    return {
      targetX: nearestSheep.x,
      targetZ: nearestSheep.z,
      type: 'sheep',
      distance,
      angleToTarget,
      guideText: `🐑 Encontre a ovelhinha ${nearestSheep.name}! (${distance}m)`
    };
  }

  return {
    targetX: tuning.farm.x,
    targetZ: tuning.farm.z,
    type: 'farm',
    distance: 0,
    angleToTarget: 0,
    guideText: '🏡 Volte para a Fazenda!'
  };
}
