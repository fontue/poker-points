import { clampNumber } from '../format';
import { addPlayerToState, decrementPlayerField, deletePlayerFromState, incrementPlayerField } from './players';
import { eliminatePlayer, returnPlayerToGame } from './elimination';
import { defaultState } from './state';
import type { PlayerCounterField, Settings, TournamentState } from './types';

export type TournamentAction =
  | { type: 'settings/update'; patch: Partial<Settings> }
  | { type: 'player/add'; name: string }
  | { type: 'player/increment'; playerId: string; field: PlayerCounterField }
  | { type: 'player/decrement'; playerId: string; field: PlayerCounterField }
  | { type: 'player/eliminate'; playerId: string; eliminatedAt: number }
  | { type: 'player/return'; playerId: string }
  | { type: 'player/delete'; playerId: string }
  | { type: 'tournament/reset' };

function updateSettings(state: TournamentState, patch: Partial<Settings>): TournamentState {
  return {
    ...state,
    settings: {
      ...state.settings,
      ...Object.fromEntries(Object.entries(patch).map(([key, value]) => [key, clampNumber(value)]))
    }
  };
}

function assertNever(action: never): never {
  throw new Error(`Unhandled tournament action: ${JSON.stringify(action)}`);
}

export function tournamentReducer(state: TournamentState, action: TournamentAction): TournamentState {
  switch (action.type) {
    case 'settings/update':
      return updateSettings(state, action.patch);
    case 'player/add':
      return addPlayerToState(state, action.name);
    case 'player/increment':
      return incrementPlayerField(state, action.playerId, action.field);
    case 'player/decrement':
      return decrementPlayerField(state, action.playerId, action.field);
    case 'player/eliminate':
      return eliminatePlayer(state, action.playerId, action.eliminatedAt);
    case 'player/return':
      return returnPlayerToGame(state, action.playerId);
    case 'player/delete':
      return deletePlayerFromState(state, action.playerId);
    case 'tournament/reset':
      return defaultState;
    default:
      return assertNever(action);
  }
}
