import type { Game } from './types';

interface Point { x: number; y: number; }

export class SnakeGame implements Game {
  title = "NEON SNAKE";
  desc = "Usa las flechas para comer. No choques.";
  
  private grid = 15;
  private snake: Point[] = [];
  private food: Point = { x: 0, y: 0 };
  private dx = 0;
  private dy = 0;
  private score = 0;
  private gameOver = false;

  init(): void {
    this.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    this.dx = 1;
    this.dy = 0;
    this.score = 0;
    this.gameOver = false;
    this.generateFood();
  }

  private generateFood(): void {
    const tiles = 300 / this.grid;
    this.food = {
      x: Math.floor(Math.random() * tiles),
      y: Math.floor(Math.random() * tiles)
    };
    
    for (const part of this.snake) {
      if (part.x === this.food.x && part.y === this.food.y) {
        this.generateFood();
        return;
      }
    }
  }

  update(): void {
    if (this.gameOver) return;

    const head = { 
      x: this.snake[0].x + this.dx, 
      y: this.snake[0].y + this.dy 
    };
    const tiles = 300 / this.grid;

    if (head.x < 0 || head.x >= tiles || head.y < 0 || head.y >= tiles) {
      this.gameOver = true;
      return;
    }

    for (const part of this.snake) {
      if (head.x === part.x && head.y === part.y) {
        this.gameOver = true;
        return;
      }
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.generateFood();
    } else {
      this.snake.pop();
    }
  }

  draw(ctx: CanvasRenderingContext2D, canvasSize: number): void {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(
      this.food.x * this.grid,
      this.food.y * this.grid,
      this.grid - 2,
      this.grid - 2
    );

    ctx.fillStyle = '#00ff00';
    this.snake.forEach(p => {
      ctx.fillRect(
        p.x * this.grid,
        p.y * this.grid,
        this.grid - 2,
        this.grid - 2
      );
    });
  }

  input(key: string): void {
    if (key === 'ArrowLeft' && this.dx !== 1) {
      this.dx = -1;
      this.dy = 0;
    }
    if (key === 'ArrowRight' && this.dx !== -1) {
      this.dx = 1;
      this.dy = 0;
    }
    if (key === 'ArrowUp' && this.dy !== 1) {
      this.dx = 0;
      this.dy = -1;
    }
    if (key === 'ArrowDown' && this.dy !== -1) {
      this.dx = 0;
      this.dy = 1;
    }
  }

  getScore(): number {
    return this.score;
  }

  isGameOver(): boolean {
    return this.gameOver;
  }
}