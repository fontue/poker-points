import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Settings2 } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { colorUpChipTones } from '@/lib/game';
import type { Settings, TournamentTimer } from '@/lib/game';

type PokerTimerProps = {
  settings: Settings;
  timer: TournamentTimer;
  onToggle: () => void;
  onPreviousLevel: () => void;
  onNextLevel: () => void;
  onResetLevel: () => void;
  onSettings: () => void;
};

function formatTimerTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function PokerTimer({ settings, timer, onToggle, onPreviousLevel, onNextLevel, onResetLevel, onSettings }: PokerTimerProps) {
  const level = settings.timerLevels[timer.currentLevelIndex] || settings.timerLevels[0];
  const isFirstLevel = timer.currentLevelIndex === 0;
  const isLastLevel = timer.currentLevelIndex >= settings.timerLevels.length - 1;

  return (
    <section className="mb-4 rounded-3xl bg-zinc-900 p-4 text-left ring-1 ring-white/10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase text-zinc-500">Уровень {timer.currentLevelIndex + 1}</div>
          <div className="text-lg font-black text-zinc-100">
            {formatNumber(level.smallBlind)} / {formatNumber(level.bigBlind)}
            {level.ante > 0 && <span className="text-zinc-400"> · ante {formatNumber(level.ante)}</span>}
          </div>
        </div>
        {level.colorUpChip && (
          <div className={`shrink-0 rounded-xl px-2 py-1 text-[11px] font-black ${colorUpChipTones[level.colorUpChip]}`}>
            Color Up {level.colorUpChip}
          </div>
        )}
      </div>

      <div className={`mb-4 text-center text-6xl font-black tabular-nums ${timer.isRunning ? 'text-white' : 'text-yellow-300'}`}>
        {formatTimerTime(timer.remainingSeconds)}
      </div>

      <div className="grid grid-cols-[3rem_1fr_3rem_3rem_3rem] gap-2">
        <button
          type="button"
          disabled={isFirstLevel}
          onClick={onPreviousLevel}
          className="grid h-12 place-items-center rounded-2xl bg-black text-zinc-200 disabled:opacity-40 active:scale-95"
          aria-label="Предыдущий уровень"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 text-sm font-black text-white active:scale-[0.99]"
        >
          {timer.isRunning ? <Pause size={18} /> : <Play size={18} />}
          {timer.isRunning ? 'Пауза' : 'Старт'}
        </button>
        <button
          type="button"
          disabled={isLastLevel}
          onClick={onNextLevel}
          className="grid h-12 place-items-center rounded-2xl bg-black text-zinc-200 disabled:opacity-40 active:scale-95"
          aria-label="Следующий уровень"
        >
          <ChevronRight size={22} />
        </button>
        <button
          type="button"
          onClick={onResetLevel}
          className="grid h-12 place-items-center rounded-2xl bg-black text-zinc-200 active:scale-95"
          aria-label="Сбросить текущий уровень"
        >
          <RotateCcw size={19} />
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="grid h-12 place-items-center rounded-2xl bg-black text-zinc-200 active:scale-95"
          aria-label="Настройки таймера"
        >
          <Settings2 size={19} />
        </button>
      </div>
    </section>
  );
}
