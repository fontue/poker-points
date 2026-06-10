import { Info } from 'lucide-react';
import { prizeDistributionPresets } from '@/lib/settings';

type PrizeDistributionEditorProps = {
  prizePlaces: number;
  distribution: string[];
  percentValues: number[];
  percentTotal: number;
  isOrdered: boolean;
  isValid: boolean;
  onInfo: () => void;
  onApplyPreset: (distribution: number[]) => void;
  onPercentChange: (index: number, value: string) => void;
};

function formatPlacesLabel(places: string) {
  return places === '1' ? '1 место' : `${places} места`;
}

export function PrizeDistributionEditor({
  prizePlaces,
  distribution,
  percentValues,
  percentTotal,
  isOrdered,
  isValid,
  onInfo,
  onApplyPreset,
  onPercentChange
}: PrizeDistributionEditorProps) {
  return (
    <div className="mt-4 rounded-3xl bg-zinc-900/80 p-3 text-left ring-1 ring-white/10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-black text-zinc-100">Распределение</div>
          <div className="mt-0.5 text-xs font-bold text-zinc-500">Проценты по призовым местам</div>
        </div>
        <div className="flex items-center gap-2">
          {isValid && (
            <button type="button" onClick={onInfo} className="grid h-9 w-9 place-items-center rounded-xl bg-black/50 text-zinc-300 active:scale-95">
              <Info size={16} />
            </button>
          )}
          <div
            className={`rounded-xl px-3 py-2 text-xs font-black ${
              isValid ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20' : 'bg-red-500/15 text-red-300 ring-1 ring-red-400/20'
            }`}
          >
            {percentTotal}%
          </div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        {Object.entries(prizeDistributionPresets).map(([places, preset]) => (
          <button
            key={places}
            type="button"
            onClick={() => onApplyPreset(preset)}
            className={`rounded-xl px-2 py-2 text-center text-[11px] font-black leading-tight active:scale-95 ${
              prizePlaces === preset.length && distribution.join('/') === preset.map(String).join('/')
                ? 'bg-violet-600 text-white'
                : 'bg-black/60 text-zinc-300'
            }`}
          >
            <span className="block">{formatPlacesLabel(places)}</span>
            <span className="block text-[10px] opacity-70">{preset.join('/')}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {distribution.map((percent, index) => (
          <label key={index} className="grid grid-cols-[1fr_96px] items-center gap-3 rounded-2xl bg-black/35 px-3 py-2 ring-1 ring-white/[0.06]">
            <span className="text-sm font-black text-zinc-200">{index + 1} место</span>
            <input
              type="text"
              inputMode="numeric"
              value={percent}
              onChange={(event) => onPercentChange(index, event.target.value)}
              className={`h-10 min-w-0 rounded-xl border bg-zinc-950 px-3 text-right text-base font-black outline-none focus:border-violet-400 ${
                index > 0 && percentValues[index] > percentValues[index - 1] ? 'border-red-400 text-red-200' : 'border-white/10'
              }`}
            />
          </label>
        ))}
      </div>

      {percentTotal !== 100 && <div className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">Сумма процентов должна быть 100%.</div>}
      {!isOrdered && (
        <div className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">
          Процент за следующее место не может быть больше предыдущего.
        </div>
      )}
    </div>
  );
}
