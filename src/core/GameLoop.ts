export class GameLoop {
  private readonly fixedStep = 1 / 60; // 60 FPS 固定步長
  private accumulator = 0;
  private lastTime = 0;
  private running = false;
  private rafId = 0;

  constructor(
    private update: (dt: number) => void,
    private render: (interpolation: number) => void
  ) {}

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }

  private tick = (currentTime: number): void => {
    if (!this.running) return;
    let frameTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // 防止背景分頁切換引發的累積過大問題 (Spiral of Death)
    if (frameTime > 0.2) frameTime = 0.2;
    this.accumulator += frameTime;

    while (this.accumulator >= this.fixedStep) {
      this.update(this.fixedStep);
      this.accumulator -= this.fixedStep;
    }

    const interpolation = this.accumulator / this.fixedStep;
    this.render(interpolation);

    this.rafId = requestAnimationFrame(this.tick);
  };

  public stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }
}
