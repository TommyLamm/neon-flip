import { CONSTANTS } from '../core/Constants';
import { Rect } from '../types';

export class Player {
  public x = 120;
  public y = 0;
  public prevX = 120;
  public prevY = 0;
  public vx = CONSTANTS.INITIAL_HORIZONTAL_SPEED;
  public vy = 0;
  public width = CONSTANTS.PLAYER_SIZE;
  public height = CONSTANTS.PLAYER_SIZE;

  // 重力方向：1 為向下（地表），-1 為向上（天花板）
  public gravityDir: 1 | -1 = 1;
  public isGrounded = true;

  // 主題區域動態重力調整
  public gravityMultiplier = 1.0;

  // 幽靈稜鏡護盾與無敵幀
  public hasShield = false;
  public invulnerableTimer = 0;
  public shieldAngle = 0;

  // 土狼時間與輸入緩衝 (120ms)
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
    this.y = this.floorY - this.height;
    this.prevX = this.x;
    this.prevY = this.y;
    this.gravityDir = 1;
    this.vx = CONSTANTS.INITIAL_HORIZONTAL_SPEED;
    this.vy = 0;
    this.isGrounded = true;
    this.gravityMultiplier = 1.0;
    this.hasShield = false;
    this.invulnerableTimer = 0;
    this.shieldAngle = 0;
    this.coyoteTimer = 0;
    this.inputBufferTimer = 0;
    this.flipCooldownTimer = 0;
    this.trailHistory = [];
    this.trailTimer = 0;
    this.rotation = 0;
  }

  public triggerFlip(): boolean {
    if (this.flipCooldownTimer > 0) {
      this.inputBufferTimer = CONSTANTS.INPUT_BUFFER_TIME;
      return false;
    }

    // 若在地面或在土狼時間內，立即反轉
    if (this.isGrounded || this.coyoteTimer > 0) {
      this.executeFlip();
      return true;
    } else {
      // 在空中則進入輸入緩衝（120ms）
      this.inputBufferTimer = CONSTANTS.INPUT_BUFFER_TIME;
      return false;
    }
  }

  private executeFlip(): void {
    this.gravityDir = this.gravityDir === 1 ? -1 : 1;
    const impulse = CONSTANTS.FLIP_IMPULSE * (this.gravityMultiplier < 0.6 ? 0.75 : 1.0);
    this.vy = -this.gravityDir * impulse;
    this.isGrounded = false;
    this.coyoteTimer = 0;
    this.inputBufferTimer = 0;
    this.flipCooldownTimer = CONSTANTS.FLIP_COOLDOWN;
  }

  public update(dt: number, currentSpeed: number): { flipped: boolean } {
    let flippedThisFrame = false;

    // 記錄 CCD 軌跡起點
    this.prevX = this.x;
    this.prevY = this.y;

    this.vx = currentSpeed;
    this.x += this.vx * dt;

    // 護盾旋轉與無敵時間遞減
    if (this.hasShield) {
      this.shieldAngle += dt * 3.5;
    }
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // 冷卻與計時器更新
    if (this.flipCooldownTimer > 0) this.flipCooldownTimer -= dt;
    if (this.inputBufferTimer > 0) this.inputBufferTimer -= dt;
    if (!this.isGrounded && this.coyoteTimer > 0) this.coyoteTimer -= dt;

    // 垂直加速度與終端速度限制（支援區域重力縮減）
    const effectiveAccel = this.gravityDir * CONSTANTS.GRAVITY_ACCEL * this.gravityMultiplier;
    this.vy += effectiveAccel * dt;

    const termVel = CONSTANTS.TERMINAL_VELOCITY * (this.gravityMultiplier < 0.6 ? 0.65 : 1.0);
    if (this.gravityDir === 1 && this.vy > termVel) {
      this.vy = termVel;
    } else if (this.gravityDir === -1 && this.vy < -termVel) {
      this.vy = -termVel;
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
        // 檢查 120ms 輸入緩衝，落地瞬間自動反轉
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
        // 檢查 120ms 輸入緩衝，觸頂瞬間自動反轉
        if (this.inputBufferTimer > 0) {
          this.executeFlip();
          flippedThisFrame = true;
        }
      }
    } else {
      if (this.isGrounded) {
        // 剛離開軌道，啟動土狼時間
        this.isGrounded = false;
        this.coyoteTimer = CONSTANTS.COYOTE_TIME;
      }
    }

    // 旋轉角度平滑更新（在空中翻滾，量子虛空區飄逸翻滾）
    if (!this.isGrounded) {
      const rotSpeed = this.gravityMultiplier < 0.6 ? 8 : 12;
      this.rotation += (this.gravityDir === 1 ? -1 : 1) * rotSpeed * dt;
    } else {
      this.rotation = 0;
    }

    // 殘影歷史記錄
    this.trailTimer += dt;
    if (this.trailTimer >= 0.018) {
      this.trailTimer = 0;
      this.trailHistory.unshift({ x: this.x, y: this.y, gravityDir: this.gravityDir });
      if (this.trailHistory.length > 12) {
        this.trailHistory.pop();
      }
    }

    return { flipped: flippedThisFrame };
  }

  public getHitboxAt(px: number, py: number): Rect {
    return {
      x: px + CONSTANTS.HITBOX_INSET,
      y: py + CONSTANTS.HITBOX_INSET,
      width: this.width - CONSTANTS.HITBOX_INSET * 2,
      height: this.height - CONSTANTS.HITBOX_INSET * 2,
    };
  }

  public getHitbox(): Rect {
    return this.getHitboxAt(this.x, this.y);
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

