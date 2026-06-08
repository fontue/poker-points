import { AnimatePresence } from 'framer-motion';
import { PlayerCard } from './PlayerCard';

export function PlayersList({
  players,
  buyInPoints,
  eliminatedPlaces,
  onIncrement,
  onRequestDecrement,
  onToggleEliminated,
  onDelete
}) {
  return (
    <section className="space-y-4">
      <AnimatePresence>
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            buyInPoints={buyInPoints}
            place={eliminatedPlaces.get(player.id)}
            onIncrement={onIncrement}
            onRequestDecrement={onRequestDecrement}
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
