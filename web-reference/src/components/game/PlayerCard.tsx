import { motion } from 'framer-motion';
import { Coins, CreditCard, Medal, Minus, Trash2, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getPlayerCardClass } from '@/lib/ui';
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

function getPrizeMedalClass(place?: number) {
  if (place === 1) return 'text-yellow-300';
  if (place === 2) return 'text-zinc-200';
  if (place === 3) return 'text-orange-300';
  return '';
}

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
  const [visibleActionsSide, setVisibleActionsSide] = useState<'left' | 'right' | null>(null);
  const leftActionsWidth = 140;
  const rightActionsWidth = 140;
  const medalClass = getPrizeMedalClass(place);

  function closeActions() {
    setVisibleActionsSide(null);
  }

  function decrementBuyIns() {
    closeActions();
    onDecrementBuyIns(player.id);
  }

  function decrementPaidEntries() {
    closeActions();
    onDecrementPaidEntries(player.id);
  }

  function toggleEliminated() {
    closeActions();
    onToggleEliminated(player.id);
  }

  function deletePlayer() {
    closeActions();
    onDelete(player.id);
  }

  function getCardOffset() {
    if (visibleActionsSide === 'left') return leftActionsWidth;
    if (visibleActionsSide === 'right') return -rightActionsWidth;
    return 0;
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="relative overflow-hidden rounded-3xl"
    >
      <div className="absolute left-0 top-0.5 bottom-0.5 grid w-[132px] grid-cols-2 overflow-hidden rounded-3xl">
        <button
          type="button"
          onClick={decrementBuyIns}
          disabled={player.buyIns <= 0}
          className="grid place-items-center bg-violet-600/85 text-white disabled:text-white/30 active:brightness-110"
          aria-label={`Убрать бай-ин у игрока ${player.name}`}
        >
          <span className="flex items-center gap-1">
            <Minus size={14} strokeWidth={3} />
            <Coins size={16} />
          </span>
        </button>
        <button
          type="button"
          onClick={decrementPaidEntries}
          disabled={player.paidEntries <= 0}
          className="grid place-items-center bg-orange-500/85 text-white disabled:text-white/30 active:brightness-110"
          aria-label={`Убрать оплату у игрока ${player.name}`}
        >
          <span className="flex items-center gap-1">
            <Minus size={14} strokeWidth={3} />
            <CreditCard size={16} />
          </span>
        </button>
      </div>

      <div className="absolute right-0 top-0.5 bottom-0.5 flex w-[132px] overflow-hidden rounded-3xl">
        <button
          type="button"
          onClick={toggleEliminated}
          className={`grid flex-1 place-items-center text-white active:brightness-110 ${
            isEliminated ? 'bg-emerald-600/85 active:bg-emerald-600' : 'bg-zinc-700 active:bg-zinc-600'
          }`}
          aria-label={isEliminated ? `Вернуть игрока ${player.name} в игру` : `Отметить игрока ${player.name} выбывшим`}
        >
          {isEliminated ? <UserCheck size={22} /> : <UserX size={22} />}
        </button>

        <button
          type="button"
          onClick={deletePlayer}
          className="grid flex-1 place-items-center bg-red-500/85 text-white active:brightness-110 active:bg-red-500"
          aria-label={`Удалить игрока ${player.name}`}
        >
          <Trash2 size={22} />
        </button>
      </div>

      <motion.div
        drag="x"
        dragDirectionLock
        dragPropagation={false}
        dragConstraints={{ left: -rightActionsWidth, right: leftActionsWidth }}
        dragElastic={0.03}
        dragMomentum={false}
        animate={{ x: getCardOffset() }}
        transition={{ type: 'spring', stiffness: 520, damping: 42, mass: 0.8 }}
        onDragEnd={(_, info) => {
          if (visibleActionsSide === 'left') {
            if (info.offset.x < -40 || info.velocity.x < -320) setVisibleActionsSide(null);
            return;
          }

          if (visibleActionsSide === 'right') {
            if (info.offset.x > 40 || info.velocity.x > 320) setVisibleActionsSide(null);
            return;
          }

          if (info.offset.x < -56 || info.velocity.x < -420) {
            setVisibleActionsSide('right');
            return;
          }

          if (info.offset.x > 56 || info.velocity.x > 420) {
            setVisibleActionsSide('left');
            return;
          }

          setVisibleActionsSide(null);
        }}
        className="relative z-10 select-none"
        style={{ touchAction: 'pan-y' }}
      >
        <Card
          className={`overflow-hidden rounded-3xl border-white/10 py-3 text-white shadow-xl transition-colors ${
            getPlayerCardClass(isEliminated, place)
          }`}
        >
          <CardContent className="space-y-2 px-4">
            <div className="grid min-h-9 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <div className="flex min-w-0 justify-self-start items-center gap-2">
                <div
                  className={`min-w-0 truncate text-left text-xl font-black leading-6 tracking-tight ${
                    isEliminated ? 'text-red-300 line-through decoration-red-300/80 decoration-2' : ''
                  }`}
                >
                  {player.name}
                </div>
                {medalClass && <Medal size={18} className={`shrink-0 ${medalClass}`} aria-label={`${place} место`} />}
              </div>
              <PlayerPaymentBadge player={player} buyInPoints={buyInPoints} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onIncrementBuyIns(player.id)}
                className="flex h-11 items-center justify-between rounded-2xl bg-violet-600/20 px-3 text-violet-100 ring-1 ring-violet-400/20 active:scale-[0.99]"
                aria-label={`Добавить бай-ин игроку ${player.name}`}
              >
                <span className="flex items-center gap-2">
                  <Coins size={18} />
                  <span className="text-xs font-black uppercase text-violet-200/75">Бай-ин</span>
                </span>
                <span className="text-xl font-black leading-none">{player.buyIns}</span>
              </button>

              <button
                type="button"
                onClick={() => onIncrementPaidEntries(player.id)}
                disabled={player.paidEntries >= player.buyIns}
                className="flex h-11 items-center justify-between rounded-2xl bg-orange-500/20 px-3 text-amber-100 ring-1 ring-orange-400/20 disabled:text-amber-100/35 disabled:ring-white/10 active:scale-[0.99]"
                aria-label={`Добавить оплату игроку ${player.name}`}
              >
                <span className="flex items-center gap-2">
                  <CreditCard size={18} />
                  <span className="text-xs font-black uppercase text-amber-200/75">Оплата</span>
                </span>
                <span className="text-xl font-black leading-none">{player.paidEntries}</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
