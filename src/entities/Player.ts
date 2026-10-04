import { CONSTANTS } from '../core/Constants';
import { Rect } from '../types';

export class Player {
  public x = 120;
  public y = 0;
  public vx = CONSTANTS.INITIAL_HORIZONTAL_SPEED;
  public vy = 0;
  public width = CONSTANTS.PLAYER_SIZE;
  public height = CONSTANTS.PLAYER_SIZE;

  // 重力方向：1 為向下（地表），-1 為向上（天花板）
  public gravityDir: 1 | -1 = 1;
  public isGrounded = true;

  // 土狼時間與輸入緩衝
  private coyoteTimer = 0;
  private inputBufferTimer = 0;
  private flipCooldownTimer = 0;

  // 軌道位置參考
  public ceilingY = 140;
  public floorY = 580;

  // 殘影歷史記錄 (x, y, gravityDir, alpha)
  public trailHistory: Array<{ x: number; y: number; gravityDir: 1 | -1 }> = [];
  private trailTimer = 0;

  // 旋轉與視覺角度
  public rotation = 0;

  constructor() {
    this.reset(140, 580);
  }

  public reset(ceilingY: number, floorY: number): void {
    this.ceilingY = ceilingY;
    this.floorY = floorY;
    this.x = 180;
    this.gravityDir = 1;
    this.y = this.floorY - this.height;
    this.vx = CONSTANTS.INITIAL_HORIZONTAL_SPEED;
    this.vy = 0;
    this.isGrounded = true;
    this.coyoteTimer = 0;
    this.inputBufferTimer = 0;
    this.flipCooldownTimer = 0;
    this.trailHistory = [];
    this.trailTimer = 0;
    this.rotation = 0;
  }

  public triggerFlip(): boolean {
    if (this.flipCooldownTimer > 0) return false;

    // 若在地面或在土狼時間內，立即反轉
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.executeFlip();
      return true;
    } else {
      // 否則進入輸入緩衝
      this.inputBufferTimer = CONSTANTS.INPUT_BUFFER_TIME;
      return false;
    }
  }

  private executeFlip(): void {
    this.gravityDir = this.gravityDir === 1 ? -1 : 1;
    this.vy = -this.gravityDir * CONSTANTS.FLIP_IMPULSE;
    this.isGrounded = false;
    this.coyoteTimer = 0;
    this.inputBufferTimer = 0;
    this.flipCooldownTimer = CONSTANTS.FLIP_COOLDOWN;
  }

  public update(dt: number, currentSpeed: number): { flipped: boolean } {
    let flippedThisFrame = false;
    this.vx = currentSpeed;
    this.x += this.vx * dt;

    // 冷卻與計時器更新
    if (this.flipCooldownTimer > 0) this.flipCooldownTimer -= dt;
    if (this.inputBufferTimer > 0) this.inputBufferTimer -= dt;
    if (!this.isGrounded && this.coyoteTimer > 0) this.coyoteTimer -= dt;

    // 垂直加速度與終端速度限制
    const accel = this.gravityDir * CONSTANTS.GRAVITY_ACCEL;
    this.vy += accel * dt;
    if (this.gravityDir === 1 && this.vy > CONSTANTS.TERMINAL_VELOCITY) {
      this.vy = CONSTANTS.TERMINAL_VELOCITY;
    } else if (this.gravityDir === -1 && this.vy < -CONSTANTS.TERMINAL_VELOCITY) {
      this.vy = -CONSTANTS.TERMINAL_VELOCITY;
    }

    this.y += this.vy * dt;

    // 著地 / 著頂判定
    const targetFloor = this.floorY - this.height;
    const targetCeiling = this.ceilingY;

    if (this.gravityDir === 1 && this.y >= targetFloor) {
      this.y = targetFloor;
      this.vy = 0;
      if (!this.isGrounded) {
        this.isGrounded = true;
        // 檢查輸入緩衝
        if (this.inputBufferTimer > 0) {
          this.executeFlip();
          flippedThisFrame = true;
        }
      }
    } else if (this.gravityDir === -1 && this.y <= targetCeiling) {
      this.y = targetCeiling;
      this.vy = 0;
      if (!this.isGrounded) {
        this.isGrounded = true;
        // 檢查輸入緩衝
        if (this.inputBufferTimer > 0) {
          this.executeFlip();
          flippedThisFrame = true;
        }
      }
    } else {
      if (this.isGrounded) {
        // 剛離開地面，啟動土狼時間
        this.isGrounded = false;
        this.coyoteTimer = CONSTANTS.COYOTE_TIME;
      }
    }

    // 旋轉角度平滑更新（在空中翻滾）
    if (!this.isGrounded) {
      this.rotation += (this.gravityDir === 1 ? -1 : 1) * 12 * dt;
    } else {
      this.rotation = 0;
    }

    // 殘影歷史記錄
    this.trailTimer += dt;
    if (this.trailTimer >= 0.02) {
      this.trailTimer = 0;
      this.trailHistory.unshift({ x: this.x, y: this.y, gravityDir: this.gravityDir });
      if (this.trailHistory.length > 10) {
        this.trailHistory.pop();
      }
    }

    return { flipped: flippedThisFrame };
  }

  public getHitbox(): Rect {
    return {
      x: this.x + CONSTANTS.HITBOX_INSET,
      y: this.y + CONSTANTS.HITBOX_INSET,
      width: this.width - CONSTANTS.HITBOX_INSET * 2,
      height: this.height - CONSTANTS.HITBOX_INSET * 2,
    };
  }

  public getNearMissBox(): Rect {
    const r = CONSTANTS.NEAR_MISS_RADIUS;
    return {
      x: this.x - r,
      y: this.y - r,
      width: this.width + r * 2,
      height: this.height + r * 2,
    };
  }
}
