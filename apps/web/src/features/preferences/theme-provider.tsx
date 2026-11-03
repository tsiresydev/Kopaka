'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createPreferenceStorage, THEME_KEY } from './storage';
type Choice = 'light' | 'dark' | 'system';
const choices: readonly Choice[] = ['light', 'dark', 'system'];
const defaultStorage = createPreferenceStorage(() => window.localStorage);
const Context = createContext<{
  choice: Choice;
  setChoice: (choice: Choice) => void;
} | null>(null);
export function ThemeProvider({
  children,
  storage = defaultStorage,
}: {
  children: ReactNode;
  storage?: ReturnType<typeof createPreferenceStorage>;
}) {
  const [choice, update] = useState<Choice>('light');
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    update(storage.read(THEME_KEY, choices, 'light'));
    setHydrated(true);
  }, [storage]);
  useEffect(() => {
    if (!hydrated) return;
    const query =
      choice === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : null;
    const apply = () => {
      document.documentElement.dataset.theme =
        choice === 'dark' || (query?.matches ?? false) ? 'dark' : 'light';
    };
    apply();
    query?.addEventListener('change', apply);
    return () => query?.removeEventListener('change', apply);
  }, [choice, hydrated]);
  return (
    <Context.Provider
      value={{
        choice,
        setChoice: (next) => {
          if (choices.includes(next)) {
            storage.write(THEME_KEY, next);
            update(next);
          }
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useTheme() {
  const context = useContext(Context);
  if (!context) throw new Error('ThemeProvider required');
  return context;
}
