import type { Player, PlayerCounterField, TournamentState } from './types';
import { canIncrementPlayerField, hasDuplicatePlayerName, normalizePlayerCounters, updatePlayer } from './invariants';

export function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createPlayer(name: string): Player {
  return {
    id: createId(),
    name: name.trim(),
    buyIns: 1,
    paidEntries: 0,
    isEliminated: false,
    eliminatedAt: null
  };
}

export function addPlayerToState(state: TournamentState, name: string): TournamentState {
  const normalizedName = normalizeName(name);
  if (!normalizedName) return state;

  if (hasDuplicatePlayerName(state.players, normalizedName)) return state;

  return {
    ...state,
    players: [...state.players, createPlayer(normalizedName)]
  };
}

export function incrementPlayerField(
  state: TournamentState,
  playerId: string,
  field: PlayerCounterField
): TournamentState {
  return {
    ...state,
    players: state.players.map((player) => {
      if (player.id !== playerId) return player;
      if (!canIncrementPlayerField(player, field)) return player;

      return normalizePlayerCounters({ ...player, [field]: player[field] + 1 });
    })
  };
}

export function decrementPlayerField(
  state: TournamentState,
  playerId: string,
  field: PlayerCounterField
): TournamentState {
  return updatePlayer(state, playerId, (player) => ({ ...player, [field]: Math.max(0, player[field] - 1) }));
}

export function deletePlayerFromState(state: TournamentState, playerId: string): TournamentState {
  return {
    ...state,
    players: state.players.filter((player) => player.id !== playerId)
  };
}
