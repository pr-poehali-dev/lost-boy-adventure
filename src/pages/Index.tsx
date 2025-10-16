import { useState } from 'react';
import { GameMenu } from '@/components/game/GameMenu';
import { GamePlay } from '@/components/game/GamePlay';
import { GameStats } from '@/components/game/GameStats';
import { Leaderboard } from '@/components/game/Leaderboard';
import { GameHistory } from '@/components/game/GameHistory';
import { useGameLogic } from '@/hooks/useGameLogic';

export default function Index() {
  const [currentView, setCurrentView] = useState<'menu' | 'stats' | 'leaderboard' | 'history'>('menu');
  
  const {
    gameState,
    difficulty,
    gameMode,
    stats,
    achievements,
    gameHistory,
    leaderboard,
    pendingScore,
    isMobile,
    touchJoystick,
    setDifficulty,
    setGameMode,
    startGame,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    submitToLeaderboard,
    clearHistory,
  } = useGameLogic();

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {!gameState.gameStarted ? (
          <>
            <GameMenu
              difficulty={difficulty}
              gameMode={gameMode}
              isMobile={isMobile}
              currentView={currentView}
              onDifficultyChange={setDifficulty}
              onGameModeChange={setGameMode}
              onStartGame={startGame}
              onViewChange={setCurrentView}
            />
            
            {currentView === 'stats' && (
              <div className="mt-4">
                <GameStats stats={stats} achievements={achievements} />
              </div>
            )}
            
            {currentView === 'leaderboard' && (
              <div className="mt-4">
                <Leaderboard 
                  entries={leaderboard} 
                  canSubmit={!!pendingScore}
                  onSubmitScore={submitToLeaderboard}
                />
              </div>
            )}
            
            {currentView === 'history' && (
              <div className="mt-4">
                <GameHistory 
                  records={gameHistory}
                  onClearHistory={clearHistory}
                />
              </div>
            )}
          </>
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
      </div>
    </div>
  );
}
