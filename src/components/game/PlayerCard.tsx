import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPlayerCardClass } from '@/lib/ui';
import { CounterRow } from './CounterRow';
import { PlayerPaymentBadge } from './PlayerPaymentBadge';
import type { Player } from '@/lib/game';

type PlayerCardProps = {
  player: Player;
  buyInPoints: number;
  place?: number;
  onIncrementBuyIns: (playerId: string) => void;
  onDecrementBuyIns: (playerId: string) => void;
  onIncrementPaidEntries: (playerId: string) => void;
  onDecrementPaidEntries: (playerId: string) => void;
  onToggleEliminated: (playerId: string) => void;
  onDelete: (playerId: string) => void;
};

export function PlayerCard({
  player,
  buyInPoints,
  place,
  onIncrementBuyIns,
  onDecrementBuyIns,
  onIncrementPaidEntries,
  onDecrementPaidEntries,
  onToggleEliminated,
  onDelete
}: PlayerCardProps) {
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
              <PlayerPaymentBadge player={player} buyInPoints={buyInPoints} />

              <button onClick={() => onDelete(player.id)} className="rounded-2xl bg-white/10 p-2 text-zinc-400 active:scale-95">
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <CounterRow
              value={player.buyIns}
              colorClass="bg-violet-600"
              onInc={() => onIncrementBuyIns(player.id)}
              onDec={() => onDecrementBuyIns(player.id)}
            />

            <CounterRow
              value={player.paidEntries}
              colorClass={player.paidEntries >= player.buyIns ? 'bg-zinc-700' : 'bg-orange-500'}
              onInc={() => onIncrementPaidEntries(player.id)}
              onDec={() => onDecrementPaidEntries(player.id)}
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
