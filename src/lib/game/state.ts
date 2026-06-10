import { normalizePlayer } from './elimination';
import { defaultSettings, normalizeSettings } from './settings';
import { createDefaultTimer, normalizeTimer } from './timer';
import type { TournamentState } from './types';

export const defaultState: TournamentState = {
  settings: defaultSettings,
  players: [],
  timer: createDefaultTimer(defaultSettings)
};

export function normalizeGameState(parsedState: unknown): TournamentState {
  const parsed = parsedState && typeof parsedState === 'object' ? parsedState : {};
  const rawSettings =
    'settings' in parsed && parsed.settings && typeof parsed.settings === 'object'
      ? (parsed.settings as Record<string, unknown>)
      : {};
  const rawPlayers = 'players' in parsed && Array.isArray(parsed.players) ? parsed.players : [];
  const settings = normalizeSettings(rawSettings);
  const rawTimer = 'timer' in parsed && parsed.timer && typeof parsed.timer === 'object' ? parsed.timer : {};

  return {
    settings,
    players: rawPlayers.map(normalizePlayer),
    timer: normalizeTimer(rawTimer, settings)
  };
}
