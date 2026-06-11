import { formatNumber } from '@/lib/format';
import { footerMetrics } from '@/lib/metrics';
import { metricTones } from '@/lib/ui';
import type { Totals } from '@/lib/game';
import type { MetricTone } from '@/lib/ui';

type FooterStatProps = {
  label: string;
  value: number;
  suffix?: string;
  tone: MetricTone;
};

function FooterStat({ label, value, suffix = '', tone }: FooterStatProps) {
  return (
    <div className={`rounded-xl px-2 py-1.5 text-center ring-1 ${tone.footer || ''}`}>
      <div className={`text-[9px] font-bold uppercase tracking-tight ${tone.label}`}>{label}</div>
      <div className={`text-sm font-black ${tone.value}`}>
        {formatNumber(value)}
        {suffix}
      </div>
    </div>
  );
}

type FooterTotalsProps = {
  totals: Totals;
  onOpen: () => void;
};

export function FooterTotals({ totals, onOpen }: FooterTotalsProps) {
  return (
    <footer className="-mx-4 shrink-0 bg-black/80 px-3 pb-[max(0.125rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl">
      <button
        type="button"
        onClick={onOpen}
        className="grid w-full grid-cols-3 gap-1.5 rounded-2xl bg-zinc-950 p-1.5 text-left shadow-2xl ring-1 ring-white/10 active:scale-[0.99]"
      >
        {footerMetrics.map((metric) => (
          <FooterStat
            key={metric.key}
            label={metric.label}
            value={totals[metric.key]}
            suffix={metric.suffix}
            tone={metricTones[metric.tone]}
          />
        ))}
      </button>
    </footer>
  );
}
