import { useEffect, useMemo, useReducer } from 'react';
import {
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

  const totals = useMemo(() => calculateTotals(state.players, state.settings), [state.players, state.settings]);
  const eliminatedPlaces = useMemo(() => getEliminatedPlaceMap(state.players), [state.players]);
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

  return {
    state,
    totals,
    eliminatedPlaces,
    existingPlayerNames,
    updateSettings,
    addPlayerByName,
    increment,
    decrement,
    eliminate,
    returnToGame,
    deletePlayer,
    reset
  };
}
