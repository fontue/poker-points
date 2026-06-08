import { formatNumber } from '@/lib/format';
import type { Player } from '@/lib/game';

type PlayerPaymentBadgeProps = {
  player: Player;
  buyInPoints: number;
};

export function PlayerPaymentBadge({ player, buyInPoints }: PlayerPaymentBadgeProps) {
  const unpaidEntries = Math.max(0, player.buyIns - player.paidEntries);
  const unpaidPoints = unpaidEntries * buyInPoints;
  const isPaid = unpaidEntries === 0 && player.buyIns > 0;

  return (
    <div
      className={`flex items-center gap-2 rounded-2xl px-3 ring-1 ${
        isPaid ? 'bg-[#17302a] ring-emerald-500/25' : 'bg-[#39201f] ring-red-500/25'
      }`}
    >
      <div className={`text-[11px] font-bold uppercase tracking-wide ${isPaid ? 'text-emerald-200/80' : 'text-red-200/80'}`}>
        {isPaid ? 'Оплачено' : 'Не оплачено'}
      </div>

      <div className={`text-xl font-black ${isPaid ? 'text-emerald-300' : 'text-red-300'}`}>
        {isPaid ? '✓' : `${formatNumber(unpaidPoints)}P`}
      </div>
    </div>
  );
}
