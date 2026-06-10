import type { Player, TournamentState } from './types';
import { normalizeCounter, normalizePlayerCounters, updatePlayer } from './invariants';

type LegacyPlayer = Partial<Player> & {
  paidToken?: unknown;
};

export function normalizePlayer(player: LegacyPlayer, index: number): Player {
  const isEliminated = Boolean(player.isEliminated);
  const eliminatedAt = Number(player.eliminatedAt);
  const paidEntries = player.paidEntries ?? player.paidToken;

  return normalizePlayerCounters({
    id: String(player.id || ''),
    name: String(player.name || ''),
    buyIns: normalizeCounter(player.buyIns),
    paidEntries: normalizeCounter(paidEntries),
    isEliminated,
    eliminatedAt: isEliminated ? (Number.isFinite(eliminatedAt) ? eliminatedAt : index) : null
  });
}

export function getEliminatedPlaceMap(players: Player[]): Map<string, number> {
  const activePlayers = players.filter((player) => !player.isEliminated);
  const eliminatedPlayers = players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => player.isEliminated)
    .sort((a, b) => (a.player.eliminatedAt || 0) - (b.player.eliminatedAt || 0) || a.index - b.index);

  const placeMap = new Map(eliminatedPlayers.map(({ player }, index) => [player.id, players.length - index]));

  if (activePlayers.length === 1 && players.length > 1) {
    placeMap.set(activePlayers[0].id, 1);
  }

  return placeMap;
}

export function eliminatePlayer(state: TournamentState, playerId: string, eliminatedAt: number): TournamentState {
  return updatePlayer(state, playerId, (player) => ({ ...player, isEliminated: true, eliminatedAt }));
}

export function returnPlayerToGame(state: TournamentState, playerId: string): TournamentState {
  return updatePlayer(state, playerId, (player) => ({ ...player, isEliminated: false, eliminatedAt: null }));
}
