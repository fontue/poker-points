import { useEffect, useMemo, useReducer } from 'react';
import {
  calculatePrizePayouts,
  calculateTotals,
  getEliminatedPlaceMap,
  hasDuplicatePlayerName,
  normalizeName,
  tournamentReducer
} from '@/lib/game';
import type { PlayerCounterField, Settings } from '@/lib/game';
import { loadState, saveState } from '@/lib/storage';

export function useTournamentState() {
  const [state, dispatch] = useReducer(tournamentReducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (!state.timer.isRunning) return;

    const intervalId = window.setInterval(() => {
      dispatch({ type: 'timer/tick', now: Date.now() });
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [state.timer.isRunning]);

  useEffect(() => {
    function syncTimerAfterVisibilityChange() {
      dispatch({ type: 'timer/tick', now: Date.now() });
    }

    window.addEventListener('focus', syncTimerAfterVisibilityChange);
    document.addEventListener('visibilitychange', syncTimerAfterVisibilityChange);

    return () => {
      window.removeEventListener('focus', syncTimerAfterVisibilityChange);
      document.removeEventListener('visibilitychange', syncTimerAfterVisibilityChange);
    };
  }, []);

  const totals = useMemo(() => calculateTotals(state.players, state.settings), [state.players, state.settings]);
  const eliminatedPlaces = useMemo(() => getEliminatedPlaceMap(state.players), [state.players]);
  const prizePayouts = useMemo(
    () => calculatePrizePayouts(totals.prizePoints, state.settings, state.players, eliminatedPlaces),
    [eliminatedPlaces, state.players, state.settings, totals.prizePoints]
  );
  const existingPlayerNames = useMemo(() => state.players.map((player) => player.name), [state.players]);

  function updateSettings(settingsPatch: Partial<Settings>) {
    dispatch({ type: 'settings/update', patch: settingsPatch });
  }

  function addPlayerByName(name: string) {
    const normalizedName = normalizeName(name);
    if (!normalizedName || hasDuplicatePlayerName(state.players, normalizedName)) return null;

    dispatch({ type: 'player/add', name: normalizedName });
    return normalizedName;
  }

  function increment(playerId: string, field: PlayerCounterField) {
    dispatch({ type: 'player/increment', playerId, field });
  }

  function decrement(playerId: string, field: PlayerCounterField) {
    dispatch({ type: 'player/decrement', playerId, field });
  }

  function eliminate(playerId: string) {
    dispatch({ type: 'player/eliminate', playerId, eliminatedAt: Date.now() });
  }

  function returnToGame(playerId: string) {
    dispatch({ type: 'player/return', playerId });
  }

  function deletePlayer(playerId: string) {
    dispatch({ type: 'player/delete', playerId });
  }

  function reset() {
    dispatch({ type: 'tournament/reset' });
  }

  function toggleTimer() {
    dispatch({ type: 'timer/toggle', now: Date.now() });
  }

  function nextTimerLevel() {
    dispatch({ type: 'timer/level/next', now: Date.now() });
  }

  function previousTimerLevel() {
    dispatch({ type: 'timer/level/previous', now: Date.now() });
  }

  function setTimerLevel(levelIndex: number) {
    dispatch({ type: 'timer/level/set', levelIndex, now: Date.now() });
  }

  function resetTimerLevel() {
    dispatch({ type: 'timer/reset', now: Date.now() });
  }

  return {
    state,
    totals,
    prizePayouts,
    eliminatedPlaces,
    existingPlayerNames,
    updateSettings,
    addPlayerByName,
    increment,
    decrement,
    eliminate,
    returnToGame,
    deletePlayer,
    reset,
    toggleTimer,
    nextTimerLevel,
    previousTimerLevel,
    setTimerLevel,
    resetTimerLevel
  };
}
