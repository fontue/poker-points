import type { Player, PlayerCounterField, TournamentState } from './types';

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
    paidToken: 0,
    isEliminated: false,
    eliminatedAt: null
  };
}

export function addPlayerToState(state: TournamentState, name: string): TournamentState {
  const normalizedName = normalizeName(name);
  if (!normalizedName) return state;

  const isDuplicate = state.players.some((player) => player.name.toLowerCase() === normalizedName.toLowerCase());
  if (isDuplicate) return state;

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
      if (field === 'paidToken' && player.paidToken >= player.buyIns) return player;

      return { ...player, [field]: player[field] + 1 };
    })
  };
}

export function decrementPlayerField(
  state: TournamentState,
  playerId: string,
  field: PlayerCounterField
): TournamentState {
  return {
    ...state,
    players: state.players.map((player) =>
      player.id === playerId ? { ...player, [field]: Math.max(0, player[field] - 1) } : player
    )
  };
}

export function deletePlayerFromState(state: TournamentState, playerId: string): TournamentState {
  return {
    ...state,
    players: state.players.filter((player) => player.id !== playerId)
  };
}
