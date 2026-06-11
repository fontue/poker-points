import { AnimatePresence } from 'framer-motion';
import { PlayerCard } from './PlayerCard';
import type { Player } from '@/lib/game';

type PlayersListProps = {
  players: Player[];
  buyInPoints: number;
  eliminatedPlaces: Map<string, number>;
  onIncrementBuyIns: (playerId: string) => void;
  onDecrementBuyIns: (playerId: string) => void;
  onIncrementPaidEntries: (playerId: string) => void;
  onDecrementPaidEntries: (playerId: string) => void;
  onToggleEliminated: (playerId: string) => void;
  onDelete: (playerId: string) => void;
};

export function PlayersList({
  players,
  buyInPoints,
  eliminatedPlaces,
  onIncrementBuyIns,
  onDecrementBuyIns,
  onIncrementPaidEntries,
  onDecrementPaidEntries,
  onToggleEliminated,
  onDelete
}: PlayersListProps) {
  return (
    <section className="space-y-4">
      <AnimatePresence>
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            buyInPoints={buyInPoints}
            place={eliminatedPlaces.get(player.id)}
            onIncrementBuyIns={onIncrementBuyIns}
            onDecrementBuyIns={onDecrementBuyIns}
            onIncrementPaidEntries={onIncrementPaidEntries}
            onDecrementPaidEntries={onDecrementPaidEntries}
            onToggleEliminated={onToggleEliminated}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>

      {players.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center text-zinc-500">
          Добавь первого игрока, чтобы начать считать бай-ины и оплату жетонами.
        </div>
      )}
    </section>
  );
}
