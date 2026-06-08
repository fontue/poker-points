import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { metricTones } from '@/lib/ui';
import { AppDialog } from './AppDialog';

function TotalRow({ label, value, suffix = '', tone }) {
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

export function TotalsDialog({ totals, onClose }) {
  return (
    <AppDialog onClose={onClose}>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Итоги игры</h3>
      </div>

      <div className="space-y-2">
        <TotalRow label="Поинты в игре" value={totals.pointsInGame} suffix="P" tone={metricTones.points} />
        <TotalRow label="Оплачено" value={totals.pointsPaidByTokens} suffix="P" tone={metricTones.paid} />
        <TotalRow label="Призовые" value={totals.prizePoints} suffix="P" tone={metricTones.prize} />
        <TotalRow label="Фишки" value={totals.chipsInGame} tone={metricTones.chips} />
        <TotalRow label="Средний стек" value={totals.averageStack} tone={metricTones.neutral} />
      </div>

      <div className="mt-4 grid">
        <Button onClick={onClose} className="h-12 rounded-2xl bg-zinc-800 text-white">
          Готово
        </Button>
      </div>
    </AppDialog>
  );
}
