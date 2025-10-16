import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LeaderboardEntry, Difficulty, GameMode } from '@/types/game';
import { useState } from 'react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onSubmitScore?: (name: string) => void;
  canSubmit?: boolean;
}

const DIFFICULTY_EMOJI: Record<Difficulty, string> = {
  easy: '🟢',
  normal: '🟡',
  hard: '🟠',
  nightmare: '🔴',
  hardcore: '💀',
};

const MODE_EMOJI: Record<GameMode, string> = {
  day: '☀️',
  night: '🌙',
};

export function Leaderboard({ entries, onSubmitScore, canSubmit = false }: LeaderboardProps) {
  const [playerName, setPlayerName] = useState('');
  const [filter, setFilter] = useState<'all' | Difficulty>('all');

  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(e => e.difficulty === filter);

  const sortedEntries = [...filteredEntries].sort((a, b) => b.score - a.score).slice(0, 10);

  const handleSubmit = () => {
    if (playerName.trim() && onSubmitScore) {
      onSubmitScore(playerName.trim());
      setPlayerName('');
    }
  };

  return (
    <Card className="p-6 bg-[#1A1A1A] border-2 border-[#8B0000]">
      <h3 className="text-2xl font-bold text-white mb-4 text-center">🏆 ТАБЛИЦА ЛИДЕРОВ</h3>
      
      {canSubmit && onSubmitScore && (
        <div className="mb-4 space-y-2">
          <p className="text-white text-center text-sm">🎉 Отличный результат! Добавь своё имя:</p>
          <div className="flex gap-2">
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Твоё имя"
              maxLength={20}
              className="bg-[#2C1810] border-[#8B0000] text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <Button
              onClick={handleSubmit}
              disabled={!playerName.trim()}
              className="bg-[#8B0000] hover:bg-[#6B0000]"
            >
              Сохранить
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'all' ? 'bg-[#8B0000]' : 'bg-[#2C1810] border-[#8B0000]'}
        >
          Все
        </Button>
        <Button
          onClick={() => setFilter('easy')}
          variant={filter === 'easy' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'easy' ? 'bg-[#8B0000]' : 'bg-[#2C1810] border-[#8B0000]'}
        >
          🟢
        </Button>
        <Button
          onClick={() => setFilter('normal')}
          variant={filter === 'normal' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'normal' ? 'bg-[#8B0000]' : 'bg-[#2C1810] border-[#8B0000]'}
        >
          🟡
        </Button>
        <Button
          onClick={() => setFilter('hard')}
          variant={filter === 'hard' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'hard' ? 'bg-[#8B0000]' : 'bg-[#2C1810] border-[#8B0000]'}
        >
          🟠
        </Button>
        <Button
          onClick={() => setFilter('nightmare')}
          variant={filter === 'nightmare' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'nightmare' ? 'bg-[#8B0000]' : 'bg-[#2C1810] border-[#8B0000]'}
        >
          🔴
        </Button>
        <Button
          onClick={() => setFilter('hardcore')}
          variant={filter === 'hardcore' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'hardcore' ? 'bg-[#8B0000]' : 'bg-[#2C1810] border-[#8B0000]'}
        >
          💀
        </Button>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {sortedEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Таблица пуста. Стань первым!</p>
        ) : (
          sortedEntries.map((entry, index) => (
            <div
              key={index}
              className={`p-3 border-2 flex items-center gap-3 ${
                index === 0
                  ? 'bg-yellow-900/30 border-yellow-500'
                  : index === 1
                  ? 'bg-gray-700/30 border-gray-400'
                  : index === 2
                  ? 'bg-orange-900/30 border-orange-600'
                  : 'bg-[#2C1810] border-[#8B0000]'
              }`}
            >
              <div className="text-2xl font-bold w-8 text-center">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">{entry.playerName}</p>
                <p className="text-xs text-gray-400">
                  {DIFFICULTY_EMOJI[entry.difficulty]} {MODE_EMOJI[entry.mode]} • {Math.floor(entry.time)}с • {new Date(entry.date).toLocaleDateString('ru')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#8B0000]">{entry.score}</p>
                <p className="text-xs text-gray-400">очков</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}