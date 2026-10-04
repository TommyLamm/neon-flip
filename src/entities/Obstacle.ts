import { ObstacleType, Rect } from '../types';

export class Obstacle {
  public type: ObstacleType = 'SPIKE_BOTTOM';
  public x = 0;
  public y = 0;
  public width = 36;
  public height = 40;
  public active = true;
  public nearMissTriggered = false;

  // 雷射閘門特有屬性
  public period = 1.2;
  public laserTimer = 0;
  public isLaserActive = true;

  public reset(
    type: ObstacleType,
    x: number,
    y: number,
    width: number,
    height: number,
    period = 1.2
  ): void {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.active = true;
    this.nearMissTriggered = false;
    this.period = period;
    this.laserTimer = 0;
    this.isLaserActive = true;
  }

  public update(dt: number): void {
    if (this.type === 'LASER_GATE') {
      this.laserTimer += dt;
      // 週期性開闔：例如 0 ~ 0.8s 閉合 (致命)，0.8 ~ 1.2s 打開 (通行)
      const cycle = this.laserTimer % this.period;
      this.isLaserActive = cycle < this.period * 0.65;
    }
  }

  public getHitbox(): Rect {
    if (this.type === 'LASER_GATE') {
      if (!this.isLaserActive) {
        // 雷射關閉時無致命碰撞
        return { x: -9999, y: -9999, width: 0, height: 0 };
      }
      return {
        x: this.x + 4,
        y: this.y,
        width: this.width - 8,
        height: this.height,
      };
    }

    if (this.type === 'SPIKE_BOTTOM') {
      // 尖刺為三角形，給予邊緣 4px 寬容度
      return {
        x: this.x + 6,
        y: this.y + 6,
        width: this.width - 12,
        height: this.height - 6,
      };
    }

    if (this.type === 'SPIKE_TOP') {
      return {
        x: this.x + 6,
        y: this.y,
        width: this.width - 12,
        height: this.height - 6,
      };
    }

    // FLOATING_PAD
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public intersects(rect: Rect): boolean {
    const hb = this.getHitbox();
    if (hb.width <= 0 || hb.height <= 0) return false;
    return (
      rect.x < hb.x + hb.width &&
      rect.x + rect.width > hb.x &&
      rect.y < hb.y + hb.height &&
      rect.y + rect.height > hb.y
    );
  }

  public checkNearMiss(playerNearMissBox: Rect, playerHitbox: Rect): boolean {
    if (this.nearMissTriggered) return false;
    const hb = this.getHitbox();
    if (hb.width <= 0) return false;

    // 已經發生致命碰撞時不算擦彈
    if (this.intersects(playerHitbox)) return false;

    // 檢查是否進入擦彈感應區
    const isNear =
      playerNearMissBox.x < hb.x + hb.width &&
      playerNearMissBox.x + playerNearMissBox.width > hb.x &&
      playerNearMissBox.y < hb.y + hb.height &&
      playerNearMissBox.y + playerNearMissBox.height > hb.y;

    if (isNear) {
      this.nearMissTriggered = true;
      return true;
    }
    return false;
  }
}
