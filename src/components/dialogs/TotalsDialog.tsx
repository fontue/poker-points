import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { totalMetrics } from '@/lib/metrics';
import { metricTones } from '@/lib/ui';
import { AppDialog } from './AppDialog';
import type { Totals } from '@/lib/game';
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

type TotalsDialogProps = {
  totals: Totals;
  onClose: () => void;
};

export function TotalsDialog({ totals, onClose }: TotalsDialogProps) {
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

      <div className="mt-4 grid">
        <Button onClick={onClose} className="h-12 rounded-2xl bg-zinc-800 text-white">
          Готово
        </Button>
      </div>
    </AppDialog>
  );
}
