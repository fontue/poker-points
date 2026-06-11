import type { Player, PlayerCounterField, TournamentState } from './types';

export function normalizeCounter(value: unknown) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) return 0;
  return Math.floor(numericValue);
}

export function normalizePlayerCounters(player: Player): Player {
  const buyIns = normalizeCounter(player.buyIns);
  const paidEntries = Math.min(normalizeCounter(player.paidEntries), buyIns);

  return {
    ...player,
    buyIns,
    paidEntries
  };
}

export function canIncrementPlayerField(player: Player, field: PlayerCounterField) {
  if (field === 'paidEntries') return player.paidEntries < player.buyIns;
  return true;
}

export function hasDuplicatePlayerName(players: Player[], name: string) {
  return players.some((player) => player.name.toLowerCase() === name.toLowerCase());
}

export function updatePlayer(
  state: TournamentState,
  playerId: string,
  updater: (player: Player) => Player
): TournamentState {
  return {
    ...state,
    players: state.players.map((player) => (player.id === playerId ? normalizePlayerCounters(updater(player)) : player))
  };
}
