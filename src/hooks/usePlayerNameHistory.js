import { loadPlayerNamesHistory, savePlayerNamesHistory } from '@/lib/storage';
import { usePersistentState } from './usePersistentState';

function upsertNameHistory(history, name) {
  return [name, ...history.filter((existingName) => existingName.toLowerCase() !== name.toLowerCase())];
}

export function usePlayerNameHistory() {
  const [history, setHistory] = usePersistentState(loadPlayerNamesHistory, savePlayerNamesHistory);

  function rememberName(name) {
    setHistory((prev) => upsertNameHistory(prev, name));
  }

  function deleteName(name) {
    setHistory((prev) => prev.filter((existingName) => existingName.toLowerCase() !== name.toLowerCase()));
  }

  return {
    history,
    rememberName,
    deleteName
  };
}
