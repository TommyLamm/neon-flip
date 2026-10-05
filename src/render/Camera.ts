export class Camera {
  public x = 0;
  public y = 0;
  public shakeX = 0;
  public shakeY = 0;

  private shakeIntensity = 0;
  private shakeTimer = 0;
  private shakeDuration = 0;

  private hitStopTimer = 0;

  public update(dt: number, playerX: number, targetLead = 260, currentSpeed = 420): void {
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
      if (this.hitStopTimer < 0) this.hitStopTimer = 0;
    }

    // 平滑水平相機追隨
    this.x = playerX - targetLead;

    // 螢幕衝擊震動衰減運算
    let sx = 0;
    let sy = 0;
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const progress = Math.max(0, this.shakeTimer / this.shakeDuration);
      const currentIntensity = this.shakeIntensity * progress;
      sx = (Math.random() - 0.5) * 2 * currentIntensity;
      sy = (Math.random() - 0.5) * 2 * currentIntensity;
    }

    // 高移速空間微震動 (Speed Rumble: > 700 px/s 時開始啟動)
    if (currentSpeed > 700) {
      const rumbleRatio = Math.min(1, (currentSpeed - 700) / 260);
      const rumbleAmount = rumbleRatio * 1.5;
      sx += (Math.random() - 0.5) * 2 * rumbleAmount;
      sy += (Math.random() - 0.5) * 2 * rumbleAmount;
    }

    this.shakeX = sx;
    this.shakeY = sy;
  }

  public addShake(intensity: number, duration: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }

  public triggerHitStop(duration: number): void {
    this.hitStopTimer = duration;
  }

  public isHitStopped(): boolean {
    return this.hitStopTimer > 0;
  }

  public reset(): void {
    this.x = 0;
    this.y = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;
    this.shakeTimer = 0;
    this.hitStopTimer = 0;
  }
}

