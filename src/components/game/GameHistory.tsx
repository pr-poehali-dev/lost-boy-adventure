import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameRecord, Difficulty, GameMode } from '@/types/game';
import Icon from '@/components/ui/icon';

interface GameHistoryProps {
  records: GameRecord[];
  onClearHistory: () => void;
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

export function GameHistory({ records, onClearHistory }: GameHistoryProps) {
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 20);

  const wins = records.filter(r => r.survived).length;
  const losses = records.filter(r => !r.survived).length;
  const winRate = records.length > 0 ? ((wins / records.length) * 100).toFixed(1) : '0';

  return (
    <Card className="p-6 bg-[#1A1A1A] border-2 border-[#8B0000]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-white">📜 ИСТОРИЯ ИГР</h3>
        {records.length > 0 && (
          <Button
            onClick={onClearHistory}
            variant="outline"
            size="sm"
            className="bg-[#2C1810] border-[#8B0000] text-white hover:bg-red-900"
          >
            <Icon name="Trash2" size={16} className="mr-1" />
            Очистить
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#2C1810] p-3 border border-[#8B0000] text-center">
          <p className="text-2xl font-bold text-white">{records.length}</p>
          <p className="text-xs text-gray-400">Всего игр</p>
        </div>
        <div className="bg-[#2C1810] p-3 border border-green-600 text-center">
          <p className="text-2xl font-bold text-green-400">{wins}</p>
          <p className="text-xs text-gray-400">Побед</p>
        </div>
        <div className="bg-[#2C1810] p-3 border border-[#8B0000] text-center">
          <p className="text-2xl font-bold text-[#8B0000]">{winRate}%</p>
          <p className="text-xs text-gray-400">Винрейт</p>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {sortedRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">История пуста. Сыграй первую игру!</p>
        ) : (
          sortedRecords.map((record, index) => (
            <div
              key={index}
              className={`p-3 border-2 flex items-center gap-3 ${
                record.survived
                  ? 'bg-green-900/20 border-green-600'
                  : 'bg-red-900/20 border-red-600'
              }`}
            >
              <div className="text-2xl">
                {record.survived ? '✅' : '❌'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">
                    {DIFFICULTY_EMOJI[record.difficulty]} {MODE_EMOJI[record.mode]}
                  </span>
                  {record.survived && (
                    <span className="text-green-400 text-sm">ПОБЕГ</span>
                  )}
                  {!record.survived && (
                    <span className="text-red-400 text-sm">ПОЙМАЛИ</span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {Math.floor(record.time)}с • Обнаружение: {Math.round(record.maxDetection)}%
                </p>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(record.date).toLocaleDateString('ru', { 
                  day: '2-digit', 
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}