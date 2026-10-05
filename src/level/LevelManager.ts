import { CONSTANTS } from '../core/Constants';
import { Obstacle } from '../entities/Obstacle';
import { ObjectPool } from '../entities/Pool';
import { Shard } from '../entities/Shard';
import { GravityState, ZoneType } from '../types';
import { CHUNK_DEFINITIONS } from './Chunks';

export class LevelManager {
  private obstaclePool: ObjectPool<Obstacle>;
  private shardPool: ObjectPool<Shard>;

  public ceilingY = 140;
  public floorY = 580;

  private currentSpawnX = 0;
  private lastExitGravity: GravityState = 'DOWN';
  public elapsedTime = 0;

  // 主題區域系統
  public currentZone: ZoneType = 'CYBER_STRIP';
  private zoneDistanceTraveled = 0;
  private readonly zoneSequence: ZoneType[] = ['CYBER_STRIP', 'NEON_SPIRE', 'QUANTUM_VOID'];
  private zoneIndex = 0;

  // 區域切換回調
  public onZoneChange?: (newZone: ZoneType) => void;

  constructor() {
    this.obstaclePool = new ObjectPool<Obstacle>(
      () => new Obstacle(),
      (obs) => {
        obs.active = false;
      },
      80
    );

    this.shardPool = new ObjectPool<Shard>(
      () => new Shard(),
      (shard) => {
        shard.active = false;
        shard.collected = false;
      },
      120
    );
  }

  public reset(ceilingY: number, floorY: number): void {
    this.ceilingY = ceilingY;
    this.floorY = floorY;
    this.obstaclePool.freeAll();
    this.shardPool.freeAll();
    this.currentSpawnX = 0;
    this.lastExitGravity = 'DOWN';
    this.elapsedTime = 0;

    this.zoneIndex = 0;
    this.currentZone = 'CYBER_STRIP';
    this.zoneDistanceTraveled = 0;

    // 起始生成前兩個區塊
    this.spawnNextChunk();
    this.spawnNextChunk();
  }

  public getCurrentSpeed(): number {
    const v0 = CONSTANTS.INITIAL_HORIZONTAL_SPEED;
    const vmax = CONSTANTS.MAX_HORIZONTAL_SPEED;
    const tau = CONSTANTS.SPEED_GROWTH_TAU;
    return v0 + (vmax - v0) * (1 - Math.exp(-this.elapsedTime / tau));
  }

  public getZoneGravityMultiplier(): number {
    return CONSTANTS.ZONES[this.currentZone].gravityScale;
  }

  public update(dt: number, playerX: number): void {
    this.elapsedTime += dt;

    // 區域切換檢查
    const currentSpeed = this.getCurrentSpeed();
    this.zoneDistanceTraveled += currentSpeed * dt;
    const switchThreshold = CONSTANTS.ZONES[this.currentZone].switchDistance;

    if (this.zoneDistanceTraveled >= switchThreshold) {
      this.zoneDistanceTraveled = 0;
      this.zoneIndex = (this.zoneIndex + 1) % this.zoneSequence.length;
      this.currentZone = this.zoneSequence[this.zoneIndex];
      if (this.onZoneChange) {
        this.onZoneChange(this.currentZone);
      }
    }

    // 若前方緩衝少於 2400px，動態拼接入下一個合法區塊
    while (this.currentSpawnX < playerX + 2400) {
      this.spawnNextChunk();
    }

    // 更新障礙物邏輯（如雷射開關週期、上下往復運動）
    const activeObstacles = this.obstaclePool.getActiveList();
    for (let i = activeObstacles.length - 1; i >= 0; i--) {
      const obs = activeObstacles[i];
      obs.update(dt);
      // 清理已經遠遠越過玩家後方的實體
      if (obs.x + obs.width < playerX - 400) {
        this.obstaclePool.free(obs);
      }
    }

    // 更新晶體邏輯
    const activeShards = this.shardPool.getActiveList();
    for (let i = activeShards.length - 1; i >= 0; i--) {
      const shard = activeShards[i];
      shard.update(dt);
      if (shard.x + shard.size < playerX - 400 || shard.collected) {
        this.shardPool.free(shard);
      }
    }
  }

  private spawnNextChunk(): void {
    const speed = this.getCurrentSpeed();

    // 優先篩選符合當前 Zone 且速度與 entryGravity 匹配的區塊
    const zoneCandidates = CHUNK_DEFINITIONS.filter((chunk) => {
      if (chunk.zone !== this.currentZone) return false;
      if (chunk.minSpeed > speed) return false;
      if (chunk.entryGravity === 'ANY') return true;
      return chunk.entryGravity === this.lastExitGravity;
    });

    // 容錯備援：若無精確匹配，放寬至全域候選
    const fallbackCandidates = CHUNK_DEFINITIONS.filter((chunk) => {
      if (chunk.minSpeed > speed) return false;
      if (chunk.entryGravity === 'ANY') return true;
      return chunk.entryGravity === this.lastExitGravity;
    });

    const pool =
      zoneCandidates.length > 0
        ? zoneCandidates
        : fallbackCandidates.length > 0
        ? fallbackCandidates
        : CHUNK_DEFINITIONS.slice(0, 2);

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const chunkStartX = this.currentSpawnX;

    // 生成區塊內的障礙物
    for (const def of chosen.obstacles) {
      const obs = this.obstaclePool.obtain();
      const worldX = chunkStartX + def.x;
      const worldY = this.ceilingY + def.y;
      obs.reset(
        def.type,
        worldX,
        worldY,
        def.width,
        def.height,
        def.period ?? 1.2,
        def.oscillateRange ?? 0,
        def.oscillateSpeed ?? 2.0
      );
    }

    // 生成區塊內的晶體與稜鏡
    for (const s of chosen.shards) {
      const shard = this.shardPool.obtain();
      const worldX = chunkStartX + s.x;
      const worldY = this.ceilingY + s.y;
      shard.reset(worldX, worldY, !!s.isShieldPrism);
    }

    this.currentSpawnX += chosen.length;
    this.lastExitGravity = chosen.exitGravity;
  }

  public getActiveObstacles(): readonly Obstacle[] {
    return this.obstaclePool.getActiveList();
  }

  public getActiveShards(): readonly Shard[] {
    return this.shardPool.getActiveList();
  }
}

