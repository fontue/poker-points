import { Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CounterRow({ value, colorClass, onInc, onDec }) {
  return (
    <div className="rounded-2xl bg-zinc-900/80 p-2 ring-1 ring-white/5">
      <div className="flex gap-1">
        <Button onClick={onInc} className={`h-8 flex-1 rounded-xl p-0 text-base font-black text-white ${colorClass}`}>
          {value}
        </Button>

        <Button
          onClick={onDec}
          disabled={value <= 0}
          className="h-8 w-9 rounded-xl bg-zinc-800 p-0 text-white hover:bg-zinc-700 disabled:opacity-35"
        >
          <Minus size={16} />
        </Button>
      </div>
    </div>
  );
}
