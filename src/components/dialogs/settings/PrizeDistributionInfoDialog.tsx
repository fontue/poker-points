import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { calculatePrizePayouts } from '@/lib/game';
import { AppDialog } from '../AppDialog';
import type { Settings } from '@/lib/game';

type PrizeDistributionInfoDialogProps = {
  settings: Settings;
  onClose: () => void;
};

export function PrizeDistributionInfoDialog({ settings, onClose }: PrizeDistributionInfoDialogProps) {
  const step = Math.max(1, Number(settings.prizeRoundingStep) || 1);
  const prizePlaces = Math.max(1, Number(settings.prizePlaces) || 1);
  const rows = Array.from({ length: 20 }, (_, index) => {
    const prizePoolPoints = step * (index + 1);
    const payouts = calculatePrizePayouts(prizePoolPoints, settings, [], new Map());
    const paidOut = payouts.reduce((sum, payout) => sum + payout.amount, 0);

    return {
      prizePoolPoints,
      payouts,
      remainingPrizePoolPoints: Math.max(0, prizePoolPoints - paidOut)
    };
  });

  return (
    <AppDialog align="top" onClose={onClose}>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Распределение призовых</h3>
        <p className="mt-1 text-sm text-zinc-400">20 шагов по {formatNumber(step)}P.</p>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-zinc-900 text-left ring-1 ring-white/10">
        <div className="min-w-max">
          <div
            className="grid gap-2 border-b border-white/10 px-3 py-2 text-[11px] font-black uppercase text-zinc-500"
            style={{ gridTemplateColumns: `5.5rem repeat(${prizePlaces}, 5rem) 5.5rem` }}
          >
            <div>Фонд</div>
            {Array.from({ length: prizePlaces }, (_, index) => (
              <div key={index} className="text-right">
                {index + 1} место
              </div>
            ))}
            <div className="text-right">Остаток</div>
          </div>

          <div className="max-h-[55dvh] overflow-y-auto overscroll-contain">
            {rows.map((row) => (
              <div
                key={row.prizePoolPoints}
                className="grid gap-2 border-b border-white/5 px-3 py-3 text-sm last:border-b-0"
                style={{ gridTemplateColumns: `5.5rem repeat(${prizePlaces}, 5rem) 5.5rem` }}
              >
                <div className="font-black text-zinc-100">{formatNumber(row.prizePoolPoints)}P</div>
                {row.payouts.map((payout) => (
                  <div key={payout.place} className="text-right">
                    <div className="font-black text-yellow-100">{formatNumber(payout.amount)}P</div>
                    <div className="text-[11px] font-bold text-yellow-200/70">{payout.effectivePercent.toFixed(1)}%</div>
                  </div>
                ))}
                <div className="text-right font-bold text-zinc-400">{formatNumber(row.remainingPrizePoolPoints)}P</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid">
        <Button onClick={onClose} className="h-12 rounded-2xl bg-zinc-800 text-white">
          Готово
        </Button>
      </div>
    </AppDialog>
  );
}
