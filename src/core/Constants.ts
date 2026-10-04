export const CONSTANTS = {
  // 物理與運動學
  INITIAL_HORIZONTAL_SPEED: 420,
  MAX_HORIZONTAL_SPEED: 960,
  SPEED_GROWTH_TAU: 25.0,

  GRAVITY_ACCEL: 2600,
  TERMINAL_VELOCITY: 1200,
  FLIP_IMPULSE: 400,

  COYOTE_TIME: 0.10,
  INPUT_BUFFER_TIME: 0.12,
  FLIP_COOLDOWN: 0.14,

  // 跑道與角色幾何尺寸（虛擬邏輯解析度參考基準 1280x720）
  BASE_WIDTH: 1280,
  BASE_HEIGHT: 720,
  TRACK_HEIGHT: 440, // 上下導軌淨空高度
  TRACK_THICKNESS: 12,
  PLAYER_SIZE: 32,
  HITBOX_INSET: 4, // 實際碰撞盒 24x24
  NEAR_MISS_RADIUS: 26,

  // 分數與 Combo
  SHARD_POINTS: 250,
  NEAR_MISS_POINTS: 500,
  COMBO_MAX: 100,
  COMBO_DECAY_RATE: 40, // 每秒衰退百分比
  COMBO_SHARD_ADD: 25,
  COMBO_NEAR_MISS_ADD: 40,

  // 霓虹色彩定義
  COLORS: {
    BG_DARK: '#080312',
    BG_GRADIENT: '#120722',
    CYAN: '#00f3ff',
    MAGENTA: '#ff007f',
    GOLD: '#ffe600',
    GREEN: '#00ff66',
    RED: '#ff1744',
    ORANGE: '#ff9100',
    WHITE: '#ffffff',
    GRID_LINE: 'rgba(0, 243, 255, 0.12)',
    TRACK_CYAN: 'rgba(0, 243, 255, 0.85)',
    TRACK_MAGENTA: 'rgba(255, 0, 127, 0.85)',
  },

  STORAGE_KEY: 'neon-flip:save:v1',
};
