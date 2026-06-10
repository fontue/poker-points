import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { totalMetrics } from '@/lib/metrics';
import { metricTones } from '@/lib/ui';
import { AppDialog } from './AppDialog';
import type { PrizePayout, Totals } from '@/lib/game';
import type { MetricTone } from '@/lib/ui';

type TotalRowProps = {
  label: string;
  value: number;
  suffix?: string;
  tone: MetricTone;
};

function TotalRow({ label, value, suffix = '', tone }: TotalRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-zinc-900 px-4 py-3 ring-1 ring-white/10">
      <span className={`text-sm font-bold ${tone.label}`}>{label}</span>
      <span className={`text-lg font-black ${tone.value}`}>
        {formatNumber(value)}
        {suffix}
      </span>
    </div>
  );
}

type PrizePayoutRowProps = {
  payout: PrizePayout;
};

function PrizePayoutRow({ payout }: PrizePayoutRowProps) {
  return (
    <div className="rounded-2xl bg-zinc-900 px-4 py-3 ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-black text-yellow-100">{payout.place} место</div>
          <div className="truncate text-xs font-bold text-zinc-500">{payout.playerName || 'Игрок ещё не определён'}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-yellow-100">{formatNumber(payout.amount)}P</div>
          <div className="text-xs font-bold text-yellow-200/70">{formatNumber(payout.percent)}%</div>
        </div>
      </div>
    </div>
  );
}

type TotalsDialogProps = {
  totals: Totals;
  prizePayouts: PrizePayout[];
  onClose: () => void;
};

export function TotalsDialog({ totals, prizePayouts, onClose }: TotalsDialogProps) {
  return (
    <AppDialog onClose={onClose}>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Итоги игры</h3>
      </div>

      <div className="space-y-2">
        {totalMetrics.map((metric) => (
          <TotalRow
            key={metric.key}
            label={metric.label}
            value={totals[metric.key]}
            suffix={metric.suffix}
            tone={metricTones[metric.tone]}
          />
        ))}
      </div>

      <div className="mt-4">
        <div className="mb-2 text-left text-sm font-black text-zinc-100">Призовые места</div>
        <div className="space-y-2">
          {prizePayouts.map((payout) => (
            <PrizePayoutRow key={payout.place} payout={payout} />
          ))}
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
