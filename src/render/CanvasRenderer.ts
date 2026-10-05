import { CONSTANTS, getSpeedColor } from '../core/Constants';
import { Obstacle } from '../entities/Obstacle';
import { Player } from '../entities/Player';
import { Shard } from '../entities/Shard';

export class CanvasRenderer {
  // 1. 繪製兩極發光導軌 (Rails)
  public static renderTracks(
    ctx: CanvasRenderingContext2D,
    ceilingY: number,
    floorY: number,
    width: number,
    cameraX: number,
    isHyper: boolean,
    currentSpeed: number
  ): void {
    const speedInfo = getSpeedColor(currentSpeed);
    const railColor = isHyper ? CONSTANTS.COLORS.GOLD : speedInfo.hex;
    const ceilingColor = isHyper ? CONSTANTS.COLORS.GOLD : CONSTANTS.COLORS.MAGENTA;
    const thickness = CONSTANTS.TRACK_THICKNESS;

    // === 天花板導軌 ===
    ctx.save();
    // 柔光底層 (Bloom Outer)
    ctx.shadowColor = ceilingColor;
    ctx.shadowBlur = isHyper ? 24 : 16 + speedInfo.factor * 10;
    ctx.strokeStyle = ceilingColor;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(0, ceilingY);
    ctx.lineTo(width, ceilingY);
    ctx.stroke();

    // 核心高光實線 (Crisp Inner)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, ceilingY + thickness / 2);
    ctx.lineTo(width, ceilingY + thickness / 2);
    ctx.stroke();

    // 導軌脈衝光點 (1.0x 滾動)
    const pulseOffsetCeiling = (cameraX * 0.9) % 110;
    ctx.fillStyle = '#ffffff';
    for (let x = -110; x < width + 110; x += 110) {
      ctx.fillRect(x - pulseOffsetCeiling, ceilingY - 2, 28, thickness + 4);
    }
    ctx.restore();

    // === 地面導軌 ===
    ctx.save();
    // 柔光底層
    ctx.shadowColor = railColor;
    ctx.shadowBlur = isHyper ? 24 : 16 + speedInfo.factor * 10;
    ctx.strokeStyle = railColor;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(0, floorY + thickness / 2);
    ctx.lineTo(width, floorY + thickness / 2);
    ctx.stroke();

    // 核心高光實線
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(width, floorY);
    ctx.stroke();

    // 導軌脈衝光點
    const pulseOffsetFloor = (cameraX * 0.9) % 110;
    ctx.fillStyle = '#ffffff';
    for (let x = -110; x < width + 110; x += 110) {
      ctx.fillRect(x - pulseOffsetFloor, floorY - 2, 28, thickness + 4);
    }
    ctx.restore();
  }

