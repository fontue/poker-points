import { defaultState, normalizeGameState } from './game';
import type { TournamentState } from './game';

const STORAGE_KEY = 'poker-points-pwa-state-v1';
const PLAYER_NAMES_STORAGE_KEY = 'poker-points-player-names-v1';

export function loadState(): TournamentState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return normalizeGameState(JSON.parse(raw));
  } catch {
    return defaultState;
  }
}

export function saveState(state: TournamentState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadPlayerNamesHistory(): string[] {
  try {
    const raw = localStorage.getItem(PLAYER_NAMES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((name) => typeof name === 'string' && name.trim()) : [];
  } catch {
    return [];
  }
}

export function savePlayerNamesHistory(history: string[]) {
  localStorage.setItem(PLAYER_NAMES_STORAGE_KEY, JSON.stringify(history));
}
