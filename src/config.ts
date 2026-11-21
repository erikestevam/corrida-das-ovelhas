export const GAME_CONFIG = {
  // Gameplay physics
  WORLD_GRAVITY: 850,
  RUN_SPEED: 250,
  TURBO_SPEED: 430,
  TURBO_DURATION_MS: 2500,
  JUMP_VELOCITY: -470,
  DOUBLE_JUMP_VELOCITY: -410,
  OBSTACLE_BOUNCE_VELOCITY: -330,
  COYOTE_TIME_MS: 160,
  JUMP_BUFFER_MS: 160,
  INVULNERABILITY_MS: 1000,
  TOTAL_SHEEP_GOAL: 10,
  INACTIVITY_HINT_TIME_MS: 4500,

  // Virtual Game Resolution (scaled via Phaser Scale Manager)
  BASE_WIDTH: 960,
  BASE_HEIGHT: 540,

  // Colors
  COLORS: {
    SKY_TOP: 0x60a5fa,
    SKY_BOTTOM: 0xbae6fd,
    GRASS_LIGHT: 0x4ade80,
    GRASS_DARK: 0x22c55e,
    DIRT: 0x854d0e,
    RAINBOW: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']
  },

  // Spoken voice lines
  VOICE_LINES: {
    START: 'Vamos correr com o Bom Pastor!',
    COUNTDOWN_3: 'Três!',
    COUNTDOWN_2: 'Dois!',
    COUNTDOWN_1: 'Um!',
    COUNTDOWN_GO: 'JÁ! Corre, ovelhinha!',
    JUMP: 'Pula!',
    TURBO: 'Super Turbo! Vrum!',
    SURPRISE: 'Olha a surpresa!',
    OBSTACLE: 'Ops! Pulinho!',
    INACTIVITY_HINT: 'Toca na tela para pular!',
    VICTORY: 'Parabéns! Você resgatou todas as ovelhinhas! O Bom Pastor está muito feliz com você!',
    NUMBERS: [
      'Uma ovelhinha!',
      'Duas ovelhinhas!',
      'Três ovelhinhas!',
      'Quatro ovelhinhas!',
      'Cinco ovelhinhas! Muito bem!',
      'Seis ovelhinhas!',
      'Sete ovelhinhas!',
      'Oito ovelhinhas!',
      'Nove ovelhinhas! Só falta uma!',
      'Dez ovelhinhas! Você conseguiu todas!'
    ]
  }
};
