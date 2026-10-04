import { ChunkDef } from '../types';

export const CHUNK_DEFINITIONS: ChunkDef[] = [
  // 1. 新手起跑直道
  {
    id: 'CHUNK_01_INTRO',
    name: 'Neon Runway',
    length: 1000,
    minSpeed: 400,
    entryGravity: 'ANY',
    exitGravity: 'DOWN',
    obstacles: [],
    shards: [
      { x: 300, y: 390 },
      { x: 450, y: 390 },
      { x: 600, y: 390 },
      { x: 750, y: 390 },
    ],
  },

  // 2. 基礎交錯反轉
  {
    id: 'CHUNK_02_ALTERNATING_FLIP',
    name: 'Alternating Flip',
    length: 1200,
    minSpeed: 400,
    entryGravity: 'DOWN',
    exitGravity: 'DOWN',
    obstacles: [
      { type: 'SPIKE_BOTTOM', x: 350, y: 396, width: 44, height: 44 },
      { type: 'SPIKE_TOP', x: 800, y: 0, width: 44, height: 44 },
    ],
    shards: [
      { x: 200, y: 390 },
      { x: 550, y: 50 },
      { x: 650, y: 50 },
      { x: 1050, y: 390 },
    ],
  },

  // 3. 地表障礙，強制反轉至天花板並維持
  {
    id: 'CHUNK_03_CEILING_SWAP',
    name: 'Ceiling Swap',
    length: 1100,
    minSpeed: 450,
    entryGravity: 'DOWN',
    exitGravity: 'UP',
    obstacles: [
      { type: 'SPIKE_BOTTOM', x: 350, y: 396, width: 48, height: 44 },
      { type: 'SPIKE_BOTTOM', x: 520, y: 396, width: 48, height: 44 },
    ],
    shards: [
      { x: 400, y: 50 },
      { x: 550, y: 50 },
      { x: 750, y: 50 },
      { x: 900, y: 50 },
    ],
  },

  // 4. 天花板障礙，強制反轉至地表並維持
  {
    id: 'CHUNK_04_GROUND_SWAP',
    name: 'Ground Swap',
    length: 1100,
    minSpeed: 450,
    entryGravity: 'UP',
    exitGravity: 'DOWN',
    obstacles: [
      { type: 'SPIKE_TOP', x: 350, y: 0, width: 48, height: 44 },
      { type: 'SPIKE_TOP', x: 520, y: 0, width: 48, height: 44 },
    ],
    shards: [
      { x: 400, y: 390 },
      { x: 550, y: 390 },
      { x: 750, y: 390 },
      { x: 900, y: 390 },
    ],
  },

  // 5. 脈衝雷射閘門（附帶提示線）
  {
    id: 'CHUNK_05_LASER_PULSE',
    name: 'Laser Pulse',
    length: 1300,
    minSpeed: 520,
    entryGravity: 'ANY',
    exitGravity: 'DOWN',
    obstacles: [
      { type: 'LASER_GATE', x: 600, y: 0, width: 24, height: 440, period: 1.1 },
      { type: 'SPIKE_TOP', x: 950, y: 0, width: 44, height: 44 },
    ],
    shards: [
      { x: 300, y: 390 },
      { x: 450, y: 390 },
      { x: 800, y: 390 },
      { x: 1150, y: 390 },
    ],
  },

  // 6. 浮空踏板二段反轉
  {
    id: 'CHUNK_06_FLOATING_ISLAND',
    name: 'Floating Island',
    length: 1400,
    minSpeed: 560,
    entryGravity: 'DOWN',
    exitGravity: 'UP',
    obstacles: [
      { type: 'SPIKE_BOTTOM', x: 320, y: 396, width: 48, height: 44 },
      { type: 'FLOATING_PAD', x: 580, y: 210, width: 180, height: 20 },
      { type: 'SPIKE_BOTTOM', x: 900, y: 396, width: 48, height: 44 },
    ],
    shards: [
      { x: 200, y: 390 },
      { x: 670, y: 170 },
      { x: 1100, y: 50 },
      { x: 1250, y: 50 },
    ],
  },

  // 7. 高速雙尖刺律動
  {
    id: 'CHUNK_07_DOUBLE_RHYTHM',
    name: 'Double Rhythm',
    length: 1500,
    minSpeed: 620,
    entryGravity: 'UP',
    exitGravity: 'UP',
    obstacles: [
      { type: 'SPIKE_TOP', x: 300, y: 0, width: 44, height: 44 },
      { type: 'SPIKE_BOTTOM', x: 750, y: 396, width: 48, height: 44 },
      { type: 'SPIKE_BOTTOM', x: 920, y: 396, width: 48, height: 44 },
      { type: 'SPIKE_TOP', x: 1250, y: 0, width: 44, height: 44 },
    ],
    shards: [
      { x: 180, y: 50 },
      { x: 500, y: 390 },
      { x: 1050, y: 50 },
    ],
  },

  // 8. 擦彈刷分狂飆區 (Hyper Slalom)
  {
    id: 'CHUNK_08_HYPER_SLALOM',
    name: 'Hyper Slalom',
    length: 1600,
    minSpeed: 700,
    entryGravity: 'ANY',
    exitGravity: 'DOWN',
    obstacles: [
      { type: 'SPIKE_BOTTOM', x: 400, y: 396, width: 40, height: 44 },
      { type: 'SPIKE_TOP', x: 700, y: 0, width: 40, height: 44 },
      { type: 'SPIKE_BOTTOM', x: 1000, y: 396, width: 40, height: 44 },
      { type: 'SPIKE_TOP', x: 1300, y: 0, width: 40, height: 44 },
    ],
    shards: [
      { x: 300, y: 390 },
      { x: 550, y: 220 },
      { x: 850, y: 220 },
      { x: 1150, y: 220 },
      { x: 1450, y: 390 },
    ],
  },
];
