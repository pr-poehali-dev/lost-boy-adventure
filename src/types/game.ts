export interface Position {
  x: number;
  y: number;
}

export type Difficulty = 'easy' | 'normal' | 'hard' | 'nightmare' | 'hardcore';
export type GameMode = 'day' | 'night';

export interface GameState {
  playerPos: Position;
  forestKeeperPos: Position;
  forestKeeperPos2?: Position;
  hiddenBehindTree: boolean;
  detectionLevel: number;
  gameStarted: boolean;
  gameOver: boolean;
  survived: boolean;
  time: number;
  difficulty: Difficulty;
  mode: GameMode;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (stats: PlayerStats) => boolean;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalTime: number;
  bestTime: number;
  easyWins: number;
  normalWins: number;
  hardWins: number;
  nightmareWins: number;
  hardcoreWins: number;
  nightWins: number;
  perfectRuns: number;
  currentStreak: number;
  bestStreak: number;
}

export interface LeaderboardEntry {
  playerName: string;
  difficulty: Difficulty;
  mode: GameMode;
  time: number;
  date: string;
  score: number;
}

export interface GameRecord {
  difficulty: Difficulty;
  mode: GameMode;
  time: number;
  survived: boolean;
  date: string;
  maxDetection: number;
}

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const PLAYER_SIZE = 20;
export const KEEPER_SIZE = 24;
export const TREE_SIZE = 40;
export const BASE_MOVE_SPEED = 3;
export const BASE_KEEPER_SPEED = 1.5;
export const BASE_DETECTION_RANGE = 150;
export const TREE_HIDE_RANGE = 30;

export const DIFFICULTY_SETTINGS = {
  easy: { keeperSpeed: 1.0, detectionRate: 1, surviveTime: 45, visionRadius: 250 },
  normal: { keeperSpeed: 1.5, detectionRate: 2, surviveTime: 60, visionRadius: 200 },
  hard: { keeperSpeed: 2.0, detectionRate: 3, surviveTime: 75, visionRadius: 150 },
  nightmare: { keeperSpeed: 2.5, detectionRate: 4, surviveTime: 90, visionRadius: 120 },
  hardcore: { keeperSpeed: 2.2, detectionRate: 3.5, surviveTime: 120, visionRadius: 140 },
};

export const trees = [
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

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', title: '🎉 Первая победа', description: 'Выиграй первую игру', icon: '🏆', unlocked: false, condition: (s) => s.gamesWon >= 1 },
  { id: 'veteran', title: '🎖️ Ветеран', description: 'Сыграй 10 игр', icon: '🎮', unlocked: false, condition: (s) => s.gamesPlayed >= 10 },
  { id: 'master', title: '👑 Мастер', description: 'Выиграй 5 игр', icon: '⭐', unlocked: false, condition: (s) => s.gamesWon >= 5 },
  { id: 'speedrunner', title: '⚡ Спидраннер', description: 'Выживи за 45 секунд', icon: '🏃', unlocked: false, condition: (s) => s.bestTime > 0 && s.bestTime <= 45 },
  { id: 'survivor', title: '💪 Выживальщик', description: 'Протяни 90 секунд', icon: '🛡️', unlocked: false, condition: (s) => s.bestTime >= 90 },
  { id: 'easy_master', title: '🟢 Новичок', description: 'Победи на лёгком', icon: '🌟', unlocked: false, condition: (s) => s.easyWins >= 1 },
  { id: 'normal_master', title: '🟡 Опытный', description: 'Победи на нормальном', icon: '💫', unlocked: false, condition: (s) => s.normalWins >= 1 },
  { id: 'hard_master', title: '🟠 Профи', description: 'Победи на сложном', icon: '✨', unlocked: false, condition: (s) => s.hardWins >= 1 },
  { id: 'nightmare_master', title: '🔴 Легенда', description: 'Победи на кошмаре', icon: '🔥', unlocked: false, condition: (s) => s.nightmareWins >= 1 },
  { id: 'hardcore_master', title: '💀 Безумец', description: 'Победи на хардкоре', icon: '⚡', unlocked: false, condition: (s) => s.hardcoreWins >= 1 },
  { id: 'night_owl', title: '🦉 Ночная сова', description: 'Победи в ночи', icon: '🌙', unlocked: false, condition: (s) => s.nightWins >= 1 },
  { id: 'ghost', title: '👻 Призрак', description: 'Победи не будучи замеченным', icon: '🥷', unlocked: false, condition: (s) => s.perfectRuns >= 1 },
  { id: 'unstoppable', title: '🚀 Неудержимый', description: 'Победи 3 раза подряд на сложном+', icon: '🎯', unlocked: false, condition: (s) => s.hardWins + s.nightmareWins >= 3 },
];