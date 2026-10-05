import { ChunkDef } from '../types';

export const CHUNK_DEFINITIONS: ChunkDef[] = [
  // ==========================================
  // ZONE 1: CYBER STRIP（經典高速賽博賽道）
  // ==========================================
  {
    id: 'CS_01_INTRO',
    name: 'Cyber Runway',
    length: 1000,
    minSpeed: 400,
    entryGravity: 'ANY',
    exitGravity: 'DOWN',
    zone: 'CYBER_STRIP',
    obstacles: [],
    shards: [
      { x: 300, y: 390 },
      { x: 450, y: 390 },
      { x: 600, y: 390 },
      { x: 750, y: 390 },
      { x: 900, y: 220, isShieldPrism: true }, // 開局前瞻護盾
    ],
  },
  {
    id: 'CS_02_ALTERNATING',
    name: 'Alternating Flip',
    length: 1200,
    minSpeed: 400,
    entryGravity: 'DOWN',
    exitGravity: 'DOWN',
    zone: 'CYBER_STRIP',
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
  {
    id: 'CS_03_CEILING_SWAP',
    name: 'Ceiling Transit',
    length: 1100,
    minSpeed: 440,
    entryGravity: 'DOWN',
    exitGravity: 'UP',
    zone: 'CYBER_STRIP',
    obstacles: [
      { type: 'SPIKE_BOTTOM', x: 350, y: 396, width: 48, height: 44 },
      { type: 'SPIKE_BOTTOM', x: 540, y: 396, width: 48, height: 44 },
    ],
    shards: [
      { x: 400, y: 50 },
      { x: 550, y: 50 },
      { x: 750, y: 50 },
      { x: 900, y: 50 },
    ],
  },
  {
    id: 'CS_04_GROUND_SWAP',
    name: 'Ground Transit',
    length: 1100,
    minSpeed: 440,
    entryGravity: 'UP',
    exitGravity: 'DOWN',
    zone: 'CYBER_STRIP',
    obstacles: [
      { type: 'SPIKE_TOP', x: 350, y: 0, width: 48, height: 44 },
      { type: 'SPIKE_TOP', x: 540, y: 0, width: 48, height: 44 },
    ],
    shards: [
      { x: 400, y: 390 },
      { x: 550, y: 390 },
      { x: 750, y: 390 },
      { x: 900, y: 390 },
    ],
  },
  {
    id: 'CS_05_HYPER_SLALOM',
    name: 'Hyper Slalom',
    length: 1500,
    minSpeed: 600,
    entryGravity: 'ANY',
    exitGravity: 'DOWN',
    zone: 'CYBER_STRIP',
    obstacles: [
      { type: 'SPIKE_BOTTOM', x: 380, y: 396, width: 42, height: 44 },
      { type: 'SPIKE_TOP', x: 680, y: 0, width: 42, height: 44 },
      { type: 'SPIKE_BOTTOM', x: 980, y: 396, width: 42, height: 44 },
      { type: 'SPIKE_TOP', x: 1280, y: 0, width: 42, height: 44 },
    ],
    shards: [
      { x: 300, y: 390 },
      { x: 530, y: 220 },
      { x: 830, y: 220 },
      { x: 1130, y: 220 },
      { x: 1400, y: 390 },
    ],
  },

  // ==========================================
  // ZONE 2: NEON SPIRE（尖塔垂直雷射風暴）
  // ==========================================
  {
    id: 'NS_01_OSCILLATING_PILLARS',
    name: 'Oscillating Pillars',
    length: 1300,
    minSpeed: 460,
    entryGravity: 'ANY',
    exitGravity: 'DOWN',
    zone: 'NEON_SPIRE',
    obstacles: [
      // 動態上下往復伸縮的垂直雷射光柱
      {
        type: 'OSCILLATING_LASER',
        x: 450,
        y: 100,
        width: 24,
        height: 240,
        oscillateRange: 75,
        oscillateSpeed: 2.8,
      },
      {
        type: 'OSCILLATING_LASER',
        x: 850,
        y: 100,
        width: 24,
        height: 240,
        oscillateRange: -75,
        oscillateSpeed: 2.8,
      },
    ],
    shards: [
      { x: 300, y: 390 },
      { x: 650, y: 50 },
      { x: 1100, y: 390 },
      { x: 1220, y: 220, isShieldPrism: true },
    ],
  },
  {
    id: 'NS_02_VERTICAL_SPIRES',
    name: 'Vertical Spires',
    length: 1400,
    minSpeed: 520,
    entryGravity: 'DOWN',
    exitGravity: 'UP',
    zone: 'NEON_SPIRE',
    obstacles: [
      { type: 'SPIKE_BOTTOM', x: 320, y: 396, width: 50, height: 44 },
      {
        type: 'OSCILLATING_LASER',
        x: 620,
        y: 110,
        width: 24,
        height: 220,
        oscillateRange: 80,
        oscillateSpeed: 3.2,
      },
      { type: 'SPIKE_BOTTOM', x: 920, y: 396, width: 50, height: 44 },
      { type: 'SPIKE_TOP', x: 1200, y: 0, width: 50, height: 44 },
    ],
    shards: [
      { x: 200, y: 390 },
      { x: 480, y: 60 },
      { x: 770, y: 60 },
      { x: 1060, y: 60 },
    ],
  },
  {
    id: 'NS_03_LASER_GAUNTLET',
    name: 'Laser Gauntlet',
    length: 1500,
    minSpeed: 580,
    entryGravity: 'UP',
    exitGravity: 'DOWN',
    zone: 'NEON_SPIRE',
    obstacles: [
      { type: 'LASER_GATE', x: 400, y: 0, width: 24, height: 440, period: 1.0 },
      {
        type: 'OSCILLATING_LASER',
        x: 820,
        y: 120,
        width: 26,
        height: 200,
        oscillateRange: 90,
        oscillateSpeed: 3.5,
      },
      { type: 'SPIKE_TOP', x: 1150, y: 0, width: 46, height: 44 },
    ],
    shards: [
      { x: 280, y: 60 },
      { x: 620, y: 390 },
      { x: 1000, y: 390 },
      { x: 1350, y: 390 },
    ],
  },

  // ==========================================
  // ZONE 3: QUANTUM VOID（微引力浮空漂移）
  // ==========================================
  {
    id: 'QV_01_ZERO_G_CORRIDOR',
    name: 'Zero-G Corridor',
    length: 1400,
    minSpeed: 480,
    entryGravity: 'ANY',
    exitGravity: 'UP',
    zone: 'QUANTUM_VOID',
    obstacles: [
      { type: 'FLOATING_PAD', x: 420, y: 210, width: 160, height: 20 },
      { type: 'SPIKE_BOTTOM', x: 780, y: 396, width: 52, height: 44 },
      { type: 'FLOATING_PAD', x: 1050, y: 210, width: 160, height: 20 },
    ],
    shards: [
      { x: 260, y: 390 },
      { x: 500, y: 160 },
      { x: 780, y: 50 },
      { x: 1130, y: 160 },
      { x: 1300, y: 50, isShieldPrism: true },
    ],
  },
  {
    id: 'QV_02_QUANTUM_LEAP',
    name: 'Quantum Leap',
    length: 1600,
    minSpeed: 550,
    entryGravity: 'UP',
    exitGravity: 'DOWN',
    zone: 'QUANTUM_VOID',
    obstacles: [
      { type: 'SPIKE_TOP', x: 350, y: 0, width: 52, height: 44 },
      { type: 'SPIKE_BOTTOM', x: 700, y: 396, width: 52, height: 44 },
      {
        type: 'OSCILLATING_LASER',
        x: 1050,
        y: 120,
        width: 24,
        height: 200,
        oscillateRange: 60,
        oscillateSpeed: 2.2,
      },
      { type: 'SPIKE_TOP', x: 1380, y: 0, width: 52, height: 44 },
    ],
    shards: [
      { x: 200, y: 60 },
      { x: 520, y: 220 },
      { x: 880, y: 220 },
      { x: 1220, y: 390 },
      { x: 1500, y: 390 },
    ],
  },
  {
    id: 'QV_03_FLOAT_ISLANDS',
    name: 'Float Islands',
    length: 1600,
    minSpeed: 620,
    entryGravity: 'DOWN',
    exitGravity: 'DOWN',
    zone: 'QUANTUM_VOID',
    obstacles: [
      { type: 'SPIKE_BOTTOM', x: 300, y: 396, width: 48, height: 44 },
      { type: 'FLOATING_PAD', x: 550, y: 210, width: 200, height: 20 },
      { type: 'SPIKE_TOP', x: 900, y: 0, width: 48, height: 44 },
      { type: 'SPIKE_BOTTOM', x: 1250, y: 396, width: 48, height: 44 },
    ],
    shards: [
      { x: 200, y: 390 },
      { x: 650, y: 160 },
      { x: 1050, y: 220 },
      { x: 1450, y: 390 },
    ],
  },
];

