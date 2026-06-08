import { normalizePlayer } from './elimination';
import type { TournamentState } from './types';

export const defaultState: TournamentState = {
  settings: {
    buyInPoints: 2000,
    buyInChips: 50000,
    commission: 0
  },
  players: []
};

export function normalizeGameState(parsedState: unknown): TournamentState {
  const parsed = parsedState && typeof parsedState === 'object' ? parsedState : {};
  const rawSettings = 'settings' in parsed && parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {};
  const rawPlayers = 'players' in parsed && Array.isArray(parsed.players) ? parsed.players : [];

  return {
    settings: { ...defaultState.settings, ...rawSettings },
    players: rawPlayers.map(normalizePlayer)
  };
}
