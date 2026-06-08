import type { PlayerCounterField } from './game';

export type AppModal =
  | { type: 'add-player' }
  | { type: 'settings' }
  | { type: 'reference' }
  | { type: 'totals' }
  | { type: 'reset-tournament' }
  | { type: 'delete-player'; playerId: string }
  | { type: 'return-player'; playerId: string }
  | { type: 'decrement-player-field'; playerId: string; field: PlayerCounterField; playerName: string };
