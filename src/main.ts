import { Game } from './core/Game';
import { GameLoop } from './core/GameLoop';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element #game-canvas not found!');
    return;
  }

  const game = new Game(canvas);

  const loop = new GameLoop(
    (dt) => game.update(dt),
    (alpha) => game.render(alpha)
  );

  window.addEventListener('resize', () => {
    game.handleResize();
  });

  // 分頁切換時防止失控
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 可以在此暫停或靜音
    }
  });

  loop.start();
});
