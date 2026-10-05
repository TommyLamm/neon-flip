export type GameState = 'TITLE' | 'COUNTDOWN' | 'PLAYING' | 'GAME_OVER';

export type GravityState = 'DOWN' | 'UP' | 'ANY';

export type ZoneType = 'CYBER_STRIP' | 'NEON_SPIRE' | 'QUANTUM_VOID';

export type ObstacleType =
  | 'SPIKE_BOTTOM'
  | 'SPIKE_TOP'
  | 'LASER_GATE'
  | 'FLOATING_PAD'
  | 'OSCILLATING_LASER';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SaveData {
  version: 1 | 2;
  highScore: number;
  highestCombo: number;
  totalRuns: number;
  isMuted: boolean;
  bestZone?: ZoneType;
}

export interface ChunkDef {
  id: string;
  name: string;
  length: number;
  minSpeed: number;
  entryGravity: GravityState;
  exitGravity: 'DOWN' | 'UP';
  zone?: ZoneType;
  obstacles: Array<{
    type: ObstacleType;
    x: number;
    y: number;
    width: number;
    height: number;
    period?: number;
    oscillateRange?: number; // 往復運動振幅
    oscillateSpeed?: number; // 往復運動速度
  }>;
  shards: Array<{ x: number; y: number; isShieldPrism?: boolean }>;
}

