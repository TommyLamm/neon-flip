export type GameState = 'TITLE' | 'COUNTDOWN' | 'PLAYING' | 'GAME_OVER';

export type GravityState = 'DOWN' | 'UP' | 'ANY';

export type ObstacleType = 'SPIKE_BOTTOM' | 'SPIKE_TOP' | 'LASER_GATE' | 'FLOATING_PAD';

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
  version: 1;
  highScore: number;
  highestCombo: number;
  totalRuns: number;
  isMuted: boolean;
}

export interface ChunkDef {
  id: string;
  name: string;
  length: number;
  minSpeed: number;
  entryGravity: GravityState;
  exitGravity: 'DOWN' | 'UP';
  obstacles: Array<{
    type: ObstacleType;
    x: number;
    y: number;
    width: number;
    height: number;
    period?: number;
  }>;
  shards: Array<{ x: number; y: number }>;
}
