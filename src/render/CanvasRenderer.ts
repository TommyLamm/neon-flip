import { CONSTANTS } from '../core/Constants';
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
    isHyper: boolean
  ): void {
    const railColor = isHyper ? CONSTANTS.COLORS.GOLD : CONSTANTS.COLORS.CYAN;
    const ceilingColor = isHyper ? CONSTANTS.COLORS.GOLD : CONSTANTS.COLORS.MAGENTA;
    const thickness = CONSTANTS.TRACK_THICKNESS;

    // === 天花板導軌 ===
    ctx.save();
    // 柔光底層
    ctx.shadowColor = ceilingColor;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = ceilingColor;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(0, ceilingY);
    ctx.lineTo(width, ceilingY);
    ctx.stroke();

    // 核心高光實線
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, ceilingY + thickness / 2);
    ctx.lineTo(width, ceilingY + thickness / 2);
    ctx.stroke();

    // 導軌脈衝光點 (1.0x 滾動)
    const pulseOffsetCeiling = (cameraX * 0.8) % 120;
    ctx.fillStyle = '#ffffff';
    for (let x = -120; x < width + 120; x += 120) {
      ctx.fillRect(x - pulseOffsetCeiling, ceilingY - 2, 24, thickness + 4);
    }
    ctx.restore();

    // === 地面導軌 ===
    ctx.save();
    // 柔光底層
    ctx.shadowColor = railColor;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = railColor;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(0, floorY + thickness / 2);
    ctx.lineTo(width, floorY + thickness / 2);
    ctx.stroke();

    // 核心高光實線
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(width, floorY);
    ctx.stroke();

    // 導軌脈衝光點
    const pulseOffsetFloor = (cameraX * 0.8) % 120;
    ctx.fillStyle = '#ffffff';
    for (let x = -120; x < width + 120; x += 120) {
      ctx.fillRect(x - pulseOffsetFloor, floorY - 2, 24, thickness + 4);
    }
    ctx.restore();
  }

  // 2. 繪製角色 (Player Core & Ribbon Trail)
  public static renderPlayer(
    ctx: CanvasRenderingContext2D,
    player: Player,
    cameraX: number,
    isHyper: boolean
  ): void {
    const screenX = player.x - cameraX;
    const color = isHyper
      ? CONSTANTS.COLORS.GOLD
      : player.gravityDir === 1
      ? CONSTANTS.COLORS.CYAN
      : CONSTANTS.COLORS.MAGENTA;

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
          ? CONSTANTS.COLORS.CYAN
          : CONSTANTS.COLORS.MAGENTA;
        ctx.globalAlpha = progress * 0.35;
        const s = player.width * (0.4 + 0.6 * progress);
        ctx.fillRect(hx + (player.width - s) / 2, hist.y + (player.height - s) / 2, s, s);
      }
      ctx.restore();
    }

    // B. 繪製本體發光光子核心 (Dual-pass Bloom)
    ctx.save();
    ctx.translate(screenX + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.rotation);

    const half = player.width / 2;

    // Pass 1: 柔光光暈 (Bloom Outer)
    ctx.shadowColor = color;
    ctx.shadowBlur = isHyper ? 24 : 16;
    ctx.fillStyle = color;
    ctx.fillRect(-half, -half, player.width, player.height);

    // Pass 2: 純白核心與箭頭指標 (Crisp Core)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    const innerSize = player.width * 0.55;
    ctx.fillRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize);

    // 箭頭方向指標（指示重力方向）
    ctx.fillStyle = color;
    ctx.beginPath();
    const arrowDir = player.gravityDir;
    ctx.moveTo(0, arrowDir * 6);
    ctx.lineTo(-5, -arrowDir * 4);
    ctx.lineTo(5, -arrowDir * 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // 3. 繪製障礙物 (Spikes, Laser Gates, Pads)
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
      ctx.moveTo(screenX + obs.width / 2, obs.y); // 頂點
      ctx.lineTo(screenX + obs.width, obs.y + obs.height); // 右底
      ctx.lineTo(screenX, obs.y + obs.height); // 左底
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
      ctx.moveTo(screenX + obs.width / 2, obs.y + obs.height); // 朝下尖端
      ctx.lineTo(screenX + obs.width, obs.y); // 右頂
      ctx.lineTo(screenX, obs.y); // 左頂
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
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(255, 23, 68, 0.7)';
        ctx.fillRect(screenX, obs.y, obs.width, obs.height);

        // 核心白熱線
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(screenX + obs.width / 2 - 2, obs.y, 4, obs.height);
      } else {
        // 雷射關閉預警態：微弱跳動橙色指示線
        ctx.strokeStyle = 'rgba(255, 145, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(screenX + obs.width / 2, obs.y);
        ctx.lineTo(screenX + obs.width / 2, obs.y + obs.height);
        ctx.stroke();
      }

      // 上下端點發射柱
      ctx.fillStyle = CONSTANTS.COLORS.ORANGE;
      ctx.fillRect(screenX - 4, obs.y, obs.width + 8, 8);
      ctx.fillRect(screenX - 4, obs.y + obs.height - 8, obs.width + 8, 8);
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

  // 4. 繪製能量晶體 (Shards)
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

    ctx.restore();
  }
}
