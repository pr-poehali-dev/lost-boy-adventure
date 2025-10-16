import { useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { GameState, Position, CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SIZE, KEEPER_SIZE, TREE_SIZE, DIFFICULTY_SETTINGS, trees } from '@/types/game';

interface GameCanvasProps {
  gameState: GameState;
  isMobile: boolean;
  touchJoystick: {start: Position, current: Position} | null;
  onTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLCanvasElement>) => void;
}

export function GameCanvas({ gameState, isMobile, touchJoystick, onTouchStart, onTouchMove, onTouchEnd }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    
    const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
    const isNightMode = gameState.mode === 'night';

    ctx.fillStyle = isNightMode ? '#0a0a0a' : '#1A1A1A';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (isNightMode) {
      const visionGradient = ctx.createRadialGradient(
        gameState.playerPos.x + PLAYER_SIZE / 2,
        gameState.playerPos.y + PLAYER_SIZE / 2,
        0,
        gameState.playerPos.x + PLAYER_SIZE / 2,
        gameState.playerPos.y + PLAYER_SIZE / 2,
        settings.visionRadius
      );
      visionGradient.addColorStop(0, 'rgba(26, 26, 26, 0)');
      visionGradient.addColorStop(0.7, 'rgba(10, 10, 10, 0.8)');
      visionGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = visionGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    trees.forEach(tree => {
      const distanceToPlayer = Math.sqrt(
        Math.pow(gameState.playerPos.x + PLAYER_SIZE / 2 - tree.x, 2) +
        Math.pow(gameState.playerPos.y + PLAYER_SIZE / 2 - tree.y, 2)
      );
      const inVision = !isNightMode || distanceToPlayer < settings.visionRadius;

      if (inVision) {
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.moveTo(tree.x, tree.y - TREE_SIZE / 2);
        ctx.lineTo(tree.x - TREE_SIZE / 3, tree.y + TREE_SIZE / 2);
        ctx.lineTo(tree.x + TREE_SIZE / 3, tree.y + TREE_SIZE / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#4a3228';
        ctx.fillRect(tree.x - 5, tree.y + TREE_SIZE / 2, 10, 15);
      }
    });

    const drawKeeper = (keeperPos: Position) => {
      const keeperDistanceToPlayer = Math.sqrt(
        Math.pow(gameState.playerPos.x + PLAYER_SIZE / 2 - keeperPos.x, 2) +
        Math.pow(gameState.playerPos.y + PLAYER_SIZE / 2 - keeperPos.y, 2)
      );
      const keeperInVision = !isNightMode || keeperDistanceToPlayer < settings.visionRadius;

      if (keeperInVision) {
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(
          keeperPos.x - KEEPER_SIZE / 2,
          keeperPos.y - KEEPER_SIZE / 2,
          KEEPER_SIZE,
          KEEPER_SIZE
        );
        
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(
          keeperPos.x - KEEPER_SIZE / 4,
          keeperPos.y - KEEPER_SIZE / 2 + 5,
          KEEPER_SIZE / 2,
          5
        );
      }
    };

    drawKeeper(gameState.forestKeeperPos);
    if (gameState.forestKeeperPos2) {
      drawKeeper(gameState.forestKeeperPos2);
    }

    ctx.fillStyle = gameState.hiddenBehindTree ? '#4CAF50' : '#4169E1';
    ctx.fillRect(
      gameState.playerPos.x,
      gameState.playerPos.y,
      PLAYER_SIZE,
      PLAYER_SIZE
    );

    ctx.strokeStyle = gameState.hiddenBehindTree ? '#45a049' : '#2E5CB8';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      gameState.playerPos.x,
      gameState.playerPos.y,
      PLAYER_SIZE,
      PLAYER_SIZE
    );
  }, [gameState]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full border-4 border-[#8B0000] bg-[#1A1A1A] pixel-art touch-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
      <div className="absolute top-4 right-4 bg-black/80 px-4 py-2 border-2 border-[#8B0000] space-y-1">
        <p className="text-white font-bold text-xl">
          <Icon name="Clock" size={20} className="inline mr-2" />
          {Math.floor(gameState.time)}s / {DIFFICULTY_SETTINGS[gameState.difficulty].surviveTime}s
        </p>
        <p className="text-xs text-gray-400 text-center">
          {gameState.mode === 'night' ? '🌙 Ночь' : '☀️ День'} • {
            gameState.difficulty === 'easy' ? '🟢 Легко' :
            gameState.difficulty === 'normal' ? '🟡 Нормал' :
            gameState.difficulty === 'hard' ? '🟠 Сложно' :
            gameState.difficulty === 'nightmare' ? '🔴 Кошмар' :
            '💀 Хардкор'
          }
        </p>
      </div>
      {isMobile && !gameState.gameOver && touchJoystick && (
        <>
          <div 
            className="absolute pointer-events-none"
            style={{
              left: `${(touchJoystick.start.x / CANVAS_WIDTH) * 100}%`,
              top: `${(touchJoystick.start.y / CANVAS_HEIGHT) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-white/20"></div>
            </div>
          </div>
          <div 
            className="absolute pointer-events-none"
            style={{
              left: `${(touchJoystick.current.x / CANVAS_WIDTH) * 100}%`,
              top: `${(touchJoystick.current.y / CANVAS_HEIGHT) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-12 h-12 rounded-full bg-white/80 border-4 border-[#8B0000] shadow-lg"></div>
          </div>
        </>
      )}
    </div>
  );
}