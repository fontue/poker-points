import type { Player, TournamentState } from './types';

export function normalizePlayer(player: Partial<Player>, index: number): Player {
  const isEliminated = Boolean(player.isEliminated);
  const eliminatedAt = Number(player.eliminatedAt);

  return {
    id: String(player.id || ''),
    name: String(player.name || ''),
    buyIns: Number(player.buyIns) || 0,
    paidToken: Number(player.paidToken) || 0,
    isEliminated,
    eliminatedAt: isEliminated ? (Number.isFinite(eliminatedAt) ? eliminatedAt : index) : null
  };
}

export function getEliminatedPlaceMap(players: Player[]): Map<string, number> {
  const eliminatedPlayers = players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => player.isEliminated)
    .sort((a, b) => (a.player.eliminatedAt || 0) - (b.player.eliminatedAt || 0) || a.index - b.index);

  return new Map(eliminatedPlayers.map(({ player }, index) => [player.id, players.length - index]));
}

export function eliminatePlayer(state: TournamentState, playerId: string): TournamentState {
  return {
    ...state,
    players: state.players.map((player) =>
      player.id === playerId ? { ...player, isEliminated: true, eliminatedAt: Date.now() } : player
    )
  };
}

export function returnPlayerToGame(state: TournamentState, playerId: string): TournamentState {
  return {
    ...state,
    players: state.players.map((player) =>
      player.id === playerId ? { ...player, isEliminated: false, eliminatedAt: null } : player
    )
  };
}
