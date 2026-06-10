import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { colorUpChipTones, colorUpChipValues } from '@/lib/game';
import type { TimerLevelValues } from '@/hooks/useTimerSettingsForm';
import type { ColorUpChipValue } from '@/lib/game';

type TimerLevelsEditorProps = {
  levels: TimerLevelValues[];
  globalDurationMinutes: string;
  onChange: (index: number, key: keyof TimerLevelValues, value: string | ColorUpChipValue | null) => void;
  onGlobalDurationChange: (value: string) => void;
  onApplyDurationToAll: (duration?: string) => void;
  onClearAnteForAll: () => void;
  onSetAnteToBigBlindForAll: () => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

type TimerLevelField = {
  key: keyof Pick<TimerLevelValues, 'smallBlind' | 'bigBlind' | 'ante' | 'durationMinutes'>;
  label: string;
};

const timerLevelFields: TimerLevelField[] = [
  { key: 'smallBlind', label: 'SB' },
  { key: 'bigBlind', label: 'BB' },
  { key: 'ante', label: 'Ante' },
  { key: 'durationMinutes', label: 'Мин' }
];

const durationPresets = [10, 15, 20, 30];

function getNextColorUpChip(currentValue: ColorUpChipValue | null) {
  if (!currentValue) return colorUpChipValues[0];

  const currentIndex = colorUpChipValues.indexOf(currentValue);
  return colorUpChipValues[currentIndex + 1] || null;
}

export function TimerLevelsEditor({
  levels,
  globalDurationMinutes,
  onChange,
  onGlobalDurationChange,
  onApplyDurationToAll,
  onClearAnteForAll,
  onSetAnteToBigBlindForAll,
  onAdd,
  onRemove
}: TimerLevelsEditorProps) {
  return (
    <section className="mt-4 rounded-3xl bg-zinc-900 p-3 text-left ring-1 ring-white/10">
      <div className="mb-3 rounded-2xl bg-black p-3 ring-1 ring-white/10">
        <div className="mb-2 text-xs font-black uppercase text-zinc-500">Длительность уровней</div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={globalDurationMinutes}
            placeholder="Разные"
            onChange={(event) => onGlobalDurationChange(event.target.value)}
            className="h-10 min-w-0 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm font-black outline-none focus:border-violet-400"
          />
          <button
            type="button"
            onClick={() => onApplyDurationToAll()}
            className="h-10 rounded-xl bg-zinc-700 px-3 text-xs font-black text-zinc-100 active:scale-95"
          >
            Применить
          </button>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {durationPresets.map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => onApplyDurationToAll(String(minutes))}
              className={`h-9 rounded-xl text-xs font-black active:scale-95 ${
                globalDurationMinutes === String(minutes) ? 'bg-zinc-600 text-white' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {minutes} мин
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 rounded-2xl bg-black p-3 ring-1 ring-white/10">
        <div className="mb-2 text-xs font-black uppercase text-zinc-500">Ante</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClearAnteForAll}
            className="h-10 rounded-xl bg-zinc-700 px-3 text-xs font-black text-zinc-100 active:scale-95"
          >
            Убрать ante
          </button>
          <button
            type="button"
            onClick={onSetAnteToBigBlindForAll}
            className="h-10 rounded-xl bg-zinc-700 px-3 text-xs font-black text-zinc-100 active:scale-95"
          >
            Ante = BB
          </button>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="text-sm font-black text-zinc-100">Уровни таймера</h4>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="rounded-2xl bg-black p-3 ring-1 ring-white/10"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-xs font-black uppercase text-zinc-500">Уровень {index + 1}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChange(index, 'colorUpChip', getNextColorUpChip(level.colorUpChip))}
                    className={`h-8 min-w-10 rounded-xl px-2 text-xs font-black active:scale-95 ${
                      level.colorUpChip ? colorUpChipTones[level.colorUpChip] : 'bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    {level.colorUpChip || 'CU'}
                  </button>
                  <button
                    type="button"
                    disabled={levels.length <= 1}
                    onClick={() => onRemove(index)}
                    className="grid h-8 w-8 place-items-center rounded-xl bg-zinc-900 text-red-300 disabled:opacity-30 active:scale-95"
                    aria-label="Удалить уровень"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {timerLevelFields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-1 block text-[11px] font-bold text-zinc-500">{field.label}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={level[field.key]}
                      onChange={(event) => onChange(index, field.key, event.target.value)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-zinc-950 px-2 text-center text-sm font-black outline-none focus:border-violet-400"
                    />
                  </label>
                ))}
              </div>

            </motion.div>
          ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={onAdd}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-700 text-xs font-black text-zinc-100 active:scale-[0.99]"
        >
          <Plus size={15} />
          Добавить уровень
        </button>
      </div>
    </section>
  );
}
