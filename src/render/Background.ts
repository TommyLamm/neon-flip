import { CONSTANTS } from '../core/Constants';

export class Background {
  private starfield: Array<{ x: number; y: number; size: number; alpha: number }> = [];

  constructor() {
    // 預先生成星空粒子
    for (let i = 0; i < 70; i++) {
      this.starfield.push({
        x: Math.random() * CONSTANTS.BASE_WIDTH,
        y: Math.random() * CONSTANTS.BASE_HEIGHT,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
  }

  public render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    isHyper: boolean,
    ceilingY: number,
    floorY: number,
    width: number,
    height: number
  ): void {
    // 1. 深邃賽博夜空漸變
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (isHyper) {
      bgGrad.addColorStop(0, '#21052d');
      bgGrad.addColorStop(0.5, '#350a36');
      bgGrad.addColorStop(1, '#150321');
    } else {
      bgGrad.addColorStop(0, '#06020e');
      bgGrad.addColorStop(0.5, '#0e041c');
      bgGrad.addColorStop(1, '#080312');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 遠景星空（微弱視差滾動 0.05x）
    ctx.save();
    for (const star of this.starfield) {
      const sx = (star.x - cameraX * 0.05) % width;
      const drawX = sx < 0 ? sx + width : sx;
      ctx.fillStyle = isHyper ? CONSTANTS.COLORS.GOLD : CONSTANTS.COLORS.CYAN;
      ctx.globalAlpha = star.alpha * 0.6;
      ctx.fillRect(drawX, star.y, star.size, star.size);
    }
    ctx.restore();

    // 3. 遠景合成波太陽（Synthwave Sun，固定於中央偏後方）
    const sunX = width * 0.5;
    const sunY = (ceilingY + floorY) * 0.5;
    const sunRadius = 75;

    ctx.save();
    const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    if (isHyper) {
      sunGrad.addColorStop(0, '#ffe600');
      sunGrad.addColorStop(1, '#ff007f');
    } else {
      sunGrad.addColorStop(0, '#ff007f');
      sunGrad.addColorStop(1, '#7900ff');
    }
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // 太陽橫向賽博百葉窗切割條紋
    ctx.fillStyle = isHyper ? '#350a36' : '#0e041c';
    for (let i = 1; i <= 6; i++) {
      const sliceY = sunY + sunRadius * (i / 7) - 6;
      const sliceH = 3 + i * 1.2;
      ctx.fillRect(sunX - sunRadius - 10, sliceY, sunRadius * 2 + 20, sliceH);
    }
    ctx.restore();

    // 4. 中景透視網格（天花板與地表外側網格，0.3x 滾動）
    ctx.save();
    ctx.strokeStyle = isHyper ? 'rgba(255, 230, 0, 0.15)' : CONSTANTS.COLORS.GRID_LINE;
    ctx.lineWidth = 1;

    // 地表下方向外網格
    const gridSpacing = 40;
    const gridOffset = (cameraX * 0.35) % gridSpacing;
    for (let x = -gridSpacing; x < width + gridSpacing; x += gridSpacing) {
      const gx = x - gridOffset;
      ctx.beginPath();
      ctx.moveTo(gx, floorY + CONSTANTS.TRACK_THICKNESS);
      ctx.lineTo(gx - 40, height);
      ctx.stroke();

      // 天花板向上網格
      ctx.beginPath();
      ctx.moveTo(gx, ceilingY);
      ctx.lineTo(gx - 40, 0);
      ctx.stroke();
    }

    // 橫向深度線
    for (let y = floorY + CONSTANTS.TRACK_THICKNESS + 20; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let y = ceilingY - 20; y > 0; y -= 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }
}
