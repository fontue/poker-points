import { useEffect, useState } from 'react';

export function usePersistentState(load, save) {
  const [state, setState] = useState(load);

  useEffect(() => {
    save(state);
  }, [save, state]);

  return [state, setState];
}
