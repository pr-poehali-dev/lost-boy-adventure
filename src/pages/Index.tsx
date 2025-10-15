import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Position {
  x: number;
  y: number;
}

type Difficulty = 'easy' | 'normal' | 'hard' | 'nightmare';
type GameMode = 'day' | 'night';

interface GameState {
  playerPos: Position;
  forestKeeperPos: Position;
  hiddenBehindTree: boolean;
  detectionLevel: number;
  gameStarted: boolean;
  gameOver: boolean;
  survived: boolean;
  time: number;
  difficulty: Difficulty;
  mode: GameMode;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 20;
const KEEPER_SIZE = 24;
const TREE_SIZE = 40;
const BASE_MOVE_SPEED = 3;
const BASE_KEEPER_SPEED = 1.5;
const BASE_DETECTION_RANGE = 150;
const TREE_HIDE_RANGE = 30;

const DIFFICULTY_SETTINGS = {
  easy: { keeperSpeed: 1.0, detectionRate: 1, surviveTime: 45, visionRadius: 250 },
  normal: { keeperSpeed: 1.5, detectionRate: 2, surviveTime: 60, visionRadius: 200 },
  hard: { keeperSpeed: 2.0, detectionRate: 3, surviveTime: 75, visionRadius: 150 },
  nightmare: { keeperSpeed: 2.5, detectionRate: 4, surviveTime: 90, visionRadius: 120 },
};

const trees = [
  { x: 150, y: 100 },
  { x: 400, y: 150 },
  { x: 650, y: 120 },
  { x: 200, y: 300 },
  { x: 500, y: 280 },
  { x: 700, y: 400 },
  { x: 100, y: 500 },
  { x: 600, y: 500 },
  { x: 350, y: 450 },
];

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [gameMode, setGameMode] = useState<GameMode>('day');
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

        if (keys.has('w') || keys.has('ц')) {
          newPlayerPos.y = Math.max(0, newPlayerPos.y - BASE_MOVE_SPEED);
          hasMoved = true;
        }
        if (keys.has('s') || keys.has('ы')) {
          newPlayerPos.y = Math.min(CANVAS_HEIGHT - PLAYER_SIZE, newPlayerPos.y + BASE_MOVE_SPEED);
          hasMoved = true;
        }
        if (keys.has('a') || keys.has('ф')) {
          newPlayerPos.x = Math.max(0, newPlayerPos.x - BASE_MOVE_SPEED);
          hasMoved = true;
        }
        if (keys.has('d') || keys.has('в')) {
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

        const gameOver = newDetectionLevel >= 100 || distance < 40;
        const survived = prev.time >= settings.surviveTime && !gameOver;
        
        if (gameOver && !prev.gameOver) {
          if (survived) {
            playSound('escape');
          } else {
            playSound('caught');
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
  }, [gameState.gameStarted, gameState.gameOver, keys, playSound]);

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
      visionGradient.addColorStop(0.6, 'rgba(10, 10, 10, 0.7)');
      visionGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = visionGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      const gradient = ctx.createRadialGradient(
        gameState.playerPos.x + PLAYER_SIZE / 2,
        gameState.playerPos.y + PLAYER_SIZE / 2,
        0,
        gameState.playerPos.x + PLAYER_SIZE / 2,
        gameState.playerPos.y + PLAYER_SIZE / 2,
        200
      );
      gradient.addColorStop(0, 'rgba(50, 50, 50, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    trees.forEach(tree => {
      ctx.fillStyle = '#2C1810';
      ctx.fillRect(tree.x - 5, tree.y - 30, 10, 30);

      ctx.fillStyle = '#1A4D1A';
      ctx.beginPath();
      ctx.moveTo(tree.x, tree.y - 50);
      ctx.lineTo(tree.x - 20, tree.y - 20);
      ctx.lineTo(tree.x + 20, tree.y - 20);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(tree.x, tree.y - 40);
      ctx.lineTo(tree.x - 18, tree.y - 15);
      ctx.lineTo(tree.x + 18, tree.y - 15);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(tree.x, tree.y - 30);
      ctx.lineTo(tree.x - 15, tree.y - 10);
      ctx.lineTo(tree.x + 15, tree.y - 10);
      ctx.closePath();
      ctx.fill();
    });

