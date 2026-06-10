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
    <div className="mt-4 rounded-3xl bg-zinc-900 p-3 text-left ring-1 ring-white/10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-black text-zinc-100">Распределение призовых</div>
        <div className="flex items-center gap-2">
          {isValid && (
            <button type="button" onClick={onInfo} className="rounded-xl bg-white/10 p-2 text-zinc-300 active:scale-95">
              <Info size={16} />
            </button>
          )}
          <div className={`text-xs font-black ${isValid ? 'text-emerald-300' : 'text-red-300'}`}>{percentTotal}%</div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-1.5">
        {Object.entries(prizeDistributionPresets).map(([places, preset]) => (
          <button
            key={places}
            type="button"
            onClick={() => onApplyPreset(preset)}
            className={`rounded-xl px-1.5 py-1.5 text-center text-[10px] font-black leading-none active:scale-95 ${
              prizePlaces === preset.length && distribution.join('/') === preset.map(String).join('/')
                ? 'bg-violet-600 text-white'
                : 'bg-black text-zinc-300'
            }`}
          >
            {places} места: {preset.join('/')}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {distribution.map((percent, index) => (
          <label key={index} className="grid grid-cols-[auto_1fr] items-center gap-3">
            <span className="text-sm font-bold text-zinc-300">{index + 1} место</span>
            <input
              type="text"
              inputMode="numeric"
              value={percent}
              onChange={(event) => onPercentChange(index, event.target.value)}
              className={`h-11 min-w-0 rounded-2xl border bg-black px-4 text-right text-base font-bold outline-none focus:border-violet-400 ${
                index > 0 && percentValues[index] > percentValues[index - 1] ? 'border-red-400 text-red-200' : 'border-white/10'
              }`}
            />
          </label>
        ))}
      </div>

      {percentTotal !== 100 && <div className="mt-3 text-xs font-bold text-red-300">Сумма процентов должна быть 100%.</div>}
      {!isOrdered && (
        <div className="mt-3 text-xs font-bold text-red-300">Процент за следующее место не может быть больше предыдущего.</div>
      )}
    </div>
  );
}
