import { Settings2 } from 'lucide-react';
import { formatNumber } from '@/lib/format';

export function SettingsSummaryButton({ settings, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex min-w-0 items-center justify-between rounded-3xl bg-zinc-900/90 p-4 text-left active:scale-[0.99]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-2xl bg-violet-600/20 p-2 text-violet-200">
          <Settings2 size={20} />
        </div>
        <div className="min-w-0">
          <div className="truncate font-bold">Параметры</div>
          <div className="truncate text-sm text-zinc-400">
            {formatNumber(settings.buyInPoints)}P · {formatNumber(settings.buyInChips)} фишек
          </div>
        </div>
      </div>
    </button>
  );
}
