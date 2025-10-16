import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Difficulty, GameMode, DIFFICULTY_SETTINGS } from '@/types/game';

interface GameMenuProps {
  difficulty: Difficulty;
  gameMode: GameMode;
  isMobile: boolean;
  currentView: 'menu' | 'stats' | 'leaderboard' | 'history';
  onDifficultyChange: (d: Difficulty) => void;
  onGameModeChange: (m: GameMode) => void;
  onStartGame: () => void;
  onViewChange: (view: 'menu' | 'stats' | 'leaderboard' | 'history') => void;
}

export function GameMenu({ 
  difficulty, 
  gameMode, 
  isMobile, 
  currentView, 
  onDifficultyChange, 
  onGameModeChange, 
  onStartGame,
  onViewChange 
}: GameMenuProps) {
  return (
    <Card className="p-8 bg-[#2C1810] border-4 border-[#8B0000] space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold text-[#8B0000] tracking-wider">ПОБЕГ ДИМЫ</h1>
        <p className="text-white text-lg">Сбеги от лесника в темном лесу</p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-white font-bold mb-3 text-center">ВЫБЕРИ СЛОЖНОСТЬ</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onDifficultyChange('easy')}
              variant={difficulty === 'easy' ? 'default' : 'outline'}
              className={`font-bold ${
                difficulty === 'easy'
                  ? 'bg-[#8B0000] hover:bg-[#6B0000] text-white'
                  : 'bg-[#1A1A1A] text-gray-300 border-[#8B0000]'
              }`}
            >
              🟢 Легко
            </Button>
            <Button
              onClick={() => onDifficultyChange('normal')}
              variant={difficulty === 'normal' ? 'default' : 'outline'}
              className={`font-bold ${
                difficulty === 'normal'
                  ? 'bg-[#8B0000] hover:bg-[#6B0000] text-white'
                  : 'bg-[#1A1A1A] text-gray-300 border-[#8B0000]'
              }`}
            >
              🟡 Нормал
            </Button>
            <Button
              onClick={() => onDifficultyChange('hard')}
              variant={difficulty === 'hard' ? 'default' : 'outline'}
              className={`font-bold ${
                difficulty === 'hard'
                  ? 'bg-[#8B0000] hover:bg-[#6B0000] text-white'
                  : 'bg-[#1A1A1A] text-gray-300 border-[#8B0000]'
              }`}
            >
              🟠 Сложно
            </Button>
            <Button
              onClick={() => onDifficultyChange('nightmare')}
              variant={difficulty === 'nightmare' ? 'default' : 'outline'}
              className={`font-bold ${
                difficulty === 'nightmare'
                  ? 'bg-[#8B0000] hover:bg-[#6B0000] text-white'
                  : 'bg-[#1A1A1A] text-gray-300 border-[#8B0000]'
              }`}
            >
              🔴 Кошмар
            </Button>
          </div>
        </div>

        <div>
          <p className="text-white font-bold mb-3 text-center">РЕЖИМ ИГРЫ</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onGameModeChange('day')}
              variant={gameMode === 'day' ? 'default' : 'outline'}
              className={`text-sm font-bold ${
                gameMode === 'day'
                  ? 'bg-[#8B0000] hover:bg-[#6B0000] text-white'
                  : 'bg-[#1A1A1A] text-gray-300 border-[#8B0000]'
              }`}
            >
              ☀️ День
            </Button>
            <Button
              onClick={() => onGameModeChange('night')}
              variant={gameMode === 'night' ? 'default' : 'outline'}
              className={`text-sm font-bold ${
                gameMode === 'night'
                  ? 'bg-[#8B0000] hover:bg-[#6B0000] text-white'
                  : 'bg-[#1A1A1A] text-gray-300 border-[#8B0000]'
              }`}
            >
              🌙 Ночь
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-[#1A1A1A] p-4 border-2 border-[#8B0000] text-white text-sm space-y-2">
        <div className="flex justify-between">
          <span>Скорость лесника:</span>
          <span className="font-bold">{DIFFICULTY_SETTINGS[difficulty].keeperSpeed}x</span>
        </div>
        <div className="flex justify-between">
          <span>Обнаружение:</span>
          <span className="font-bold">{DIFFICULTY_SETTINGS[difficulty].detectionRate}x</span>
        </div>
        <div className="flex justify-between">
          <span>Время выживания:</span>
          <span className="font-bold">{DIFFICULTY_SETTINGS[difficulty].surviveTime}с</span>
        </div>
        {gameMode === 'night' && (
          <div className="flex justify-between text-yellow-400">
            <span>Видимость:</span>
            <span className="font-bold">Ограничена</span>
          </div>
        )}
      </div>

      <div className="bg-[#1A1A1A] p-4 border-2 border-[#8B0000]">
        <p className="text-white text-center mb-2 font-bold">УПРАВЛЕНИЕ</p>
        <p className="text-gray-300 text-center">
          {isMobile ? '📱 Сенсорный экран — веди пальцем' : 'W A S D или Ц Ф Ы В — движение'}
        </p>
      </div>

      <Button 
        onClick={onStartGame}
        className="w-full h-16 text-2xl font-bold bg-[#8B0000] hover:bg-[#6B0000] border-4 border-black"
      >
        НАЧАТЬ ИГРУ
      </Button>
      
      <div className="grid grid-cols-3 gap-2">
        <Button 
          onClick={() => onViewChange('stats')}
          variant="outline"
          className={`font-bold ${currentView === 'stats' ? 'bg-[#8B0000] text-white' : 'bg-[#1A1A1A] text-gray-300 border-[#8B0000]'}`}
        >
          📊 Статы
        </Button>
        <Button 
          onClick={() => onViewChange('leaderboard')}
          variant="outline"
          className={`font-bold ${currentView === 'leaderboard' ? 'bg-[#8B0000] text-white' : 'bg-[#1A1A1A] text-gray-300 border-[#8B0000]'}`}
        >
          🏆 ТОП
        </Button>
        <Button 
          onClick={() => onViewChange('history')}
          variant="outline"
          className={`font-bold ${currentView === 'history' ? 'bg-[#8B0000] text-white' : 'bg-[#1A1A1A] text-gray-300 border-[#8B0000]'}`}
        >
          📜 Игры
        </Button>
      </div>
    </Card>
  );
}