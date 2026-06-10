import { addPlayerToState, decrementPlayerField, deletePlayerFromState, incrementPlayerField } from './players';
import { eliminatePlayer, returnPlayerToGame } from './elimination';
import { normalizeSettings } from './settings';
import { advanceTimerToTime, getLevelDurationSeconds, syncTimerWithSettings } from './timer';
import type { PlayerCounterField, Settings, TournamentState } from './types';

export type TournamentAction =
  | { type: 'settings/update'; patch: Partial<Settings> }
  | { type: 'player/add'; name: string }
  | { type: 'player/increment'; playerId: string; field: PlayerCounterField }
  | { type: 'player/decrement'; playerId: string; field: PlayerCounterField }
  | { type: 'player/eliminate'; playerId: string; eliminatedAt: number }
  | { type: 'player/return'; playerId: string }
  | { type: 'player/delete'; playerId: string }
  | { type: 'timer/toggle'; now: number }
  | { type: 'timer/tick'; now: number }
  | { type: 'timer/level/set'; levelIndex: number; now: number }
  | { type: 'timer/level/next'; now: number }
  | { type: 'timer/level/previous'; now: number }
  | { type: 'timer/reset'; now: number }
  | { type: 'tournament/reset' };

function updateSettings(state: TournamentState, patch: Partial<Settings>): TournamentState {
  const settings = normalizeSettings({ ...state.settings, ...patch });

  return {
    ...state,
    settings,
    timer: syncTimerWithSettings(state.timer, settings)
  };
}

function setTimerLevel(state: TournamentState, levelIndex: number, now: number): TournamentState {
  const lastLevelIndex = Math.max(0, state.settings.timerLevels.length - 1);
  const currentLevelIndex = Math.min(lastLevelIndex, Math.max(0, levelIndex));
  const remainingSeconds = getLevelDurationSeconds(state.settings.timerLevels[currentLevelIndex]);

  return {
    ...state,
    timer: {
      ...state.timer,
      currentLevelIndex,
      remainingSeconds,
      levelStartedAt: state.timer.isRunning ? now : null,
      endsAt: state.timer.isRunning ? now + remainingSeconds * 1000 : null,
      lastCompletedLevelIndex: null
    }
  };
}

function toggleTimer(state: TournamentState, now: number): TournamentState {
  const timer = advanceTimerToTime(state.timer, state.settings, now);
  if (timer.isRunning) {
    return {
      ...state,
      timer: {
        ...timer,
        isRunning: false,
        levelStartedAt: null,
        endsAt: null,
        lastCompletedLevelIndex: null
      }
    };
  }

  if (timer.remainingSeconds <= 0) return state;

  return {
    ...state,
    timer: {
      ...timer,
      isRunning: true,
      levelStartedAt: now,
      endsAt: now + timer.remainingSeconds * 1000,
      lastCompletedLevelIndex: null
    }
  };
}

function tickTimer(state: TournamentState, now: number): TournamentState {
  const timer = advanceTimerToTime(state.timer, state.settings, now);
  if (
    timer.currentLevelIndex === state.timer.currentLevelIndex &&
    timer.remainingSeconds === state.timer.remainingSeconds &&
    timer.isRunning === state.timer.isRunning &&
    timer.levelStartedAt === state.timer.levelStartedAt &&
    timer.endsAt === state.timer.endsAt
  ) {
    return state;
  }

  return { ...state, timer };
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
    case 'timer/toggle':
      return toggleTimer(state, action.now);
    case 'timer/tick':
      return tickTimer(state, action.now);
    case 'timer/level/set':
      return setTimerLevel(state, action.levelIndex, action.now);
    case 'timer/level/next':
      return setTimerLevel(state, state.timer.currentLevelIndex + 1, action.now);
    case 'timer/level/previous':
      return setTimerLevel(state, state.timer.currentLevelIndex - 1, action.now);
    case 'timer/reset':
      return setTimerLevel(
        { ...state, timer: { ...state.timer, isRunning: false, levelStartedAt: null, endsAt: null, lastCompletedLevelIndex: null } },
        0,
        action.now
      );
    case 'tournament/reset':
      return {
        ...state,
        players: [],
        timer: { ...state.timer, isRunning: false, levelStartedAt: null, endsAt: null, lastCompletedLevelIndex: null }
      };
    default:
      return assertNever(action);
  }
}
