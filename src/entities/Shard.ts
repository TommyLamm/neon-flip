import { Rect } from '../types';

export class Shard {
  public x = 0;
  public y = 0;
  public size = 18;
  public active = true;
  public collected = false;
  public pulseTimer = 0;

  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.active = true;
    this.collected = false;
    this.pulseTimer = Math.random() * Math.PI * 2;
  }

  public update(dt: number): void {
    this.pulseTimer += dt * 4;
  }

  public intersects(rect: Rect): boolean {
    if (this.collected || !this.active) return false;
    const half = this.size / 2;
    return (
      rect.x < this.x + half &&
      rect.x + rect.width > this.x - half &&
      rect.y < this.y + half &&
      rect.y + rect.height > this.y - half
    );
  }
}
