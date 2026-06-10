import { motion } from 'framer-motion';
import { BellRing, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { formatNumber } from '@/lib/format';
import { colorUpChipTones } from '@/lib/game';
import { prepareTimerAlerts } from '@/lib/timerAlerts';
import type { Settings, TournamentTimer } from '@/lib/game';

type PokerTimerProps = {
  settings: Settings;
  timer: TournamentTimer;
  onToggle: () => void;
  onPreviousLevel: () => void;
  onNextLevel: () => void;
  onResetLevel: () => void;
  onSettings: () => void;
  onAlertSettings: () => void;
};

function formatTimerTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function PokerTimer({
  settings,
  timer,
  onToggle,
  onPreviousLevel,
  onNextLevel,
  onResetLevel,
  onSettings,
  onAlertSettings
}: PokerTimerProps) {
  const level = settings.timerLevels[timer.currentLevelIndex] || settings.timerLevels[0];
  const isFirstLevel = timer.currentLevelIndex === 0;
  const isLastLevel = timer.currentLevelIndex >= settings.timerLevels.length - 1;
  const [visibleActionsSide, setVisibleActionsSide] = useState<'left' | 'right' | null>(null);
  const leftActionsWidth = 96;
  const rightActionsWidth = 56;

  function getTimerOffset() {
    if (visibleActionsSide === 'left') return leftActionsWidth;
    if (visibleActionsSide === 'right') return -rightActionsWidth;
    return 0;
  }

  function closeActions() {
    setVisibleActionsSide(null);
  }

  function toggleTimer() {
    prepareTimerAlerts({
      sound: settings.timerSoundEnabled,
      vibration: settings.timerVibrationEnabled
    });
    onToggle();
  }

  return (
    <section className="relative mb-4 overflow-hidden rounded-3xl">
      <div className="absolute left-0 top-0.5 bottom-0.5 grid w-[88px] grid-cols-2 overflow-hidden rounded-3xl">
        <button
          type="button"
          onClick={() => {
            closeActions();
            onSettings();
          }}
          className="grid place-items-center bg-zinc-800 text-zinc-100 active:brightness-110"
          aria-label="Настройки таймера"
        >
          <Settings2 size={20} />
        </button>
        <button
          type="button"
          onClick={() => {
            closeActions();
            onAlertSettings();
          }}
          className="grid place-items-center bg-zinc-700 text-zinc-100 active:brightness-110"
          aria-label="Настройки уведомлений"
        >
          <BellRing size={20} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          closeActions();
          onResetLevel();
        }}
        className="absolute right-0 top-0.5 bottom-0.5 grid w-12 place-items-center rounded-3xl bg-red-500/85 text-white active:brightness-110"
        aria-label="Сбросить таймер"
      >
        <RotateCcw size={20} />
      </button>

      <motion.div
        drag="x"
        dragDirectionLock
        dragPropagation={false}
        dragConstraints={{ left: -rightActionsWidth, right: leftActionsWidth }}
        dragElastic={0.03}
        dragMomentum={false}
        animate={{ x: getTimerOffset() }}
        transition={{ type: 'spring', stiffness: 520, damping: 42, mass: 0.8 }}
        onDragEnd={(_, info) => {
          if (visibleActionsSide === 'left') {
            if (info.offset.x < -40 || info.velocity.x < -320) setVisibleActionsSide(null);
            return;
          }

          if (visibleActionsSide === 'right') {
            if (info.offset.x > 32 || info.velocity.x > 260) setVisibleActionsSide(null);
            return;
          }

          if (info.offset.x < -44 || info.velocity.x < -380) {
            setVisibleActionsSide('right');
            return;
          }

          if (info.offset.x > 56 || info.velocity.x > 420) {
            setVisibleActionsSide('left');
            return;
          }

          setVisibleActionsSide(null);
        }}
        className="relative z-10 select-none rounded-3xl bg-zinc-900 p-4 text-left ring-1 ring-white/10"
        style={{ touchAction: 'pan-y' }}
      >
        <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <div className="text-xs font-black uppercase text-zinc-500">Уровень {timer.currentLevelIndex + 1}</div>
            <div className="text-lg font-black text-zinc-100">
              {formatNumber(level.smallBlind)} / {formatNumber(level.bigBlind)}
              {level.ante > 0 && <span className="text-zinc-400"> / {formatNumber(level.ante)}</span>}
            </div>
          </div>
          <div className={`text-right text-4xl font-black leading-none tabular-nums ${timer.isRunning ? 'text-white' : 'text-yellow-300'}`}>
            {formatTimerTime(timer.remainingSeconds)}
          </div>
        </div>

        <div className="grid grid-cols-[2.75rem_3.5rem_2.75rem_minmax(5.75rem,1fr)] gap-2">
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
            onClick={toggleTimer}
            className="grid h-12 place-items-center rounded-2xl bg-violet-600 text-white active:scale-[0.99]"
            aria-label={timer.isRunning ? 'Пауза' : 'Старт'}
          >
            {timer.isRunning ? <Pause size={18} /> : <Play size={18} />}
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
          {level.colorUpChip ? (
            <div className={`grid h-12 place-items-center rounded-2xl px-3 text-[11px] font-black ${colorUpChipTones[level.colorUpChip]}`}>
              Color Up {level.colorUpChip}
            </div>
          ) : (
            <div className="h-12 rounded-2xl bg-black/50" aria-hidden="true" />
          )}
        </div>
      </motion.div>
    </section>
  );
}
