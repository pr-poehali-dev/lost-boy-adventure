import { GameMenu } from '@/components/game/GameMenu';
import { GamePlay } from '@/components/game/GamePlay';
import { GameStats } from '@/components/game/GameStats';
import { useGameLogic } from '@/hooks/useGameLogic';

export default function Index() {
  const {
    gameState,
    difficulty,
    gameMode,
    showStats,
    stats,
    achievements,
    isMobile,
    touchJoystick,
    setDifficulty,
    setGameMode,
    setShowStats,
    startGame,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useGameLogic();

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {!gameState.gameStarted ? (
          <GameMenu
            difficulty={difficulty}
            gameMode={gameMode}
            isMobile={isMobile}
            showStats={showStats}
            onDifficultyChange={setDifficulty}
            onGameModeChange={setGameMode}
            onStartGame={startGame}
            onToggleStats={() => setShowStats(!showStats)}
          />
        ) : (
          <GamePlay
            gameState={gameState}
            isMobile={isMobile}
            touchJoystick={touchJoystick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onRestart={startGame}
          />
        )}
        
        {showStats && !gameState.gameStarted && (
          <div className="mt-4">
            <GameStats stats={stats} achievements={achievements} />
          </div>
        )}
      </div>
    </div>
  );
}
