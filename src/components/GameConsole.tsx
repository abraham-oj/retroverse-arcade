import { useEffect, useRef, useState } from 'react';
import { SnakeGame } from '../games/snake';
import { BreakoutGame } from '../games/breakout';
import { PacmanGame } from '../games/pacman';
import { SpaceGame } from '../games/space';
import { sounds } from '../utils/sounds';
import { Gamepad2, Volume2, VolumeX } from 'lucide-react';
import type { Game } from '../games/types';

interface GameConsoleProps {
  selectedGame: string;
}

const CANVAS_SIZE = 300;

export default function GameConsole({ selectedGame }: GameConsoleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [overlayTitle, setOverlayTitle] = useState('READY PLAYER 1');
  const [gameTitle, setGameTitle] = useState('NEON SNAKE');
  const [gameDesc, setGameDesc] = useState('Usa las flechas para comer y crecer.');

  const [soundEnabled, setSoundEnabled] = useState(true);

  // Cargar juego cuando cambia la selección
  useEffect(() => {
    loadGame(selectedGame);
    
    // Escuchar eventos de selección de juego desde Astro
    const handleGameSelect = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        loadGame(customEvent.detail);
      }
    };
    
    window.addEventListener('selectGame', handleGameSelect);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('selectGame', handleGameSelect);
    };
  }, [selectedGame]);

  const loadGame = (gameId: string) => {
    stopGame();
    
    // Cargar juego según ID
    switch(gameId) {
      case 'snake':
        gameRef.current = new SnakeGame();
        break;
      case 'breakout':
        gameRef.current = new BreakoutGame();
        break;
      case 'pacman':
        gameRef.current = new PacmanGame();
        break;
      case 'space':
        gameRef.current = new SpaceGame();
        break;
      default:
        gameRef.current = new SnakeGame();
    }
    
    if (gameRef.current) {
      setGameTitle(gameRef.current.title);
      setGameDesc(gameRef.current.desc);
    }
    
    resetGameUI();
  };

  const resetGameUI = () => {
    setIsPlaying(false);
    setShowOverlay(true);
    setOverlayTitle('READY?');
    
    if (gameRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        gameRef.current.init();
        gameRef.current.draw(ctx, CANVAS_SIZE);
      }
    }
  };

  const startGame = () => {
    if (isPlaying || !gameRef.current) return;
    
    setScore(0);
    
    const hsKey = `${selectedGame}HighScore`;
    const savedHS = localStorage.getItem(hsKey);
    setHighScore(savedHS ? parseInt(savedHS) : 0);

    gameRef.current.init();
    setShowOverlay(false);
    setIsPlaying(true);

    // Sonido de inicio
    if (soundEnabled) sounds.start();

    intervalRef.current = window.setInterval(() => {
      if (!gameRef.current || !canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      gameRef.current.update();
      gameRef.current.draw(ctx, CANVAS_SIZE);

      if (gameRef.current.getScore) {
        const newScore = gameRef.current.getScore();
        if (newScore > score && soundEnabled) {
          sounds.eat();
        }
        setScore(newScore);
      }

      if (gameRef.current.isGameOver && gameRef.current.isGameOver()) {
        handleGameOver();
      }
    }, 60);
  };

  const stopGame = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleGameOver = (win = false) => {
    stopGame();
    
    // Sonidos
    if (soundEnabled) {
      if (win) sounds.victory();
      else sounds.gameOver();
    }
    
    const hsKey = `${selectedGame}HighScore`;
    const currentHS = localStorage.getItem(hsKey);
    const currentHSNum = currentHS ? parseInt(currentHS) : 0;
    
    if (score > currentHSNum) {
      localStorage.setItem(hsKey, score.toString());
      setHighScore(score);
    }

    setOverlayTitle(win ? '¡VICTORIA!' : 'GAME OVER');
    setShowOverlay(true);
  };

  // Manejador de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
        if (isPlaying && gameRef.current) {
          gameRef.current.input(e.key);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const handleMobileInput = (dir: string) => {
    if (!isPlaying || !gameRef.current) return;
    
    const keyMap: Record<string, string> = {
      UP: 'ArrowUp',
      DOWN: 'ArrowDown',
      LEFT: 'ArrowLeft',
      RIGHT: 'ArrowRight'
    };
    
    gameRef.current.input(keyMap[dir]);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <h2 className="text-2xl md:text-3xl text-green-400 pixel-font mb-2">
          {gameTitle}
        </h2>
        <p className="text-gray-400 text-sm md:text-base">{gameDesc}</p>
      </div>

      <div className="bg-black border-4 border-gray-700 p-2 rounded-lg shadow-2xl relative inline-block">
        <div className="flex justify-between items-center bg-gray-800 p-2 mb-2 font-mono text-xl border-b-2 border-gray-700">
          <span className="text-cyan-400">PTS: <span>{score}</span></span>
          <button
            onClick={() => {
              const newState = sounds.toggle();
              setSoundEnabled(newState);
            }}
            className="p-1 hover:bg-gray-700 rounded transition"
            title={soundEnabled ? 'Silenciar' : 'Activar sonido'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-green-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-red-400" />
            )}
          </button>
          <span className="text-pink-500">HI: <span>{highScore}</span></span>
        </div>

        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="border-2 border-green-900 bg-black block mx-auto"
          style={{ imageRendering: 'pixelated' }}
        />

        {showOverlay && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center z-20">
            <h3 className="text-cyan-400 pixel-font text-lg mb-4">
              {overlayTitle}
            </h3>
            <button
              onClick={startGame}
              className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 pixel-font text-xs rounded arcade-btn"
            >
              START GAME
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="mt-6 grid grid-cols-3 gap-2 md:hidden max-w-[200px] select-none">
        <div></div>
        <button
          onClick={() => handleMobileInput('UP')}
          className="bg-gray-800 p-4 rounded active:bg-gray-700 border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 flex justify-center"
        >
          ▲
        </button>
        <div></div>
        <button
          onClick={() => handleMobileInput('LEFT')}
          className="bg-gray-800 p-4 rounded active:bg-gray-700 border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 flex justify-center"
        >
          ◄
        </button>
        <button
          onClick={() => handleMobileInput('DOWN')}
          className="bg-gray-800 p-4 rounded active:bg-gray-700 border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 flex justify-center"
        >
          ▼
        </button>
        <button
          onClick={() => handleMobileInput('RIGHT')}
          className="bg-gray-800 p-4 rounded active:bg-gray-700 border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 flex justify-center"
        >
          ►
        </button>
      </div>

      <p className="mt-4 text-gray-500 text-sm md:block hidden">
        [FLECHAS] Mover • [ESPACIO] Disparar (Si aplica)
      </p>
    </div>
  );
}