import { Card } from '@/components/ui/card';
import { PlayerStats, Achievement } from '@/types/game';

interface GameStatsProps {
  stats: PlayerStats;
  achievements: Achievement[];
}

export function GameStats({ stats, achievements }: GameStatsProps) {
  return (
    <div className="space-y-4">
      <Card className="p-6 bg-[#1A1A1A] border-2 border-[#8B0000]">
        <h3 className="text-2xl font-bold text-white mb-4 text-center">📊 СТАТИСТИКА</h3>
        <div className="grid grid-cols-2 gap-4 text-white">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#8B0000]">{stats.gamesPlayed}</p>
            <p className="text-sm text-gray-400">Игр сыграно</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{stats.gamesWon}</p>
            <p className="text-sm text-gray-400">Побед</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">{stats.bestTime > 0 ? Math.floor(stats.bestTime) : 0}с</p>
            <p className="text-sm text-gray-400">Лучшее время</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">{stats.perfectRuns}</p>
            <p className="text-sm text-gray-400">Идеальных побег</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-white font-bold text-center mb-2">Победы по сложности</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-[#2C1810] p-2 border border-[#8B0000]">
              <p className="text-xl font-bold text-green-400">{stats.easyWins}</p>
              <p className="text-xs text-gray-400">🟢 Легко</p>
            </div>
            <div className="text-center bg-[#2C1810] p-2 border border-[#8B0000]">
              <p className="text-xl font-bold text-yellow-400">{stats.normalWins}</p>
              <p className="text-xs text-gray-400">🟡 Нормал</p>
            </div>
            <div className="text-center bg-[#2C1810] p-2 border border-[#8B0000]">
              <p className="text-xl font-bold text-orange-400">{stats.hardWins}</p>
              <p className="text-xs text-gray-400">🟠 Сложно</p>
            </div>
            <div className="text-center bg-[#2C1810] p-2 border border-[#8B0000]">
              <p className="text-xl font-bold text-red-400">{stats.nightmareWins}</p>
              <p className="text-xs text-gray-400">🔴 Кошмар</p>
            </div>
            <div className="text-center bg-[#2C1810] p-2 border border-[#8B0000]">
              <p className="text-xl font-bold text-purple-500">{stats.hardcoreWins}</p>
              <p className="text-xs text-gray-400">💀 Хардкор</p>
            </div>
            <div className="text-center bg-[#2C1810] p-2 border border-[#8B0000]">
              <p className="text-xl font-bold text-blue-400">{stats.nightWins}</p>
              <p className="text-xs text-gray-400">🌙 Ночь</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-[#1A1A1A] border-2 border-[#8B0000]">
        <h3 className="text-2xl font-bold text-white mb-4 text-center">🏆 ДОСТИЖЕНИЯ</h3>
        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
          {achievements.map(ach => (
            <div 
              key={ach.id}
              className={`p-3 border-2 flex items-center gap-3 ${
                ach.unlocked 
                  ? 'bg-[#2C1810] border-[#8B0000]' 
                  : 'bg-[#1A1A1A] border-gray-700 opacity-50'
              }`}
            >
              <div className="text-3xl">{ach.icon}</div>
              <div className="flex-1">
                <p className={`font-bold ${ach.unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {ach.title}
                </p>
                <p className={`text-sm ${ach.unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                  {ach.description}
                </p>
              </div>
              {ach.unlocked && (
                <div className="text-green-400 text-xl">✓</div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <p className="text-white">
            <span className="text-2xl font-bold text-[#8B0000]">
              {achievements.filter(a => a.unlocked).length}
            </span>
            <span className="text-gray-400"> / {achievements.length}</span>
          </p>
        </div>
      </Card>
    </div>
  );
}