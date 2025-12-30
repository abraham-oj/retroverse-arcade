import type { Game } from './types';

interface Point { x: number; y: number; }
interface Enemy extends Point { timer: number; }

export class PacmanGame implements Game {
  title = "PAC-GHOST";
  desc = "Come todos los puntos amarillos. ¡Huye del rojo!";

  private grid = 20;
  private player: Point = { x: 1, y: 1 };
  private enemy: Enemy = { x: 13, y: 13, timer: 0 };
  private dots: Point[] = [];
  private score = 0;
  private gameOver = false;
  private win = false;
  private mouthOpen = true;
  private animTimer = 0;

  init(): void {
    this.player = { x: 1, y: 1 };
    this.enemy = { x: 13, y: 13, timer: 0 };
    this.dots = [];
    this.score = 0;
    this.gameOver = false;
    this.win = false;
    this.mouthOpen = true;
    this.animTimer = 0;

    // Generar grid de puntos
    const tiles = 300 / this.grid;
    for (let y = 1; y < tiles - 1; y += 2) {
      for (let x = 1; x < tiles - 1; x += 2) {
        this.dots.push({ x, y });
      }
    }
  }

  update(): void {
    if (this.gameOver) return;

    // Animación de boca
    this.animTimer++;
    if (this.animTimer > 10) {
      this.mouthOpen = !this.mouthOpen;
      this.animTimer = 0;
    }

    // Mover enemigo hacia jugador
    this.enemy.timer++;
    if (this.enemy.timer > 15) {
      this.enemy.timer = 0;
      
      if (this.player.x > this.enemy.x) this.enemy.x++;
      else if (this.player.x < this.enemy.x) this.enemy.x--;
      
      if (this.player.y > this.enemy.y) this.enemy.y++;
      else if (this.player.y < this.enemy.y) this.enemy.y--;
    }

    // Colisión con enemigo
    if (this.player.x === this.enemy.x && this.player.y === this.enemy.y) {
      this.gameOver = true;
      return;
    }

    // Comer puntos
    for (let i = 0; i < this.dots.length; i++) {
      if (this.dots[i].x === this.player.x && this.dots[i].y === this.player.y) {
        this.dots.splice(i, 1);
        this.score += 5;
        
        // Victoria si comió todos los puntos
        if (this.dots.length === 0) {
          this.gameOver = true;
          this.win = true;
        }
        break;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, canvasSize: number): void {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Puntos
    ctx.fillStyle = '#ffff00';
    this.dots.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x * this.grid + 10, d.y * this.grid + 10, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player (Pac-Man)
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    if (this.mouthOpen) {
      ctx.arc(
        this.player.x * this.grid + 10,
        this.player.y * this.grid + 10,
        8,
        0.2 * Math.PI,
        1.8 * Math.PI
      );
      ctx.lineTo(this.player.x * this.grid + 10, this.player.y * this.grid + 10);
    } else {
      ctx.arc(
        this.player.x * this.grid + 10,
        this.player.y * this.grid + 10,
        8,
        0,
        Math.PI * 2
      );
    }
    ctx.fill();

    // Enemigo (Fantasma)
    ctx.fillStyle = '#ff0000';
    const ex = this.enemy.x * this.grid;
    const ey = this.enemy.y * this.grid;
    
    // Cuerpo del fantasma
    ctx.beginPath();
    ctx.arc(ex + 10, ey + 8, 8, Math.PI, 0);
    ctx.lineTo(ex + 18, ey + 18);
    ctx.lineTo(ex + 15, ey + 14);
    ctx.lineTo(ex + 10, ey + 18);
    ctx.lineTo(ex + 5, ey + 14);
    ctx.lineTo(ex + 2, ey + 18);
    ctx.closePath();
    ctx.fill();

    // Ojos del fantasma
    ctx.fillStyle = 'white';
    ctx.fillRect(ex + 5, ey + 6, 4, 4);
    ctx.fillRect(ex + 11, ey + 6, 4, 4);
    ctx.fillStyle = 'black';
    ctx.fillRect(ex + 6, ey + 7, 2, 2);
    ctx.fillRect(ex + 12, ey + 7, 2, 2);
  }

  input(key: string): void {
    const tiles = 300 / this.grid;
    let nextX = this.player.x;
    let nextY = this.player.y;

    if (key === 'ArrowLeft') nextX--;
    if (key === 'ArrowRight') nextX++;
    if (key === 'ArrowUp') nextY--;
    if (key === 'ArrowDown') nextY++;

    // Verificar límites
    if (nextX >= 0 && nextX < tiles && nextY >= 0 && nextY < tiles) {
      this.player = { x: nextX, y: nextY };
    }
  }

  getScore(): number {
    return this.score;
  }

  isGameOver(): boolean {
    return this.gameOver;
  }
}