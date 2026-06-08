import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';
import { getPlayerCardClass } from '@/lib/ui';
import { CounterRow } from './CounterRow';

export function PlayerCard({ player, buyInPoints, place, onIncrement, onRequestDecrement, onToggleEliminated, onDelete }) {
  const unpaid = Math.max(0, player.buyIns - player.paidToken);
  const unpaidPoints = unpaid * buyInPoints;
  const isPaid = unpaid === 0 && player.buyIns > 0;
  const isEliminated = Boolean(player.isEliminated);

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
      <Card
        className={`overflow-hidden rounded-3xl border-white/10 text-white shadow-xl transition-colors ${
          getPlayerCardClass(isEliminated, place)
        }`}
      >
        <CardContent className="pl-3 pr-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="-ml-1 min-w-0 truncate text-xl font-black tracking-tight">{player.name}</h2>

            <div className="flex items-center gap-2">
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

              <button onClick={() => onDelete(player.id)} className="rounded-2xl bg-white/10 p-2 text-zinc-400 active:scale-95">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <CounterRow
              value={player.buyIns}
              colorClass="bg-violet-600"
              onInc={() => onIncrement(player.id, 'buyIns')}
              onDec={() => onRequestDecrement(player.id, 'buyIns')}
            />

            <CounterRow
              value={player.paidToken}
              colorClass={player.paidToken >= player.buyIns ? 'bg-zinc-700' : 'bg-orange-500'}
              onInc={() => onIncrement(player.id, 'paidToken')}
              onDec={() => onRequestDecrement(player.id, 'paidToken')}
            />

            <Button
              onClick={() => onToggleEliminated(player.id)}
              className={`h-full min-h-12 rounded-2xl bg-zinc-800 px-2 text-xs font-black ${
                isEliminated ? 'text-red-300' : 'text-zinc-200'
              }`}
            >
              {isEliminated ? 'Выбыл' : 'В игре'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
