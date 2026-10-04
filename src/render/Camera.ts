export class Camera {
  public x = 0;
  public y = 0;
  public shakeX = 0;
  public shakeY = 0;

  private shakeIntensity = 0;
  private shakeTimer = 0;
  private shakeDuration = 0;

  private hitStopTimer = 0;

  public update(dt: number, playerX: number, targetLead = 260): void {
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
      if (this.hitStopTimer < 0) this.hitStopTimer = 0;
    }

    // 平滑水平相機追隨
    this.x = playerX - targetLead;

    // 螢幕震動衰減運算
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const progress = Math.max(0, this.shakeTimer / this.shakeDuration);
      const currentIntensity = this.shakeIntensity * progress;
      this.shakeX = (Math.random() - 0.5) * 2 * currentIntensity;
      this.shakeY = (Math.random() - 0.5) * 2 * currentIntensity;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
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
