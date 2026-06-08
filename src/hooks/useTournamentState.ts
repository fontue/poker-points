import { useMemo } from 'react';
import { clampNumber } from '@/lib/format';
import {
  addPlayerToState,
  calculateTotals,
  decrementPlayerField,
  defaultState,
  deletePlayerFromState,
  eliminatePlayer,
  getEliminatedPlaceMap,
  incrementPlayerField,
  normalizeName,
  returnPlayerToGame
} from '@/lib/game';
import type { Player, PlayerCounterField, Settings } from '@/lib/game';
import { loadState, saveState } from '@/lib/storage';
import { usePersistentState } from './usePersistentState';

function isDuplicatePlayer(players: Player[], name: string) {
  return players.some((player) => player.name.toLowerCase() === name.toLowerCase());
}

export function useTournamentState() {
  const [state, setState] = usePersistentState(loadState, saveState);

  const totals = useMemo(() => calculateTotals(state.players, state.settings), [state.players, state.settings]);
  const eliminatedPlaces = useMemo(() => getEliminatedPlaceMap(state.players), [state.players]);
  const existingPlayerNames = useMemo(() => state.players.map((player) => player.name), [state.players]);

  function updateSettings(settingsPatch: Partial<Settings>) {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...Object.fromEntries(Object.entries(settingsPatch).map(([key, value]) => [key, clampNumber(value)]))
      }
    }));
  }

  function addPlayerByName(name: string) {
    const normalizedName = normalizeName(name);
    if (!normalizedName || isDuplicatePlayer(state.players, normalizedName)) return null;

    setState((prev) => addPlayerToState(prev, normalizedName));
    return normalizedName;
  }

  function increment(playerId: string, field: PlayerCounterField) {
    setState((prev) => incrementPlayerField(prev, playerId, field));
  }

  function decrement(playerId: string, field: PlayerCounterField) {
    setState((prev) => decrementPlayerField(prev, playerId, field));
  }

  function eliminate(playerId: string) {
    setState((prev) => eliminatePlayer(prev, playerId));
  }

  function returnToGame(playerId: string) {
    setState((prev) => returnPlayerToGame(prev, playerId));
  }

  function deletePlayer(playerId: string) {
    setState((prev) => deletePlayerFromState(prev, playerId));
  }

  function reset() {
    setState(defaultState);
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
