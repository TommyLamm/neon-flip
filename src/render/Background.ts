import { CONSTANTS, getSpeedColor } from '../core/Constants';
import { ZoneType } from '../types';

interface SkylineBuilding {
  x: number;
  width: number;
  height: number;
  windows: Array<{ x: number; y: number; on: boolean }>;
  beaconColor: string;
}

export class Background {
  private starfield: Array<{ x: number; y: number; size: number; alpha: number; pulseSpeed: number }> = [];
  private farBuildings: SkylineBuilding[] = [];
  private midBuildings: SkylineBuilding[] = [];
  private beaconTimer = 0;

  constructor() {
    // 1. 預先生成星空粒子
    for (let i = 0; i < 90; i++) {
      this.starfield.push({
        x: Math.random() * CONSTANTS.BASE_WIDTH * 2,
        y: Math.random() * CONSTANTS.BASE_HEIGHT,
        size: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.7 + 0.3,
        pulseSpeed: 1 + Math.random() * 3,
      });
    }

    // 2. 預先生成遠景與中景天際線建築群
    this.farBuildings = this.generateSkyline(CONSTANTS.BASE_WIDTH * 2.5, 90, 190, 45, 80);
    this.midBuildings = this.generateSkyline(CONSTANTS.BASE_WIDTH * 2.5, 140, 280, 55, 110);
  }

