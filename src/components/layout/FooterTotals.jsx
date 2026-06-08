import { formatNumber } from '@/lib/format';
import { metricTones } from '@/lib/ui';

function FooterStat({ label, value, suffix = '', tone }) {
  return (
    <div className={`rounded-xl px-2 py-1.5 text-center ring-1 ${tone.footer}`}>
      <div className={`text-[9px] font-bold uppercase tracking-tight ${tone.label}`}>{label}</div>
      <div className={`text-sm font-black ${tone.value}`}>
        {formatNumber(value)}
        {suffix}
      </div>
    </div>
  );
}

export function FooterTotals({ totals, onOpen }) {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-black/80 px-3 pb-2 pt-1 backdrop-blur-xl">
      <button
        type="button"
        onClick={onOpen}
        className="mb-2 grid w-full max-w-[430px] grid-cols-3 gap-1.5 rounded-2xl bg-zinc-950 p-1.5 text-left shadow-2xl ring-1 ring-white/10 active:scale-[0.99]"
      >
        <FooterStat label="Поинты в игре" value={totals.pointsInGame} suffix="P" tone={metricTones.points} />
        <FooterStat label="Оплачено" value={totals.pointsPaidByTokens} suffix="P" tone={metricTones.paid} />
        <FooterStat label="Фишки" value={totals.chipsInGame} tone={metricTones.chips} />
      </button>
    </footer>
  );
}
