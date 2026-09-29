import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** False saat SSR/sebelum hidrasi, true setelah React aktif di browser. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