  // 2. 空間曲速流線 (Speed Lines)
  public static renderSpeedLines(
    ctx: CanvasRenderingContext2D,
    width: number,
    ceilingY: number,
    floorY: number,
    currentSpeed: number,
    cameraX: number,
    isHyper: boolean
  ): void {
    if (currentSpeed < 620 && !isHyper) return;

    const intensity = Math.min(1, (currentSpeed - 620) / 340);
    const numLines = Math.floor(12 + intensity * 26);
    const speedInfo = getSpeedColor(currentSpeed);

    ctx.save();
    ctx.lineWidth = 1.5;

    for (let i = 0; i < numLines; i++) {
      // 依偽隨機散列出水平流線
      const seed = i * 173.31;
      const speedMult = 1.6 + ((i * 13) % 7) * 0.25;
      const lineX = ((seed * 7 - cameraX * speedMult) % width + width) % width;
      const lineY = ceilingY + 10 + ((seed * 37) % (floorY - ceilingY - 20));
      const lineLength = 50 + intensity * 150 + ((i * 31) % 70);

      const grad = ctx.createLinearGradient(lineX, lineY, lineX + lineLength, lineY);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(0.7, isHyper ? 'rgba(255, 230, 0, 0.45)' : `${speedInfo.glow}77`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.85)');

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(lineX, lineY);
      ctx.lineTo(lineX + lineLength, lineY);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. 繪製角色 (Player Core & Ribbon Trail & Shield & Chromatic Aberration)
  public static renderPlayer(
    ctx: CanvasRenderingContext2D,
    player: Player,
    cameraX: number,
    isHyper: boolean,
    currentSpeed: number
  ): void {
    const screenX = player.x - cameraX;
    const speedInfo = getSpeedColor(currentSpeed);

    // 主題色：隨速度過渡，若重力向上且非 Hyper 則稍微偏向紫粉
    const baseColor = isHyper
      ? CONSTANTS.COLORS.GOLD
      : player.gravityDir === 1
      ? speedInfo.hex
      : CONSTANTS.COLORS.MAGENTA;

    // 無敵狀態高頻閃爍保護
    if (player.invulnerableTimer > 0) {
      const flash = Math.floor(player.invulnerableTimer * 24) % 2 === 0;
      if (flash) return;
    }

    // A. 繪製殘影緞帶 (Motion Ribbon)
    if (player.trailHistory.length > 1) {
      ctx.save();
      for (let i = 0; i < player.trailHistory.length; i++) {
        const hist = player.trailHistory[i];
        const hx = hist.x - cameraX;
        const progress = 1 - i / player.trailHistory.length;
        ctx.fillStyle = isHyper
          ? CONSTANTS.COLORS.GOLD
          : hist.gravityDir === 1
          ? speedInfo.hex
          : CONSTANTS.COLORS.MAGENTA;
        ctx.globalAlpha = progress * 0.38;
        const s = player.width * (0.35 + 0.65 * progress);
        ctx.fillRect(hx + (player.width - s) / 2, hist.y + (player.height - s) / 2, s, s);
      }
      ctx.restore();
    }

    // B. 極速色像差 (Chromatic Aberration Ghosting)
    if (currentSpeed > 780 || isHyper) {
      const offset = isHyper ? 3.5 : Math.min(3, ((currentSpeed - 780) / 180) * 3);

      ctx.save();
      ctx.translate(screenX + player.width / 2, player.y + player.height / 2);
      ctx.rotate(player.rotation);

      // 青色向左色差
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#00f3ff';
      ctx.fillRect(-player.width / 2 - offset, -player.height / 2, player.width, player.height);

      // 紅色向右色差
      ctx.fillStyle = '#ff1744';
      ctx.fillRect(-player.width / 2 + offset, -player.height / 2, player.width, player.height);

      ctx.restore();
    }

    // C. 繪製本體發光光子核心 (Dual-pass Bloom)
    ctx.save();
    ctx.translate(screenX + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.rotation);

    const half = player.width / 2;

    // Pass 1: 柔光光暈 (Bloom Outer)
    ctx.shadowColor = isHyper ? CONSTANTS.COLORS.GOLD : speedInfo.glow;
    ctx.shadowBlur = isHyper ? 28 : 18 + speedInfo.factor * 12;
    ctx.fillStyle = baseColor;
    ctx.fillRect(-half, -half, player.width, player.height);

    // Pass 2: 純白核心與重力箭頭指標 (Crisp Core)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    const innerSize = player.width * 0.55;
    ctx.fillRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize);

    // 箭頭方向指標
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    const arrowDir = player.gravityDir;
    ctx.moveTo(0, arrowDir * 6.5);
    ctx.lineTo(-5.5, -arrowDir * 4.5);
    ctx.lineTo(5.5, -arrowDir * 4.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // D. 幽靈稜鏡能量護盾 (Ghost Prism Shield Aura)
    if (player.hasShield) {
      ctx.save();
      const cx = screenX + player.width / 2;
      const cy = player.y + player.height / 2;
      ctx.translate(cx, cy);

      const shieldRadius = player.width * 0.85;

      // 旋轉八面體全息護盾光環
      ctx.rotate(player.shieldAngle);
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 2;

      // 幾何菱形外罩
      ctx.beginPath();
      ctx.moveTo(0, -shieldRadius);
      ctx.lineTo(shieldRadius, 0);
      ctx.lineTo(0, shieldRadius);
      ctx.lineTo(-shieldRadius, 0);
      ctx.closePath();
      ctx.stroke();

      // 反向旋轉白色能量稜環
      ctx.rotate(-player.shieldAngle * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-shieldRadius * 0.7, -shieldRadius * 0.7, shieldRadius * 1.4, shieldRadius * 1.4);

      // 護盾微光填充
      ctx.fillStyle = 'rgba(0, 243, 255, 0.12)';
      ctx.beginPath();
      ctx.arc(0, 0, shieldRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // 4. 繪製障礙物 (Spikes, Laser Gates, Pads, Oscillating Lasers)
  public static renderObstacle(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    cameraX: number
  ): void {
    const screenX = obs.x - cameraX;

    if (obs.type === 'SPIKE_BOTTOM') {
      ctx.save();
      ctx.shadowColor = CONSTANTS.COLORS.RED;
      ctx.shadowBlur = 14;
      ctx.fillStyle = CONSTANTS.COLORS.RED;
      ctx.beginPath();
      ctx.moveTo(screenX + obs.width / 2, obs.y);
      ctx.lineTo(screenX + obs.width, obs.y + obs.height);
      ctx.lineTo(screenX, obs.y + obs.height);
      ctx.closePath();
      ctx.fill();

      // 白色銳利內核
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    } else if (obs.type === 'SPIKE_TOP') {
      ctx.save();
      ctx.shadowColor = CONSTANTS.COLORS.RED;
      ctx.shadowBlur = 14;
      ctx.fillStyle = CONSTANTS.COLORS.RED;
      ctx.beginPath();
      ctx.moveTo(screenX + obs.width / 2, obs.y + obs.height);
      ctx.lineTo(screenX + obs.width, obs.y);
      ctx.lineTo(screenX, obs.y);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    } else if (obs.type === 'LASER_GATE') {
      ctx.save();
      if (obs.isLaserActive) {
        // 雷射啟動態：灼熱紅色雷射柱
        ctx.shadowColor = CONSTANTS.COLORS.RED;
        ctx.shadowBlur = 22;
        ctx.fillStyle = 'rgba(255, 23, 68, 0.72)';
        ctx.fillRect(screenX, obs.y, obs.width, obs.height);

        // 核心白熱線
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(screenX + obs.width / 2 - 2, obs.y, 4, obs.height);
      } else {
        // 雷射關閉預警態
        ctx.strokeStyle = 'rgba(255, 145, 0, 0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(screenX + obs.width / 2, obs.y);
        ctx.lineTo(screenX + obs.width / 2, obs.y + obs.height);
        ctx.stroke();
      }

      // 端點發射柱
      ctx.fillStyle = CONSTANTS.COLORS.ORANGE;
      ctx.fillRect(screenX - 4, obs.y, obs.width + 8, 8);
      ctx.fillRect(screenX - 4, obs.y + obs.height - 8, obs.width + 8, 8);
      ctx.restore();
    } else if (obs.type === 'OSCILLATING_LASER') {
      // 動態上下往復伸縮的垂直雷射光柱
      ctx.save();
      ctx.shadowColor = CONSTANTS.COLORS.MAGENTA;
      ctx.shadowBlur = 24;
      ctx.fillStyle = 'rgba(255, 0, 127, 0.75)';
      ctx.fillRect(screenX, obs.y, obs.width, obs.height);

      // 核心白熱光
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX + obs.width / 2 - 2.5, obs.y, 5, obs.height);

      // 上下懸浮聚焦發生器 (Emitters)
      ctx.fillStyle = CONSTANTS.COLORS.GOLD;
      ctx.fillRect(screenX - 5, obs.y - 4, obs.width + 10, 8);
      ctx.fillRect(screenX - 5, obs.y + obs.height - 4, obs.width + 10, 8);

      // 發生器高光點
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX + obs.width / 2 - 2, obs.y - 2, 4, 4);
      ctx.fillRect(screenX + obs.width / 2 - 2, obs.y + obs.height - 2, 4, 4);

      ctx.restore();
    } else if (obs.type === 'FLOATING_PAD') {
      ctx.save();
      ctx.shadowColor = CONSTANTS.COLORS.GREEN;
      ctx.shadowBlur = 14;
      ctx.fillStyle = 'rgba(0, 255, 102, 0.85)';
      ctx.fillRect(screenX, obs.y, obs.width, obs.height);

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, obs.y, obs.width, obs.height);
      ctx.restore();
    }
  }

  // 5. 繪製能量晶體 (Shards) 與稀有幽靈稜鏡 (Ghost Prism)
  public static renderShard(
    ctx: CanvasRenderingContext2D,
    shard: Shard,
    cameraX: number
  ): void {
    if (shard.collected || !shard.active) return;
    const screenX = shard.x - cameraX;

    ctx.save();
    ctx.translate(screenX, shard.y);
    const bob = Math.sin(shard.pulseTimer) * 4;
    ctx.translate(0, bob);
    ctx.rotate(shard.pulseTimer * 0.8);

    if (shard.isShieldPrism) {
      // 幽靈稜鏡 (Ghost Prism) 稀有護盾道具：八面體全息稜鏡
      const s = shard.size / 2;

      // 外層旋轉青紫光暈
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 22;
      ctx.fillStyle = 'rgba(0, 243, 255, 0.85)';
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.2);
      ctx.lineTo(s * 1.2, 0);
      ctx.lineTo(0, s * 1.2);
      ctx.lineTo(-s * 1.2, 0);
      ctx.closePath();
      ctx.fill();

      // 內部白色幾何晶核
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.6);
      ctx.lineTo(s * 0.6, 0);
      ctx.lineTo(0, s * 0.6);
      ctx.lineTo(-s * 0.6, 0);
      ctx.closePath();
      ctx.fill();

      // 旋轉保護環
      ctx.strokeStyle = CONSTANTS.COLORS.GOLD;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, s * 1.4, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // 普通分數晶體 (Golden Shard)
      const s = shard.size / 2;
      ctx.shadowColor = CONSTANTS.COLORS.GOLD;
      ctx.shadowBlur = 12;
      ctx.fillStyle = CONSTANTS.COLORS.GOLD;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s, 0);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 6. 全螢幕高速色像差暗角邊緣濾鏡 (Vignette & Chromatic Aberration Edge)
  public static renderSpeedVignette(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentSpeed: number
  ): void {
    if (currentSpeed < 750) return;

    const intensity = Math.min(1, (currentSpeed - 750) / 210);
    ctx.save();

    // 左右邊緣微弱紅青色像差輝光
    const edgeGradLeft = ctx.createLinearGradient(0, 0, 70, 0);
    edgeGradLeft.addColorStop(0, `rgba(0, 243, 255, ${0.18 * intensity})`);
    edgeGradLeft.addColorStop(1, 'rgba(0, 243, 255, 0)');
    ctx.fillStyle = edgeGradLeft;
    ctx.fillRect(0, 0, 70, height);

    const edgeGradRight = ctx.createLinearGradient(width - 70, 0, width, 0);
    edgeGradRight.addColorStop(0, 'rgba(255, 23, 68, 0)');
    edgeGradRight.addColorStop(1, `rgba(255, 23, 68, ${0.18 * intensity})`);
    ctx.fillStyle = edgeGradRight;
    ctx.fillRect(width - 70, 0, 70, height);

    ctx.restore();
  }
}

