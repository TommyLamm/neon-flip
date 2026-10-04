import { SynthAudio } from '../audio/SynthAudio';
import { Background } from '../render/Background';
import { Camera } from '../render/Camera';
import { CanvasRenderer } from '../render/CanvasRenderer';
import { ParticleSystem } from '../render/ParticleSystem';
import { HUD } from '../ui/HUD';
import { Screens } from '../ui/Screens';
import { GameState, SaveData } from '../types';
import { CONSTANTS } from './Constants';
import { InputManager } from './InputManager';
import { LevelManager } from '../level/LevelManager';
import { Player } from '../entities/Player';
import { StorageManager } from './Storage';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private state: GameState = 'TITLE';
  private saveData: SaveData;

  private input: InputManager;
  private audio: SynthAudio;
  private player: Player;
  private level: LevelManager;
  private particles: ParticleSystem;
  private camera: Camera;
  private background: Background;

  // 畫面尺寸
  public width = 1280;
  public height = 720;
  private ceilingY = 140;
  private floorY = 580;

  // 遊戲數值
  private score = 0;
  private currentSpeed = CONSTANTS.INITIAL_HORIZONTAL_SPEED;
  private combo = 0;
  private comboMeter = 0;
  private maxCombo = 0;
  private isNewRecord = false;
  private uiAnimTime = 0;

  // 倒數計時器
  private countdownTimer = 0;
  private countdownStep = 3;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.saveData = StorageManager.load();
    this.audio = new SynthAudio(this.saveData.isMuted);

    this.player = new Player();
    this.level = new LevelManager();
    this.particles = new ParticleSystem();
    this.camera = new Camera();
    this.background = new Background();
    this.input = new InputManager(canvas);

    this.handleResize();
    this.setupInput();
  }

  public handleResize(): void {
    const dpr = window.devicePixelRatio || 1;
    const clientWidth = window.innerWidth;
    const clientHeight = window.innerHeight;

    this.canvas.width = clientWidth * dpr;
    this.canvas.height = clientHeight * dpr;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    this.width = clientWidth;
    this.height = clientHeight;

    // 自適應軌道高度
    const isPortrait = clientHeight > clientWidth;
    let trackHeight = CONSTANTS.TRACK_HEIGHT;

    if (isPortrait) {
      // 直向螢幕：導軌適當拉寬，留出更寬廣的滑行與反應空間
      trackHeight = Math.min(clientHeight * 0.65, 520);
    } else {
      trackHeight = Math.min(clientHeight * 0.72, 460);
    }

    this.ceilingY = Math.max(70, Math.floor((this.height - trackHeight) / 2));
    this.floorY = this.ceilingY + trackHeight;

    this.player.ceilingY = this.ceilingY;
    this.player.floorY = this.floorY;
    this.level.ceilingY = this.ceilingY;
    this.level.floorY = this.floorY;
  }

  private setupInput(): void {
    this.input.onAction(async (pos) => {
      // 確保手勢解鎖音訊
      await this.audio.ensureUnlocked();

      // 檢查是否點擊右上角靜音按鈕
      if (pos && HUD.isMuteButtonClicked(pos.x, pos.y, this.width)) {
        const muted = this.audio.toggleMute();
        this.saveData.isMuted = muted;
        StorageManager.save(this.saveData);
        return;
      }

      if (this.state === 'TITLE') {
        this.startCountdown();
      } else if (this.state === 'COUNTDOWN') {
        // 倒數時再次點擊可直接秒進遊戲
        this.startGameplay();
      } else if (this.state === 'PLAYING') {
        this.triggerPlayerFlip();
      } else if (this.state === 'GAME_OVER') {
        this.startCountdown();
      }
    });
  }

  private triggerPlayerFlip(): void {
    const success = this.player.triggerFlip();
    if (success) {
      this.audio.playFlip(this.player.gravityDir === -1);
      const isUp = this.player.gravityDir === -1;
      this.particles.emitShockwave(
        this.player.x + this.player.width / 2,
        isUp ? this.floorY : this.ceilingY,
        isUp ? CONSTANTS.COLORS.CYAN : CONSTANTS.COLORS.MAGENTA
      );
    }
  }

  private startCountdown(): void {
    this.state = 'COUNTDOWN';
    this.countdownStep = 3;
    this.countdownTimer = 0.6;
    this.resetGameplayStats();
    this.audio.playBeep(440, 0.08);
  }

  private startGameplay(): void {
    this.state = 'PLAYING';
    this.audio.playBeep(880, 0.12);
    this.audio.startBGM();
  }

  private resetGameplayStats(): void {
    this.player.reset(this.ceilingY, this.floorY);
    this.level.reset(this.ceilingY, this.floorY);
    this.particles.reset();
    this.camera.reset();

    this.score = 0;
    this.currentSpeed = CONSTANTS.INITIAL_HORIZONTAL_SPEED;
    this.combo = 0;
    this.comboMeter = 0;
    this.maxCombo = 0;
    this.isNewRecord = false;
  }

  private getMultiplier(): number {
    if (this.combo >= 15) return 5.0; // Hyper Mode
    if (this.combo >= 10) return 3.0;
    if (this.combo >= 6) return 2.0;
    if (this.combo >= 3) return 1.5;
    return 1.0;
  }

  public update(dt: number): void {
    this.uiAnimTime += dt;

    if (this.state === 'COUNTDOWN') {
      this.countdownTimer -= dt;
      if (this.countdownTimer <= 0) {
        this.countdownStep--;
        if (this.countdownStep > 0) {
          this.countdownTimer = 0.6;
          this.audio.playBeep(440, 0.08);
        } else {
          this.startGameplay();
        }
      }
      return;
    }

    if (this.state !== 'PLAYING') {
      this.particles.update(dt);
      return;
    }

    // 檢查 Hit-Stop
    if (this.camera.isHitStopped()) {
      this.camera.update(dt, this.player.x);
      return;
    }

    this.currentSpeed = this.level.getCurrentSpeed();

    // 更新角色
    const { flipped } = this.player.update(dt, this.currentSpeed);
    if (flipped) {
      this.audio.playFlip(this.player.gravityDir === -1);
      const isUp = this.player.gravityDir === -1;
      this.particles.emitShockwave(
        this.player.x + this.player.width / 2,
        isUp ? this.floorY : this.ceilingY,
        isUp ? CONSTANTS.COLORS.CYAN : CONSTANTS.COLORS.MAGENTA
      );
    }

    // 更新關卡生成與障礙物
    this.level.update(dt, this.player.x);

    // 更新相機追隨
    const lookAhead = Math.min(320, this.width * 0.28);
    this.camera.update(dt, this.player.x, lookAhead);

    // 更新粒子
    this.particles.update(dt);
    if (Math.random() < 0.6) {
      this.particles.emitTrail(
        this.player.x,
        this.player.y + this.player.height / 2,
        this.getMultiplier() >= 5 ? CONSTANTS.COLORS.GOLD : CONSTANTS.COLORS.CYAN
      );
    }

    // 更新 Combo 衰退
    if (this.comboMeter > 0) {
      this.comboMeter -= CONSTANTS.COMBO_DECAY_RATE * dt;
      if (this.comboMeter <= 0) {
        this.comboMeter = 0;
        this.combo = 0;
      }
    }
    this.audio.setComboMultiplier(this.getMultiplier());

    // 行進得分
    this.score += (this.currentSpeed * dt * 0.1) * this.getMultiplier();

    // 碰撞與擦彈判定
    const playerHitbox = this.player.getHitbox();
    const playerNearMissBox = this.player.getNearMissBox();
    const obstacles = this.level.getActiveObstacles();

    for (const obs of obstacles) {
      if (!obs.active) continue;

      // 1. 致命碰撞
      if (obs.intersects(playerHitbox)) {
        this.handleGameOver();
        return;
      }

      // 2. 極限擦彈
      if (obs.checkNearMiss(playerNearMissBox, playerHitbox)) {
        this.handleNearMiss();
      }
    }

    // 能量晶體收集判定
    const shards = this.level.getActiveShards();
    for (const shard of shards) {
      if (shard.intersects(playerHitbox)) {
        shard.collected = true;
        this.handleCollectShard(shard.x, shard.y);
      }
    }
  }

  private handleNearMiss(): void {
    this.audio.playNearMiss();
    this.camera.addShake(2.5, 0.12);
    this.particles.emitNearMiss(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      CONSTANTS.COLORS.CYAN
    );

    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.comboMeter = Math.min(CONSTANTS.COMBO_MAX, this.comboMeter + CONSTANTS.COMBO_NEAR_MISS_ADD);
    this.score += CONSTANTS.NEAR_MISS_POINTS * this.getMultiplier();
  }

  private handleCollectShard(x: number, y: number): void {
    this.audio.playShard();
    this.particles.emitNearMiss(x, y, CONSTANTS.COLORS.GOLD);

    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    this.comboMeter = Math.min(CONSTANTS.COMBO_MAX, this.comboMeter + CONSTANTS.COMBO_SHARD_ADD);
    this.score += CONSTANTS.SHARD_POINTS * this.getMultiplier();
  }

  private handleGameOver(): void {
    this.state = 'GAME_OVER';
    this.audio.stopBGM();
    this.audio.playDeath();

    this.camera.triggerHitStop(0.06);
    this.camera.addShake(12, 0.4);

    this.particles.emitCyberShatter(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      this.player.gravityDir === 1 ? CONSTANTS.COLORS.CYAN : CONSTANTS.COLORS.MAGENTA
    );

    // 結算最高分與儲存
    const finalScore = Math.floor(this.score);
    this.saveData.totalRuns++;
    if (finalScore > this.saveData.highScore) {
      this.saveData.highScore = finalScore;
      this.isNewRecord = true;
    }
    if (this.maxCombo > this.saveData.highestCombo) {
      this.saveData.highestCombo = this.maxCombo;
    }
    StorageManager.save(this.saveData);
  }

  public render(_interpolation: number): void {
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;

    ctx.save();
    // 螢幕震動平移
    ctx.translate(this.camera.shakeX, this.camera.shakeY);

    const isHyper = this.getMultiplier() >= 5.0;

    // 1. 繪製背景與賽博網格
    this.background.render(
      ctx,
      this.camera.x,
      isHyper,
      this.ceilingY,
      this.floorY,
      width,
      height
    );

    // 2. 繪製發光導軌
    CanvasRenderer.renderTracks(
      ctx,
      this.ceilingY,
      this.floorY,
      width,
      this.camera.x,
      isHyper
    );

    // 3. 繪製障礙物
    for (const obs of this.level.getActiveObstacles()) {
      CanvasRenderer.renderObstacle(ctx, obs, this.camera.x);
    }

    // 4. 繪製晶體
    for (const shard of this.level.getActiveShards()) {
      CanvasRenderer.renderShard(ctx, shard, this.camera.x);
    }

    // 5. 繪製粒子
    this.particles.render(ctx, this.camera.x);

    // 6. 繪製玩家（在 GAME_OVER 碎裂後隱藏本體）
    if (this.state !== 'GAME_OVER') {
      CanvasRenderer.renderPlayer(ctx, this.player, this.camera.x, isHyper);
    }

    // 7. 繪製 HUD
    HUD.render(
      ctx,
      this.score,
      this.saveData.highScore,
      this.combo,
      this.comboMeter,
      this.currentSpeed,
      isHyper,
      this.audio.isMuted,
      width
    );

    // 8. 狀態畫面覆蓋 (Title / Countdown / GameOver)
    if (this.state === 'TITLE') {
      Screens.renderTitle(ctx, width, height, this.saveData.highScore, this.uiAnimTime);
    } else if (this.state === 'COUNTDOWN') {
      Screens.renderCountdown(ctx, width, height, this.countdownStep);
    } else if (this.state === 'GAME_OVER') {
      Screens.renderGameOver(
        ctx,
        width,
        height,
        this.score,
        this.saveData.highScore,
        this.maxCombo,
        this.isNewRecord,
        this.uiAnimTime
      );
    }

    ctx.restore();
  }
}
