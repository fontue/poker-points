import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export function usePersistentState<T>(load: () => T, save: (state: T) => void): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(load);

  useEffect(() => {
    save(state);
  }, [save, state]);

  return [state, setState];
}
