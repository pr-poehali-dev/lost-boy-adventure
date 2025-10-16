import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { GameCanvas } from './GameCanvas';
import { GameState, Position } from '@/types/game';

interface GamePlayProps {
  gameState: GameState;
  isMobile: boolean;
  touchJoystick: {start: Position, current: Position} | null;
  onTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onRestart: () => void;
}

export function GamePlay({ 
  gameState, 
  isMobile, 
  touchJoystick, 
  onTouchStart, 
  onTouchMove, 
  onTouchEnd, 
  onRestart 
}: GamePlayProps) {
  return (
    <>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-white">
          <span className="text-lg">ОПАСНОСТЬ</span>
          <span className="text-lg font-bold">{Math.round(gameState.detectionLevel)}%</span>
        </div>
        <Progress 
          value={gameState.detectionLevel} 
          className="h-6 bg-[#2C1810] border-2 border-[#8B0000]"
        />
        {gameState.hiddenBehindTree && (
          <p className="text-green-400 text-center text-sm animate-pulse">
            <Icon name="TreePine" size={16} className="inline mr-2" />
            СПРЯТАЛСЯ ЗА ДЕРЕВОМ
          </p>
        )}
      </div>

      <GameCanvas
        gameState={gameState}
        isMobile={isMobile}
        touchJoystick={touchJoystick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
      
      {isMobile && !gameState.gameOver && (
        <div className="bg-[#1A1A1A] p-3 border-2 border-[#8B0000]">
          <p className="text-white text-center text-sm">
            📱 Нажми и веди пальцем по экрану для управления
          </p>
        </div>
      )}

      {gameState.gameOver && (
        <Card className="p-8 bg-[#2C1810] border-4 border-[#8B0000] text-center space-y-4">
          {gameState.survived ? (
            <>
              <h2 className="text-4xl font-bold text-green-400">ТЫ ВЫЖИЛ!</h2>
              <p className="text-xl text-white">Дима смог сбежать от лесника</p>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold text-[#8B0000]">ПОЙМАЛИ!</h2>
              <p className="text-xl text-white">Лесник нашёл Диму...</p>
            </>
          )}
          <Button 
            onClick={onRestart}
            className="w-full h-12 text-xl font-bold bg-[#8B0000] hover:bg-[#6B0000] border-4 border-black"
          >
            ИГРАТЬ СНОВА
          </Button>
        </Card>
      )}
    </>
  );
}