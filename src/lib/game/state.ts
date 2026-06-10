import { normalizePlayer } from './elimination';
import { defaultSettings, normalizeSettings } from './settings';
import type { TournamentState } from './types';

export const defaultState: TournamentState = {
  settings: defaultSettings,
  players: []
};

export function normalizeGameState(parsedState: unknown): TournamentState {
  const parsed = parsedState && typeof parsedState === 'object' ? parsedState : {};
  const rawSettings =
    'settings' in parsed && parsed.settings && typeof parsed.settings === 'object'
      ? (parsed.settings as Record<string, unknown>)
      : {};
  const rawPlayers = 'players' in parsed && Array.isArray(parsed.players) ? parsed.players : [];

  return {
    settings: normalizeSettings(rawSettings),
    players: rawPlayers.map(normalizePlayer)
  };
}
