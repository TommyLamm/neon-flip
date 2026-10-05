import { ObjectPool } from '../entities/Pool';

export type ParticleType = 'TRAIL' | 'SHOCKWAVE' | 'SPARK' | 'CYBER_SHATTER' | 'SHIELD_SHATTER';

export class Particle {
  public type: ParticleType = 'SPARK';
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public size = 4;
  public color = '#00f3ff';
  public life = 1;
  public maxLife = 1;
  public rotation = 0;
  public vRot = 0;
  public radius = 0;
  public active = true;

  public reset(
    type: ParticleType,
    x: number,
    y: number,
    vx: number,
    vy: number,
    size: number,
    color: string,
    life: number,
    vRot = 0
  ): void {
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.size = size;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = vRot;
    this.radius = 0;
    this.active = true;
  }

  public update(dt: number): void {
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    if (this.type === 'SHOCKWAVE') {
      const progress = 1 - this.life / this.maxLife;
      this.radius = progress * 64;
    } else {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.rotation += this.vRot * dt;

      if (this.type === 'CYBER_SHATTER') {
        this.vy += 800 * dt; // 碎裂光片受重力下墜
      } else if (this.type === 'SHIELD_SHATTER') {
        this.vx *= 0.95;
        this.vy *= 0.95;
      } else if (this.type === 'SPARK') {
        this.vx *= 0.94;
        this.vy *= 0.94;
      }
    }
  }
}

export class ParticleSystem {
  private pool: ObjectPool<Particle>;

  constructor() {
    this.pool = new ObjectPool<Particle>(
      () => new Particle(),
      (p) => {
        p.active = false;
      },
      450
    );
  }

  public reset(): void {
    this.pool.freeAll();
  }

  public emitTrail(x: number, y: number, color: string): void {
    const p = this.pool.obtain();
    p.reset('TRAIL', x, y, -50, (Math.random() - 0.5) * 24, 4, color, 0.28);
  }

  public emitShockwave(x: number, y: number, color: string): void {
    const p = this.pool.obtain();
    p.reset('SHOCKWAVE', x, y, 0, 0, 2, color, 0.24);
  }

  public emitNearMiss(x: number, y: number, color: string): void {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12 + (Math.random() - 0.5);
      const speed = 120 + Math.random() * 240;
      const p = this.pool.obtain();
      p.reset(
        'SPARK',
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        5,
        color,
        0.35 + Math.random() * 0.15
      );
    }
  }

  public emitShieldBreak(x: number, y: number): void {
    // 雙重衝擊波
    this.emitShockwave(x, y, '#ffffff');
    this.emitShockwave(x, y, '#00f3ff');

    // 噴射 30 枚全息護盾菱形碎片
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30 + (Math.random() - 0.5) * 0.5;
      const speed = 180 + Math.random() * 320;
      const p = this.pool.obtain();
      const color = i % 2 === 0 ? '#00f3ff' : '#ffffff';
      p.reset(
        'SHIELD_SHATTER',
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        7 + Math.random() * 6,
        color,
        0.5 + Math.random() * 0.3,
        (Math.random() - 0.5) * 12
      );
    }
  }

  public emitCyberShatter(x: number, y: number, color: string): void {
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 160 + Math.random() * 450;
      const p = this.pool.obtain();
      p.reset(
        'CYBER_SHATTER',
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 150,
        6 + Math.random() * 8,
        color,
        0.7 + Math.random() * 0.4,
        (Math.random() - 0.5) * 15
      );
    }
  }

  public update(dt: number): void {
    const active = this.pool.getActiveList();
    for (let i = active.length - 1; i >= 0; i--) {
      const p = active[i];
      p.update(dt);
      if (!p.active) {
        this.pool.free(p);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const active = this.pool.getActiveList();
    ctx.save();
    for (const p of active) {
      const screenX = p.x - cameraX;
      const alpha = Math.max(0, p.life / p.maxLife);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (p.type === 'SHOCKWAVE') {
        ctx.beginPath();
        ctx.arc(screenX, p.y, p.radius, 0, Math.PI * 2);
        ctx.lineWidth = 3.5 * alpha;
        ctx.stroke();
      } else if (p.type === 'CYBER_SHATTER') {
        ctx.translate(screenX, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size, p.size);
        ctx.lineTo(-p.size, p.size);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'SHIELD_SHATTER') {
        // 菱形晶片
        ctx.translate(screenX, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.7, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.7, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(screenX - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }
    ctx.restore();
  }
}