  private generateSkyline(
    totalWidth: number,
    minH: number,
    maxH: number,
    minW: number,
    maxW: number
  ): SkylineBuilding[] {
    const list: SkylineBuilding[] = [];
    let currentX = 0;

    while (currentX < totalWidth) {
      const bWidth = minW + Math.random() * (maxW - minW);
      const bHeight = minH + Math.random() * (maxH - minH);
      const windows: Array<{ x: number; y: number; on: boolean }> = [];

      // 產生隨機幾何窗格
      const cols = Math.floor(bWidth / 14);
      const rows = Math.floor(bHeight / 18);
      for (let r = 2; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
          if (Math.random() < 0.38) {
            windows.push({ x: c * 14, y: r * 18, on: Math.random() > 0.3 });
          }
        }
      }

      list.push({
        x: currentX,
        width: bWidth,
        height: bHeight,
        windows,
        beaconColor: Math.random() > 0.4 ? '#ff1744' : '#00f3ff',
      });

      currentX += bWidth + (Math.random() * 16 - 4);
    }
    return list;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    isHyper: boolean,
    ceilingY: number,
    floorY: number,
    width: number,
    height: number,
    currentSpeed: number,
    currentZone: ZoneType = 'CYBER_STRIP'
  ): void {
    this.beaconTimer += 0.016;
    const speedInfo = getSpeedColor(currentSpeed);
    const zoneConfig = CONSTANTS.ZONES[currentZone];

    // 1. 深邃賽博夜空漸變（受 Zone 色彩與 Hyper 影響）
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (isHyper) {
      bgGrad.addColorStop(0, '#240430');
      bgGrad.addColorStop(0.5, '#3b0b3e');
      bgGrad.addColorStop(1, '#180424');
    } else if (currentZone === 'QUANTUM_VOID') {
      bgGrad.addColorStop(0, '#040114');
      bgGrad.addColorStop(0.5, '#12052c');
      bgGrad.addColorStop(1, '#060216');
    } else if (currentZone === 'NEON_SPIRE') {
      bgGrad.addColorStop(0, '#12020e');
      bgGrad.addColorStop(0.5, '#24061a');
      bgGrad.addColorStop(1, '#0c020d');
    } else {
      bgGrad.addColorStop(0, '#05020c');
      bgGrad.addColorStop(0.5, '#0c0418');
      bgGrad.addColorStop(1, '#080312');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 遠景星空（微弱視差滾動 0.04x + 閃爍呼吸）
    ctx.save();
    for (const star of this.starfield) {
      const sx = (star.x - cameraX * 0.04) % (width * 1.5);
      const drawX = sx < 0 ? sx + width * 1.5 : sx;
      if (drawX > width) continue;

      const alpha = star.alpha * (0.6 + 0.4 * Math.sin(this.beaconTimer * star.pulseSpeed));
      ctx.fillStyle = isHyper ? CONSTANTS.COLORS.GOLD : speedInfo.glow;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
      ctx.fillRect(drawX, star.y, star.size, star.size);
    }
    ctx.restore();

    // 3. 遠景合成波太陽（Synthwave Sun，固定於中央偏後方）
    const sunX = width * 0.5;
    const sunY = (ceilingY + floorY) * 0.5;
    const sunRadius = 78;

    ctx.save();
    const sunGrad = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    if (isHyper) {
      sunGrad.addColorStop(0, '#ffe600');
      sunGrad.addColorStop(1, '#ff007f');
    } else {
      sunGrad.addColorStop(0, zoneConfig.primaryColor);
      sunGrad.addColorStop(1, zoneConfig.secondaryColor);
    }
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // 太陽橫向賽博百葉窗切割條紋
    ctx.fillStyle = isHyper ? '#3b0b3e' : '#0c0418';
    for (let i = 1; i <= 6; i++) {
      const sliceY = sunY + sunRadius * (i / 7) - 6;
      const sliceH = 3 + i * 1.2;
      ctx.fillRect(sunX - sunRadius - 10, sliceY, sunRadius * 2 + 20, sliceH);
    }
    ctx.restore();

    // 4. 閃爍天際線光點剪影（雙層視差摩天都市建築群）
    // 層 A：遠景天際線 (0.08x 滾動)
    this.renderSkylineLayer(ctx, this.farBuildings, cameraX * 0.08, floorY, width, 'rgba(16, 7, 36, 0.65)', 0.4);
    // 層 B：中景天際線 (0.18x 滾動)
    this.renderSkylineLayer(ctx, this.midBuildings, cameraX * 0.18, floorY, width, 'rgba(24, 10, 48, 0.85)', 0.8);

    // 5. 動態多層次視差滾動霓虹網格 (Parallax Cyber Grid)
    ctx.save();
    const gridColor = isHyper ? 'rgba(255, 230, 0, 0.2)' : zoneConfig.gridColor;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // A. 地面透視深遠網格（視差 0.4x）
    const gridSpacing = 42;
    const gridOffset = (cameraX * 0.4) % gridSpacing;

    for (let x = -gridSpacing * 2; x < width + gridSpacing * 2; x += gridSpacing) {
      const gx = x - gridOffset;
      // 地面向下延展斜線
      ctx.beginPath();
      ctx.moveTo(gx, floorY + CONSTANTS.TRACK_THICKNESS);
      ctx.lineTo(gx - 60, height);
      ctx.stroke();

      // 天花板向上延展斜線
      ctx.beginPath();
      ctx.moveTo(gx, ceilingY);
      ctx.lineTo(gx - 60, 0);
      ctx.stroke();
    }

    // B. 橫向深度透視水平線
    for (let y = floorY + CONSTANTS.TRACK_THICKNESS + 16; y < height; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let y = ceilingY - 16; y > 0; y -= 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // C. 軌道淨空核心通道的微弱微光粒子帶
    ctx.fillStyle = speedInfo.glow;
    ctx.globalAlpha = 0.05 + 0.04 * Math.sin(this.beaconTimer * 2);
    ctx.fillRect(0, ceilingY, width, floorY - ceilingY);

    ctx.restore();
  }

  private renderSkylineLayer(
    ctx: CanvasRenderingContext2D,
    buildings: SkylineBuilding[],
    scrollOffset: number,
    baseY: number,
    viewWidth: number,
    buildingColor: string,
    windowAlpha: number
  ): void {
    ctx.save();
    const loopW = CONSTANTS.BASE_WIDTH * 2.2;

    for (const b of buildings) {
      const sx = ((b.x - scrollOffset) % loopW + loopW) % loopW - 100;
      if (sx > viewWidth + 100 || sx + b.width < -100) continue;

      const topY = baseY - b.height * 0.65;
      const bHeight = b.height * 0.65;

      // 建築主體剪影
      ctx.fillStyle = buildingColor;
      ctx.fillRect(sx, topY, b.width, bHeight);

      // 窗格微光
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = windowAlpha * 0.45;
      for (const w of b.windows) {
        if (w.on && topY + w.y < baseY - 6) {
          ctx.fillRect(sx + w.x, topY + w.y, 4, 6);
        }
      }

      // 大樓頂端航空警示閃爍光點 (Blinking Beacon)
      const blink = Math.sin(this.beaconTimer * 4 + b.x) > 0.2;
      if (blink) {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = b.beaconColor;
        ctx.shadowColor = b.beaconColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sx + b.width / 2, topY - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    ctx.restore();
  }
}

