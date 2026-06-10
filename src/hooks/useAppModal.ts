import { useState } from 'react';
import type { PlayerCounterField } from '@/lib/game';
import type { AppModal } from '@/lib/modal';

export function useAppModal() {
  const [modal, setModal] = useState<AppModal | null>(null);

  return {
    modal,
    closeModal: () => setModal(null),
    openAddPlayer: () => setModal({ type: 'add-player' }),
    openSettings: () => setModal({ type: 'settings' }),
    openPrizeSettings: () => setModal({ type: 'prize-settings' }),
    openTimerSettings: () => setModal({ type: 'timer-settings' }),
    openReference: () => setModal({ type: 'reference' }),
    openTotals: () => setModal({ type: 'totals' }),
    openResetTimer: () => setModal({ type: 'reset-timer' }),
    openResetTournament: () => setModal({ type: 'reset-tournament' }),
    openDeletePlayer: (playerId: string) => setModal({ type: 'delete-player', playerId }),
    openReturnPlayer: (playerId: string) => setModal({ type: 'return-player', playerId }),
    openDecrementPlayerField: (playerId: string, field: PlayerCounterField, playerName: string) =>
      setModal({ type: 'decrement-player-field', playerId, field, playerName })
  };
}