    ctx.fillStyle = '#8B0000';
    ctx.fillRect(gameState.playerPos.x, gameState.playerPos.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(gameState.playerPos.x + 4, gameState.playerPos.y + 4, 4, 4);
    ctx.fillRect(gameState.playerPos.x + 12, gameState.playerPos.y + 4, 4, 4);
    ctx.fillRect(gameState.playerPos.x + 6, gameState.playerPos.y + 14, 8, 2);

    if (gameState.hiddenBehindTree) {
      ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
      ctx.fillRect(gameState.playerPos.x, gameState.playerPos.y, PLAYER_SIZE, PLAYER_SIZE);
    }

    ctx.fillStyle = '#2C1810';
    ctx.fillRect(gameState.forestKeeperPos.x, gameState.forestKeeperPos.y, KEEPER_SIZE, KEEPER_SIZE);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(gameState.forestKeeperPos.x + 5, gameState.forestKeeperPos.y + 5, 5, 5);
    ctx.fillRect(gameState.forestKeeperPos.x + 14, gameState.forestKeeperPos.y + 5, 5, 5);
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(gameState.forestKeeperPos.x + 8, gameState.forestKeeperPos.y + 16, 8, 4);

  }, [gameState]);

  const startGame = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
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
    
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const modeText = gameMode === 'night' ? '🌙 Ночь' : '☀️ День';
    const diffText = {
      easy: '🟢 Легко',
      normal: '🟡 Нормально',
      hard: '🟠 Сложно',
      nightmare: '🔴 Кошмар'
    }[difficulty];
    
    toast({
      title: `🎮 Игра началась! ${modeText}`,
      description: `${diffText} • Выживи ${settings.surviveTime}с`,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-white tracking-wider pixel-title">
            DIMA'S FOREST
          </h1>
          <p className="text-lg text-gray-400">Survival Horror Game</p>
        </div>

        {!gameState.gameStarted ? (
          <Card className="p-8 bg-[#2C1810] border-4 border-[#8B0000] space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-white font-bold text-sm">СЛОЖНОСТЬ</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['easy', 'normal', 'hard', 'nightmare'] as Difficulty[]).map((diff) => (
                      <Button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        variant={difficulty === diff ? 'default' : 'outline'}
                        className={`text-xs font-bold ${
                          difficulty === diff 
                            ? 'bg-[#8B0000] hover:bg-[#6B0000] text-white' 
                            : 'bg-[#1A1A1A] text-gray-300 border-[#8B0000]'
                        }`}
                      >
                        {diff === 'easy' && '🟢 Легко'}
                        {diff === 'normal' && '🟡 Нормал'}
                        {diff === 'hard' && '🟠 Сложно'}
                        {diff === 'nightmare' && '🔴 Кошмар'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white font-bold text-sm">РЕЖИМ</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setGameMode('day')}
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
                      onClick={() => setGameMode('night')}
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
            </div>

            <div className="bg-[#1A1A1A] p-4 border-2 border-[#8B0000]">
              <p className="text-white text-center mb-2 font-bold">УПРАВЛЕНИЕ</p>
              <p className="text-gray-300 text-center">W A S D или Ц Ф Ы В — движение</p>
            </div>

            <Button 
              onClick={startGame}
              className="w-full h-16 text-2xl font-bold bg-[#8B0000] hover:bg-[#6B0000] border-4 border-black"
            >
              НАЧАТЬ ИГРУ
            </Button>
          </Card>
        ) : (
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

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full border-4 border-[#8B0000] bg-[#1A1A1A] pixel-art"
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
                    '🔴 Кошмар'
                  }
                </p>
              </div>
            </div>

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
                  onClick={startGame}
                  className="w-full h-12 text-xl font-bold bg-[#8B0000] hover:bg-[#6B0000] border-4 border-black"
                >
                  ИГРАТЬ СНОВА
                </Button>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}