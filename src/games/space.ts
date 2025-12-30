import type { Game } from './types';

interface Bullet { x: number; y: number; }
interface Enemy { x: number; y: number; }

export class SpaceGame implements Game {
  title = "GALACTIC DEFENDER";
  desc = "Flechas: Mover. Espacio: Disparar.";

  private playerX = 135;
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private enemyDir = 1;
  private score = 0;
  private gameOver = false;
  private win = false;
  private canShoot = true;
  private shootCooldown = 0;

  init(): void {
    this.playerX = 135;
    this.bullets = [];
    this.enemies = [];
    this.enemyDir = 1;
    this.score = 0;
    this.gameOver = false;
    this.win = false;
    this.canShoot = true;
    this.shootCooldown = 0;

    // Crear filas de enemigos
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        this.enemies.push({
          x: 40 + col * 40,
          y: 30 + row * 30
        });
      }
    }
  }

  update(): void {
    if (this.gameOver) return;

    // Cooldown de disparo
    if (!this.canShoot) {
      this.shootCooldown++;
      if (this.shootCooldown > 10) {
        this.canShoot = true;
        this.shootCooldown = 0;
      }
    }

    // Mover balas
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      this.bullets[i].y -= 5;
      if (this.bullets[i].y < 0) {
        this.bullets.splice(i, 1);
      }
    }

    // Mover enemigos
    let hitWall = false;
    this.enemies.forEach(e => {
      e.x += 1 * this.enemyDir;
      if (e.x > 280 || e.x < 0) {
        hitWall = true;
      }
    });

    // Si tocaron pared, cambiar dirección y bajar
    if (hitWall) {
      this.enemyDir *= -1;
      this.enemies.forEach(e => e.y += 10);
    }

    // Colisiones bala-enemigo
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (
          b.x > e.x &&
          b.x < e.x + 20 &&
          b.y > e.y &&
          b.y < e.y + 20
        ) {
          this.enemies.splice(j, 1);
          this.bullets.splice(i, 1);
          this.score += 20;
          break;
        }
      }
    }

    // Verificar victoria
    if (this.enemies.length === 0) {
      this.gameOver = true;
      this.win = true;
      return;
    }

    // Game Over si enemigos llegan abajo
    for (const e of this.enemies) {
      if (e.y > 270) {
        this.gameOver = true;
        return;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, canvasSize: number): void {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Estrellas de fondo
    ctx.fillStyle = 'white';
    for (let i = 0; i < 20; i++) {
      const x = (i * 37) % canvasSize;
      const y = (i * 67) % canvasSize;
      ctx.fillRect(x, y, 1, 1);
    }

    // Jugador (Nave)
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(this.playerX, 280);
    ctx.lineTo(this.playerX + 15, 295);
    ctx.lineTo(this.playerX - 15, 295);
    ctx.fill();

    // Balas
    ctx.fillStyle = '#ffff00';
    this.bullets.forEach(b => {
      ctx.fillRect(b.x - 2, b.y, 4, 10);
    });

    // Enemigos
    this.enemies.forEach(e => {
      // Cuerpo del alien
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(e.x, e.y, 20, 20);
      
      // Ojos
      ctx.fillStyle = 'black';
      ctx.fillRect(e.x + 4, e.y + 5, 4, 4);
      ctx.fillRect(e.x + 12, e.y + 5, 4, 4);
      
      // Antenas
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(e.x + 2, e.y - 3, 2, 3);
      ctx.fillRect(e.x + 16, e.y - 3, 2, 3);
      ctx.fillRect(e.x + 1, e.y - 5, 3, 2);
      ctx.fillRect(e.x + 16, e.y - 5, 3, 2);
    });

    // Indicador de cooldown
    if (!this.canShoot) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(this.playerX - 15, 297, 30, 2);
    }
  }

  input(key: string): void {
    if (key === 'ArrowLeft' && this.playerX > 20) {
      this.playerX -= 15;
    }
    if (key === 'ArrowRight' && this.playerX < 280) {
      this.playerX += 15;
    }
    if ((key === ' ' || key === 'Space') && this.canShoot) {
      this.bullets.push({ x: this.playerX, y: 275 });
      this.canShoot = false;
    }
  }

  getScore(): number {
    return this.score;
  }

  isGameOver(): boolean {
    return this.gameOver;
  }
}