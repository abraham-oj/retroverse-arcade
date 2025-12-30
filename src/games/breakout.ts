import type { Game } from './types';

interface Brick {
  x: number;
  y: number;
  status: number;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export class BreakoutGame implements Game {
  title = "BRICK BREAKER";
  desc = "Rebota la bola. Destruye los ladrillos.";

  private paddleX = 125;
  private ball: Ball = { x: 150, y: 200, dx: 3, dy: -3 };
  private bricks: Brick[] = [];
  private score = 0;
  private gameOver = false;
  private win = false;

  init(): void {
    this.paddleX = 125;
    this.ball = { x: 150, y: 200, dx: 3, dy: -3 };
    this.bricks = [];
    this.score = 0;
    this.gameOver = false;
    this.win = false;

    // Crear ladrillos
    for (let c = 0; c < 5; c++) {
      for (let r = 0; r < 4; r++) {
        this.bricks.push({
          x: c * 60 + 5,
          y: r * 25 + 30,
          status: 1
        });
      }
    }
  }

  update(): void {
    if (this.gameOver) return;

    // Mover bola
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // Rebote en paredes laterales
    if (this.ball.x > 295 || this.ball.x < 5) {
      this.ball.dx *= -1;
    }

    // Rebote en techo
    if (this.ball.y < 5) {
      this.ball.dy *= -1;
    }

    // Rebote en pala
    if (
      this.ball.y > 275 &&
      this.ball.y < 285 &&
      this.ball.x > this.paddleX &&
      this.ball.x < this.paddleX + 50
    ) {
      this.ball.dy *= -1;
      // Efecto de ángulo según donde golpee
      this.ball.dx = 0.15 * (this.ball.x - (this.paddleX + 25));
    }

    // Perder bola
    if (this.ball.y > 300) {
      this.gameOver = true;
      return;
    }

    // Colisión con ladrillos
    for (const brick of this.bricks) {
      if (brick.status === 1) {
        if (
          this.ball.x > brick.x &&
          this.ball.x < brick.x + 50 &&
          this.ball.y > brick.y &&
          this.ball.y < brick.y + 20
        ) {
          this.ball.dy *= -1;
          brick.status = 0;
          this.score += 10;
        }
      }
    }

    // Verificar victoria
    if (this.bricks.every(b => b.status === 0)) {
      this.gameOver = true;
      this.win = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, canvasSize: number): void {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Pala
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(this.paddleX, 280, 50, 8);

    // Bola
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Ladrillos
    this.bricks.forEach(brick => {
      if (brick.status === 1) {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(brick.x, brick.y, 50, 20);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(brick.x, brick.y, 50, 20);
      }
    });
  }

  input(key: string): void {
    if (key === 'ArrowLeft' && this.paddleX > 0) {
      this.paddleX -= 25;
    }
    if (key === 'ArrowRight' && this.paddleX < 250) {
      this.paddleX += 25;
    }
  }

  getScore(): number {
    return this.score;
  }

  isGameOver(): boolean {
    return this.gameOver;
  }
}