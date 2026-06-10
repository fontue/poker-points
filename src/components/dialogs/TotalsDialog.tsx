import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { AppDialog } from './AppDialog';
import type { PrizePayout, Settings, Totals, TournamentTimer } from '@/lib/game';
import type { ReactNode } from 'react';

type StatCardProps = {
  label: string;
  value: string;
  tone?: 'points' | 'paid' | 'prize' | 'chips' | 'neutral';
};

const statToneClasses = {
  points: 'bg-violet-600/15 text-violet-100 ring-violet-500/20',
  paid: 'bg-orange-500/15 text-orange-100 ring-orange-500/20',
  prize: 'bg-yellow-500/15 text-yellow-100 ring-yellow-500/20',
  chips: 'bg-emerald-600/15 text-emerald-100 ring-emerald-500/20',
  neutral: 'bg-zinc-900 text-zinc-100 ring-white/10'
} satisfies Record<NonNullable<StatCardProps['tone']>, string>;

function StatCard({ label, value, tone = 'neutral' }: StatCardProps) {
  return (
    <div className={`rounded-2xl px-3 py-3 text-left ring-1 ${statToneClasses[tone]}`}>
      <div className="text-[11px] font-black uppercase text-current/65">{label}</div>
      <div className="mt-1 text-lg font-black leading-none">{value}</div>
    </div>
  );
}

type TotalsSectionProps = {
  title: string;
  children: ReactNode;
};

function TotalsSection({ title, children }: TotalsSectionProps) {
  return (
    <section className="text-left">
      <div className="mb-2 text-sm font-black text-zinc-100">{title}</div>
      {children}
    </section>
  );
}

type ChipStackCardProps = {
  label: string;
  value: number;
  bigBlinds: number;
  tone: 'chips' | 'stack';
};

function ChipStackCard({ label, value, bigBlinds, tone }: ChipStackCardProps) {
  const toneClasses =
    tone === 'chips'
      ? 'bg-emerald-500/15 text-emerald-100 ring-emerald-400/25'
      : 'bg-cyan-500/15 text-cyan-100 ring-cyan-400/25';

  return (
    <div className={`rounded-2xl px-4 py-3 text-left ring-1 ${toneClasses}`}>
      <div className="text-[11px] font-black uppercase text-current/65">{label}</div>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span className="text-xl font-black leading-none">{formatNumber(value)}</span>
        <span className="text-sm font-black text-current/65">({formatBigBlinds(bigBlinds)})</span>
      </div>
    </div>
  );
}

function formatPercent(value: number) {
  return `${value.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%`;
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
          <div className="text-xs font-bold text-yellow-200/70">{formatPercent(payout.effectivePercent)}</div>
        </div>
      </div>
    </div>
  );
}

type TotalsDialogProps = {
  settings: Settings;
  timer: TournamentTimer;
  totals: Totals;
  prizePayouts: PrizePayout[];
  onClose: () => void;
};

function formatPoints(value: number) {
  return `${formatNumber(value)}P`;
}

function formatBigBlinds(value: number) {
  return `${value.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} BB`;
}

export function TotalsDialog({ settings, timer, totals, prizePayouts, onClose }: TotalsDialogProps) {
  const currentLevel = settings.timerLevels[timer.currentLevelIndex] || settings.timerLevels[0];
  const currentBigBlind = Math.max(1, currentLevel?.bigBlind || 1);
  const chipsInBigBlinds = totals.chipsInGame / currentBigBlind;
  const averageStackInBigBlinds = totals.averageStack / currentBigBlind;
  const secondPlacePayout = prizePayouts.find((payout) => payout.place === 2)?.amount || 0;
  const lowerPlacePayouts = prizePayouts.reduce((sum, payout) => (payout.place > 2 ? sum + payout.amount : sum), 0);
  const finalTablePrizeRemainder =
    secondPlacePayout > 0 ? Math.max(0, totals.prizePoints - lowerPlacePayouts - secondPlacePayout * 2) : totals.prizePoints;

  return (
    <AppDialog onClose={onClose}>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Информация об игре</h3>
      </div>

      <div className="space-y-4">
        <TotalsSection title="Поинты">
          <div className="grid grid-cols-3 gap-2">
            <StatCard label="В игре" value={formatPoints(totals.pointsInGame)} tone="points" />
            <StatCard label="Оплачено" value={formatPoints(totals.pointsPaidByTokens)} tone="paid" />
            <StatCard label="Призовые" value={formatPoints(totals.prizePoints)} tone="prize" />
          </div>
        </TotalsSection>

        <TotalsSection title={`Фишки и стек · BB ${formatNumber(currentBigBlind)}`}>
          <div className="grid grid-cols-2 gap-2">
            <ChipStackCard label="Все фишки" value={totals.chipsInGame} bigBlinds={chipsInBigBlinds} tone="chips" />
            <ChipStackCard label="Средний стек" value={totals.averageStack} bigBlinds={averageStackInBigBlinds} tone="stack" />
          </div>
        </TotalsSection>

        <TotalsSection title="Призовые места">
          <div className="space-y-2">
            {prizePayouts.map((payout) => (
              <PrizePayoutRow key={payout.place} payout={payout} />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between rounded-2xl bg-zinc-900 px-4 py-3 ring-1 ring-yellow-500/20">
            <span className="text-sm font-bold text-zinc-300">Осталось за финальным столом</span>
            <span className="text-lg font-black text-yellow-100">{formatPoints(finalTablePrizeRemainder)}</span>
          </div>
        </TotalsSection>
      </div>

      <div className="sticky -bottom-5 -mx-5 -mb-5 mt-4 grid border-t border-white/10 bg-zinc-950 px-5 pb-5 pt-3">
        <Button onClick={onClose} className="h-12 rounded-2xl bg-zinc-800 text-white">
          Закрыть
        </Button>
      </div>
    </AppDialog>
  );
}
