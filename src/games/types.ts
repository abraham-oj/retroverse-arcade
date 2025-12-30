export interface Game {
  title: string;
  desc: string;
  init: () => void;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D, canvasSize: number) => void;
  input: (key: string) => void;
  getScore?: () => number;
  isGameOver?: () => boolean;
  isWin?: () => boolean;
}

export interface GameMetadata {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  displayName: string;
}

export const GAME_METADATA: GameMetadata[] = [
  {
    id: 'snake',
    title: 'NEON SNAKE',
    description: 'Clásico atemporal.',
    color: 'green',
    icon: 'text',
    displayName: 'SNAKE'
  },
  {
    id: 'pacman',
    title: 'PAC-GHOST',
    description: 'Come los puntos.',
    color: 'yellow',
    icon: 'ghost',
    displayName: 'PAC-GHOST'
  },
  {
    id: 'space',
    title: 'GALACTIC',
    description: 'Defiende la tierra.',
    color: 'cyan',
    icon: 'rocket',
    displayName: 'GALACTIC'
  },
  {
    id: 'breakout',
    title: 'BREAKER',
    description: 'Rompe los muros.',
    color: 'pink',
    icon: 'bricks',
    displayName: 'BREAKER'
  }
];