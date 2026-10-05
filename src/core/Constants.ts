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

  // 幽靈稜鏡護盾
  SHIELD_INVULNERABLE_TIME: 0.8, // 抵擋後的無敵免疫幀時間
  SHIELD_PRISM_POINTS: 800,

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
    PURPLE: '#bf00ff',
    WHITE: '#ffffff',
    GRID_LINE: 'rgba(0, 243, 255, 0.12)',
    TRACK_CYAN: 'rgba(0, 243, 255, 0.85)',
    TRACK_MAGENTA: 'rgba(255, 0, 127, 0.85)',
  },

  // 三大主題區域設定
  ZONES: {
    CYBER_STRIP: {
      id: 'CYBER_STRIP',
      name: 'Cyber Strip',
      subtitle: 'CLASSIC HIGHWAY',
      gravityScale: 1.0,
      primaryColor: '#00f3ff',
      secondaryColor: '#ff007f',
      gridColor: 'rgba(0, 243, 255, 0.14)',
      switchDistance: 2200,
    },
    NEON_SPIRE: {
      id: 'NEON_SPIRE',
      name: 'Neon Spire',
      subtitle: 'VERTICAL LASER GAUNTLET',
      gravityScale: 1.05,
      primaryColor: '#ff007f',
      secondaryColor: '#ff9100',
      gridColor: 'rgba(255, 0, 127, 0.15)',
      switchDistance: 2400,
    },
    QUANTUM_VOID: {
      id: 'QUANTUM_VOID',
      name: 'Quantum Void',
      subtitle: 'LOW-GRAVITY DRIFT',
      gravityScale: 0.46, // 量子浮空低重力區間
      primaryColor: '#bf00ff',
      secondaryColor: '#00f3ff',
      gridColor: 'rgba(191, 0, 255, 0.16)',
      switchDistance: 2400,
    },
  },

  STORAGE_KEY: 'neon-flip:save:v1',
};

/**
 * 依據當前移速計算動態光暈色澤（由冰藍 185deg 平滑過渡至烈焰紫粉 320deg）
 */
export function getSpeedColor(speed: number): { hex: string; glow: string; factor: number } {
  const minV = CONSTANTS.INITIAL_HORIZONTAL_SPEED;
  const maxV = CONSTANTS.MAX_HORIZONTAL_SPEED;
  const factor = Math.max(0, Math.min(1, (speed - minV) / (maxV - minV)));

  // HSL 插值：185 -> 325 (跨過紫色至紫粉色)
  const hue = 185 + factor * 140;
  const hex = `hsl(${Math.round(hue)}, 100%, 55%)`;
  const glow = `hsl(${Math.round(hue)}, 100%, 65%)`;

  return { hex, glow, factor };
}

