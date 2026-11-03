export const THEME_KEY = 'kopaka.theme.v1';
export const LOCALE_KEY = 'kopaka.locale.v1';
type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export function createPreferenceStorage(getStorage: () => StoragePort) {
  const memory = new Map<string, string>();
  let inaccessible = false;
  return {
    read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
      let value: string | null | undefined;
      try {
        value = inaccessible ? memory.get(key) : getStorage().getItem(key);
      } catch {
        inaccessible = true;
        value = memory.get(key);
      }
      if (allowed.includes(value as T)) return value as T;
      if (value != null) {
        memory.delete(key);
        try {
          getStorage().removeItem(key);
        } catch {
          /* Memory fallback only. */
        }
      }
      return fallback;
    },
    write(key: string, value: string) {
      memory.set(key, value);
      if (inaccessible) return;
      try {
        getStorage().setItem(key, value);
      } catch {
        inaccessible = true;
        /* Kept for this visit. */
      }
    },
  };
}
