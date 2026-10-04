export class ObjectPool<T> {
  private available: T[] = [];
  private active: T[] = [];

  constructor(
    private factory: () => T,
    private resetFn: (item: T) => void,
    initialSize: number
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  public obtain(): T {
    const item = this.available.length > 0 ? this.available.pop()! : this.factory();
    this.active.push(item);
    return item;
  }

  public free(item: T): void {
    const idx = this.active.indexOf(item);
    if (idx !== -1) {
      this.active.splice(idx, 1);
      this.resetFn(item);
      this.available.push(item);
    }
  }

  public freeAll(): void {
    while (this.active.length > 0) {
      const item = this.active.pop()!;
      this.resetFn(item);
      this.available.push(item);
    }
  }

  public getActiveList(): readonly T[] {
    return this.active;
  }
}
