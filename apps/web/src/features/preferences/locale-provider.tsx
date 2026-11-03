'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { dictionaries, locales } from '../../lib/i18n/index';
import type { Locale, Messages } from '../../lib/i18n/index';
import { createPreferenceStorage, LOCALE_KEY } from './storage';

const defaultStorage = createPreferenceStorage(() => window.localStorage);
const Context = createContext<{
  locale: Locale;
  messages: Messages;
  setLocale: (locale: Locale) => void;
}>({ locale: 'fr', messages: dictionaries.fr, setLocale: () => {} });

export function LocaleProvider({
  children,
  storage = defaultStorage,
}: {
  children: ReactNode;
  storage?: ReturnType<typeof createPreferenceStorage>;
}) {
  const [locale, update] = useState<Locale>('fr');
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    update(storage.read(LOCALE_KEY, locales, 'fr'));
    setHydrated(true);
  }, [storage]);
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale;
    document.title = dictionaries[locale].metadataTitle;
  }, [locale, hydrated]);
  return (
    <Context.Provider
      value={{
        locale,
        messages: dictionaries[locale],
        setLocale: (next) => {
          if (locales.includes(next)) {
            storage.write(LOCALE_KEY, next);
            update(next);
          }
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useLocale() {
  return useContext(Context);
}
