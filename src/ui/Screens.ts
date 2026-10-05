import { CONSTANTS } from '../core/Constants';
import { ZoneType } from '../types';

export class Screens {
  // 1. 標題畫面
  public static renderTitle(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    highScore: number,
    animTime: number
  ): void {
    ctx.save();
    // 半透明賽博漸層罩
    ctx.fillStyle = 'rgba(8, 3, 18, 0.65)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 主標題：NEON FLIP
    const titleY = height * 0.35;
    ctx.font = '900 68px monospace';
    ctx.shadowColor = CONSTANTS.COLORS.CYAN;
    ctx.shadowBlur = 24;
    ctx.fillStyle = CONSTANTS.COLORS.CYAN;
    ctx.fillText('NEON FLIP', width / 2, titleY);

    // 中文副標題
    ctx.font = 'bold 24px sans-serif';
    ctx.shadowColor = CONSTANTS.COLORS.MAGENTA;
    ctx.shadowBlur = 14;
    ctx.fillStyle = CONSTANTS.COLORS.MAGENTA;
    ctx.fillText('霓 虹 反 轉', width / 2, titleY + 54);

    // 操作教學圖解簡介
    ctx.font = '15px sans-serif';
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.fillText('單鍵掌控重力 ✦ 三大多元主題區域 ✦ 拾取幽靈稜鏡獲得護盾 ✦ 極限擦彈刷分', width / 2, titleY + 104);

    // 歷史最高分
    if (highScore > 0) {
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = CONSTANTS.COLORS.GOLD;
      ctx.shadowColor = CONSTANTS.COLORS.GOLD;
      ctx.shadowBlur = 8;
      ctx.fillText(`BEST RECORD: ${highScore}`, width / 2, titleY + 144);
    }

    // 呼吸動態提示字：TAP / SPACE TO START
    const pulseAlpha = 0.5 + 0.5 * Math.sin(animTime * 5);
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12 * pulseAlpha;
    ctx.fillText('▶ TAP OR PRESS SPACE TO START ◀', width / 2, height * 0.72);

    ctx.restore();
  }

  // 2. 倒數預備畫面
  public static renderCountdown(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    countdownValue: number
  ): void {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = countdownValue > 0 ? `${countdownValue}` : 'GO!';
    const color = countdownValue > 0 ? CONSTANTS.COLORS.CYAN : CONSTANTS.COLORS.GOLD;

    ctx.font = '900 84px monospace';
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 28;
    ctx.fillText(text, width / 2, height * 0.45);

    ctx.restore();
  }

  // 3. 結算畫面
  public static renderGameOver(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    score: number,
    highScore: number,
    maxCombo: number,
    isNewRecord: boolean,
    finalZone: ZoneType,
    animTime: number
  ): void {
    ctx.save();
    // 半透明深邃暗色底罩
    ctx.fillStyle = 'rgba(8, 3, 18, 0.82)';
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerY = height * 0.38;

    // 故障訊號中斷標題
    ctx.font = '900 48px monospace';
    ctx.fillStyle = CONSTANTS.COLORS.RED;
    ctx.shadowColor = CONSTANTS.COLORS.RED;
    ctx.shadowBlur = 22;
    ctx.fillText('SIGNAL LOST', width / 2, centerY - 64);

    // 本次得分
    ctx.font = 'bold 54px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = CONSTANTS.COLORS.CYAN;
    ctx.shadowBlur = 16;
    ctx.fillText(`${Math.floor(score)}`, width / 2, centerY + 6);

    // 新紀錄獎章
    if (isNewRecord) {
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = CONSTANTS.COLORS.GOLD;
      ctx.shadowColor = CONSTANTS.COLORS.GOLD;
      ctx.shadowBlur = 10;
      ctx.fillText('★ NEW BEST RECORD ★', width / 2, centerY + 54);
    } else {
      ctx.font = '16px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.shadowBlur = 0;
      ctx.fillText(`BEST: ${highScore}`, width / 2, centerY + 54);
    }

    // 最終抵達區域與最高連擊
    const zoneInfo = CONSTANTS.ZONES[finalZone];
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = zoneInfo.primaryColor;
    ctx.fillText(`FINAL ZONE: ${zoneInfo.name.toUpperCase()}`, width / 2, centerY + 88);

    ctx.font = '15px sans-serif';
    ctx.fillStyle = CONSTANTS.COLORS.MAGENTA;
    ctx.fillText(`MAX COMBO: ${maxCombo}`, width / 2, centerY + 114);

    // 一鍵立即重開提示
    const pulseAlpha = 0.5 + 0.5 * Math.sin(animTime * 6);
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10 * pulseAlpha;
    ctx.fillText('▶ TAP OR PRESS SPACE TO RETRY ◀', width / 2, height * 0.74);

    ctx.restore();
  }
}

