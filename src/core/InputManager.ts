export class InputManager {
  private justPressed = false;
  private actionListeners: Array<(pos?: { x: number; y: number }) => void> = [];
  public lastClickPos: { x: number; y: number } | null = null;

  constructor(targetElement: HTMLElement) {
    // 鍵盤輸入：空白鍵、方向鍵上下、W、S
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        this.emitAction();
      }
    });

    // 滑鼠左鍵
    targetElement.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.lastClickPos = { x: e.clientX, y: e.clientY };
        this.emitAction(this.lastClickPos);
      }
    });

    // 行動端觸控（防止瀏覽器手勢干擾）
    targetElement.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          this.lastClickPos = { x: touch.clientX, y: touch.clientY };
          this.emitAction(this.lastClickPos);
        } else {
          this.emitAction();
        }
      },
      { passive: false }
    );
  }

  private emitAction(pos?: { x: number; y: number }): void {
    this.justPressed = true;
    for (const listener of this.actionListeners) {
      listener(pos);
    }
  }

  public consumeTrigger(): boolean {
    const val = this.justPressed;
    this.justPressed = false;
    return val;
  }

  public onAction(callback: (pos?: { x: number; y: number }) => void): void {
    this.actionListeners.push(callback);
  }
}
