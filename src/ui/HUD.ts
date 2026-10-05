import { CONSTANTS, getSpeedColor } from '../core/Constants';
import { ZoneType } from '../types';

export class HUD {
  public static isMuteButtonClicked(
    clickX: number,
    clickY: number,
    width: number
  ): boolean {
    const btnSize = 48;
    const btnX = width - btnSize - 16;
    const btnY = 16;
    return (
      clickX >= btnX &&
      clickX <= btnX + btnSize &&
      clickY >= btnY &&
      clickY <= btnY + btnSize
    );
  }

  public static render(
    ctx: CanvasRenderingContext2D,
    score: number,
    highScore: number,
    combo: number,
    comboMeter: number,
    speed: number,
    isHyper: boolean,
    isMuted: boolean,
    hasShield: boolean,
    currentZone: ZoneType,
    zoneBannerTimer: number,
    width: number,
    height: number
  ): void {
    ctx.save();
    const speedInfo = getSpeedColor(speed);
    const zoneConfig = CONSTANTS.ZONES[currentZone];

    // 1. 分數與最高分 (頂部左側)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // 當前分數
    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = isHyper ? CONSTANTS.COLORS.GOLD : speedInfo.glow;
    ctx.shadowBlur = 12;
    ctx.fillText(`${Math.floor(score)}`, 24, 20);

    // 最高分提示
    ctx.font = '13px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.shadowBlur = 0;
    ctx.fillText(`BEST: ${highScore}`, 24, 58);

    // 當前 Zone 指示標籤 (左上角分數下方)
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = zoneConfig.primaryColor;
    ctx.shadowColor = zoneConfig.primaryColor;
    ctx.shadowBlur = 6;
    ctx.fillText(`ZONE // ${zoneConfig.name.toUpperCase()}`, 24, 78);

    // 2. Combo 計量條與倍率 (頂部中央)
    const meterWidth = Math.min(240, width * 0.35);
    const meterHeight = 10;
    const meterX = width / 2 - meterWidth / 2;
    const meterY = 24;

    // 外框底槽
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);

    // 內部能量填充
    const fillWidth = (Math.max(0, Math.min(100, comboMeter)) / 100) * (meterWidth - 4);
    if (fillWidth > 0) {
      ctx.fillStyle = isHyper ? CONSTANTS.COLORS.GOLD : CONSTANTS.COLORS.MAGENTA;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fillRect(meterX + 2, meterY + 2, fillWidth, meterHeight - 4);
    }

    // Combo 文字與倍率標籤
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = isHyper ? CONSTANTS.COLORS.GOLD : CONSTANTS.COLORS.CYAN;
    ctx.shadowBlur = 6;
    if (isHyper) {
      ctx.fillText(`★ HYPER x5.0 ★ (${combo} COMBO)`, width / 2, meterY + 14);
    } else if (combo > 1) {
      const mult = combo >= 10 ? '3.0' : combo >= 6 ? '2.0' : combo >= 3 ? '1.5' : '1.0';
      ctx.fillText(`${combo} COMBO (x${mult})`, width / 2, meterY + 14);
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.shadowBlur = 0;
      ctx.font = '12px sans-serif';
      ctx.fillText('SPEED RUNNER', width / 2, meterY + 15);
    }

    // 3. 速度指示器 (頂部中央偏下)
    ctx.textAlign = 'center';
    ctx.font = '12px monospace';
    ctx.fillStyle = speedInfo.glow;
    ctx.shadowColor = speedInfo.glow;
    ctx.shadowBlur = 4;
    ctx.fillText(`${Math.floor(speed)} PX/S`, width / 2, 74);

    // 4. 幽靈稜鏡護盾圖示 (SHIELD ACTIVE - 頂部偏右)
    if (hasShield) {
      const shieldX = width - 180;
      const shieldY = 22;

      ctx.save();
      ctx.fillStyle = 'rgba(0, 243, 255, 0.15)';
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(shieldX, shieldY, 110, 32, 6);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('◆ SHIELD', shieldX + 55, shieldY + 16);
      ctx.restore();
    }

    // 5. 靜音開關按鈕 (右上角，觸控目標 48x48)
    const btnSize = 44;
    const btnX = width - btnSize - 16;
    const btnY = 16;

    ctx.save();
    ctx.fillStyle = 'rgba(18, 7, 34, 0.75)';
    ctx.strokeStyle = isMuted ? 'rgba(255, 255, 255, 0.3)' : CONSTANTS.COLORS.CYAN;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnSize, btnSize, 8);
    ctx.fill();
    ctx.stroke();

    // 喇叭圖示
    ctx.fillStyle = isMuted ? 'rgba(255, 255, 255, 0.4)' : '#ffffff';
    const cx = btnX + btnSize / 2;
    const cy = btnY + btnSize / 2;

    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 4);
    ctx.lineTo(cx - 3, cy - 4);
    ctx.lineTo(cx + 3, cy - 9);
    ctx.lineTo(cx + 3, cy + 9);
    ctx.lineTo(cx - 3, cy + 4);
    ctx.lineTo(cx - 8, cy + 4);
    ctx.closePath();
    ctx.fill();

    if (isMuted) {
      // 靜音斜線
      ctx.strokeStyle = CONSTANTS.COLORS.RED;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy - 9);
      ctx.lineTo(cx + 9, cy + 9);
      ctx.stroke();
    } else {
      // 音波弧線
      ctx.strokeStyle = CONSTANTS.COLORS.CYAN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx + 4, cy, 6, -Math.PI / 3, Math.PI / 3);
      ctx.stroke();
    }
    ctx.restore();

    // 6. 區域切換動態橫幅動畫 (Zone Banner Notification)
    if (zoneBannerTimer > 0) {
      const bannerAlpha = Math.min(1, zoneBannerTimer / 0.5, (2.2 - (2.2 - zoneBannerTimer)) / 0.5);
      const bannerY = height * 0.22;

      ctx.save();
      ctx.globalAlpha = Math.max(0, bannerAlpha);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 橫向霓虹暗色背板
      const grad = ctx.createLinearGradient(width / 2 - 250, bannerY, width / 2 + 250, bannerY);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.3, 'rgba(12, 4, 24, 0.88)');
      grad.addColorStop(0.7, 'rgba(12, 4, 24, 0.88)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(width / 2 - 250, bannerY - 26, 500, 52);

      // 上下霓虹邊線
      ctx.strokeStyle = zoneConfig.primaryColor;
      ctx.shadowColor = zoneConfig.primaryColor;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 220, bannerY - 26);
      ctx.lineTo(width / 2 + 220, bannerY - 26);
      ctx.moveTo(width / 2 - 220, bannerY + 26);
      ctx.lineTo(width / 2 + 220, bannerY + 26);
      ctx.stroke();

      // 主文字
      ctx.font = '900 24px monospace';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = zoneConfig.primaryColor;
      ctx.shadowBlur = 16;
      ctx.fillText(`ENTER >> ${zoneConfig.name.toUpperCase()}`, width / 2, bannerY - 4);

      // 副文字
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = zoneConfig.secondaryColor;
      ctx.shadowBlur = 6;
      ctx.fillText(zoneConfig.subtitle, width / 2, bannerY + 14);

      ctx.restore();
    }

    ctx.restore();
  }
}

