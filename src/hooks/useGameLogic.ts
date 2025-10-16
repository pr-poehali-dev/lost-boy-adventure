import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  GameState,
  Position,
  Difficulty,
  GameMode,
  PlayerStats,
  Achievement,
  GameRecord,
  LeaderboardEntry,
  ACHIEVEMENTS,
  DIFFICULTY_SETTINGS,
  trees,
  BASE_MOVE_SPEED,
  BASE_DETECTION_RANGE,
  TREE_HIDE_RANGE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SIZE,
} from '@/types/game';

export function useGameLogic() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [gameMode, setGameMode] = useState<GameMode>('day');
  const [showStats, setShowStats] = useState(false);
  const [maxDetectionReached, setMaxDetectionReached] = useState(0);
  const [touchJoystick, setTouchJoystick] = useState<{start: Position, current: Position} | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const activeKeysRef = useRef<Set<string>>(new Set());
  
  const [stats, setStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('dimaForestStats');
    return saved ? JSON.parse(saved) : {
      gamesPlayed: 0,
      gamesWon: 0,
      totalTime: 0,
      bestTime: 0,
      easyWins: 0,
      normalWins: 0,
      hardWins: 0,
      nightmareWins: 0,
      nightWins: 0,
      perfectRuns: 0,
      currentStreak: 0,
      bestStreak: 0,
    };
  });
  
  const [gameHistory, setGameHistory] = useState<GameRecord[]>(() => {
    const saved = localStorage.getItem('dimaForestHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('dimaForestLeaderboard');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [pendingScore, setPendingScore] = useState<{time: number, difficulty: Difficulty, mode: GameMode, score: number} | null>(null);
  
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('dimaForestAchievements');
    if (saved) {
      const savedAch = JSON.parse(saved);
      return ACHIEVEMENTS.map(a => ({ ...a, unlocked: savedAch[a.id] || false }));
    }
    return ACHIEVEMENTS;
  });
  
  const [gameState, setGameState] = useState<GameState>({
    playerPos: { x: 50, y: 50 },
    forestKeeperPos: { x: 700, y: 500 },
    hiddenBehindTree: false,
    detectionLevel: 0,
    gameStarted: false,
    gameOver: false,
    survived: false,
    time: 0,
    difficulty: 'normal',
    mode: 'day',
  });

  const playSound = useCallback((type: 'step' | 'hide' | 'danger' | 'caught' | 'escape') => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    switch(type) {
      case 'step':
        oscillator.frequency.value = 150;
        oscillator.type = 'square';
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
        break;
      case 'hide':
        oscillator.frequency.value = 200;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      case 'danger':
        oscillator.frequency.value = 800;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      case 'caught':
        oscillator.frequency.value = 100;
        oscillator.type = 'sawtooth';
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        break;
      case 'escape':
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
        break;
    }
  }, []);

  const calculateScore = useCallback((time: number, difficulty: Difficulty, mode: GameMode, maxDetection: number) => {
    const difficultyMultiplier = { easy: 1, normal: 2, hard: 3, nightmare: 4 }[difficulty];
    const modeBonus = mode === 'night' ? 1.5 : 1;
    const stealthBonus = maxDetection < 10 ? 2 : maxDetection < 30 ? 1.5 : 1;
    return Math.floor(time * 10 * difficultyMultiplier * modeBonus * stealthBonus);
  }, []);

  const saveGameResult = useCallback((won: boolean, time: number, maxDetection: number) => {
    const record: GameRecord = {
      difficulty: gameState.difficulty,
      mode: gameState.mode,
      time,
      survived: won,
      date: new Date().toISOString(),
      maxDetection,
    };
    
    setGameHistory(prev => {
      const updated = [record, ...prev];
      localStorage.setItem('dimaForestHistory', JSON.stringify(updated));
      return updated;
    });
    
    setStats(prev => {
      const newCurrentStreak = won ? prev.currentStreak + 1 : 0;
      const newStats = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        gamesWon: won ? prev.gamesWon + 1 : prev.gamesWon,
        totalTime: prev.totalTime + time,
        bestTime: won && (prev.bestTime === 0 || time > prev.bestTime) ? time : prev.bestTime,
        easyWins: won && gameState.difficulty === 'easy' ? prev.easyWins + 1 : prev.easyWins,
        normalWins: won && gameState.difficulty === 'normal' ? prev.normalWins + 1 : prev.normalWins,
        hardWins: won && gameState.difficulty === 'hard' ? prev.hardWins + 1 : prev.hardWins,
        nightmareWins: won && gameState.difficulty === 'nightmare' ? prev.nightmareWins + 1 : prev.nightmareWins,
        nightWins: won && gameState.mode === 'night' ? prev.nightWins + 1 : prev.nightWins,
        perfectRuns: won && maxDetection < 10 ? prev.perfectRuns + 1 : prev.perfectRuns,
        currentStreak: newCurrentStreak,
        bestStreak: Math.max(prev.bestStreak, newCurrentStreak),
      };
      
      localStorage.setItem('dimaForestStats', JSON.stringify(newStats));
      
      if (won) {
        const score = calculateScore(time, gameState.difficulty, gameState.mode, maxDetection);
        setPendingScore({ time, difficulty: gameState.difficulty, mode: gameState.mode, score });
      }
      
      setAchievements(prev => {
        const updated = prev.map(ach => {
          if (!ach.unlocked && ach.condition(newStats)) {
            toast({
              title: `🏆 Достижение разблокировано!`,
              description: `${ach.icon} ${ach.title}`,
              duration: 5000,
            });
            return { ...ach, unlocked: true };
          }
          return ach;
        });
        
        const achObj = updated.reduce((acc, a) => ({ ...acc, [a.id]: a.unlocked }), {});
        localStorage.setItem('dimaForestAchievements', JSON.stringify(achObj));
        
        return updated;
      });
      
      return newStats;
    });
  }, [gameState.difficulty, gameState.mode, toast, calculateScore]);
  
  const submitToLeaderboard = useCallback((playerName: string) => {
    if (!pendingScore) return;
    
    const entry: LeaderboardEntry = {
      playerName,
      difficulty: pendingScore.difficulty,
      mode: pendingScore.mode,
      time: pendingScore.time,
      date: new Date().toISOString(),
      score: pendingScore.score,
    };
    
    setLeaderboard(prev => {
      const updated = [...prev, entry].sort((a, b) => b.score - a.score).slice(0, 100);
      localStorage.setItem('dimaForestLeaderboard', JSON.stringify(updated));
      return updated;
    });
    
    setPendingScore(null);
    toast({
      title: '🏆 Результат сохранён!',
      description: `${entry.score} очков в таблице лидеров`,
      duration: 3000,
    });
  }, [pendingScore, toast]);
  
  const clearHistory = useCallback(() => {
    setGameHistory([]);
    localStorage.removeItem('dimaForestHistory');
    toast({
      title: 'История очищена',
      duration: 2000,
    });
  }, [toast]);

  const startGame = useCallback(() => {
    setMaxDetectionReached(0);
    setGameState({
      playerPos: { x: 50, y: 50 },
      forestKeeperPos: { x: 700, y: 500 },
      hiddenBehindTree: false,
      detectionLevel: 0,
      gameStarted: true,
      gameOver: false,
      survived: false,
      time: 0,
      difficulty,
      mode: gameMode,
    });
    setShowStats(false);
  }, [difficulty, gameMode]);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        const settings = DIFFICULTY_SETTINGS[prev.difficulty];
        const newPlayerPos = { ...prev.playerPos };
        let hasMoved = false;

        if (keys.has('w') || keys.has('ц') || keys.has('up')) {
          newPlayerPos.y = Math.max(0, newPlayerPos.y - BASE_MOVE_SPEED);
          hasMoved = true;
        }
        if (keys.has('s') || keys.has('ы') || keys.has('down')) {
          newPlayerPos.y = Math.min(CANVAS_HEIGHT - PLAYER_SIZE, newPlayerPos.y + BASE_MOVE_SPEED);
          hasMoved = true;
        }
        if (keys.has('a') || keys.has('ф') || keys.has('left')) {
          newPlayerPos.x = Math.max(0, newPlayerPos.x - BASE_MOVE_SPEED);
          hasMoved = true;
        }
        if (keys.has('d') || keys.has('в') || keys.has('right')) {
          newPlayerPos.x = Math.min(CANVAS_WIDTH - PLAYER_SIZE, newPlayerPos.x + BASE_MOVE_SPEED);
          hasMoved = true;
        }

        if (hasMoved && Math.random() > 0.7) {
          playSound('step');
        }

        const nearTree = trees.find(tree => {
          const dx = newPlayerPos.x + PLAYER_SIZE / 2 - tree.x;
          const dy = newPlayerPos.y + PLAYER_SIZE / 2 - tree.y;
          return Math.sqrt(dx * dx + dy * dy) < TREE_HIDE_RANGE;
        });

        const hiddenBehindTree = !!nearTree;
        
        if (hiddenBehindTree && !prev.hiddenBehindTree) {
          playSound('hide');
        }

        const newKeeperPos = { ...prev.forestKeeperPos };
        const dx = newPlayerPos.x - newKeeperPos.x;
        const dy = newPlayerPos.y - newKeeperPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (!hiddenBehindTree && distance > 50) {
          newKeeperPos.x += (dx / distance) * settings.keeperSpeed;
          newKeeperPos.y += (dy / distance) * settings.keeperSpeed;
        }

        let newDetectionLevel = prev.detectionLevel;
        if (distance < BASE_DETECTION_RANGE && !hiddenBehindTree) {
          newDetectionLevel = Math.min(100, newDetectionLevel + settings.detectionRate);
          if (newDetectionLevel > 70 && prev.detectionLevel <= 70) {
            playSound('danger');
          }
        } else {
          newDetectionLevel = Math.max(0, newDetectionLevel - 1);
        }

        setMaxDetectionReached(prevMax => Math.max(prevMax, newDetectionLevel));

        const gameOver = newDetectionLevel >= 100 || distance < 40;
        const survived = prev.time >= settings.surviveTime && !gameOver;
        
        if (gameOver && !prev.gameOver) {
          if (survived) {
            playSound('escape');
            saveGameResult(true, prev.time, maxDetectionReached);
          } else {
            playSound('caught');
            saveGameResult(false, prev.time, maxDetectionReached);
          }
        }

        return {
          ...prev,
          playerPos: newPlayerPos,
          forestKeeperPos: newKeeperPos,
          hiddenBehindTree,
          detectionLevel: newDetectionLevel,
          gameOver: gameOver || survived,
          survived,
          time: prev.time + 0.05,
        };
      });
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameState.gameStarted, gameState.gameOver, keys, playSound, saveGameResult, maxDetectionReached]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMobile || gameState.gameOver) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (touch.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    const pos = { x, y };
    setTouchJoystick({ start: pos, current: pos });
  }, [isMobile, gameState.gameOver]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMobile || !touchJoystick || gameState.gameOver) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (touch.clientY - rect.top) * (CANVAS_HEIGHT / rect.height);
    
    setTouchJoystick(prev => prev ? { ...prev, current: { x, y } } : null);
    
    const dx = x - touchJoystick.start.x;
    const dy = y - touchJoystick.start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 15) {
      const newKeys = new Set<string>();
      
      if (Math.abs(dx) > 10) {
        newKeys.add(dx > 0 ? 'right' : 'left');
      }
      if (Math.abs(dy) > 10) {
        newKeys.add(dy > 0 ? 'down' : 'up');
      }
      
      activeKeysRef.current = newKeys;
      setKeys(newKeys);
    } else {
      activeKeysRef.current = new Set();
      setKeys(new Set());
    }
  }, [isMobile, gameState.gameOver, touchJoystick]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMobile) return;
    e.preventDefault();
    setTouchJoystick(null);
    activeKeysRef.current = new Set();
    setKeys(new Set());
  }, [isMobile]);

  return {
    gameState,
    difficulty,
    gameMode,
    showStats,
    stats,
    achievements,
    gameHistory,
    leaderboard,
    pendingScore,
    isMobile,
    touchJoystick,
    setDifficulty,
    setGameMode,
    setShowStats,
    startGame,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    submitToLeaderboard,
    clearHistory,
  };
}