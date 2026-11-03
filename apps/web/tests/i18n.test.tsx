import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { dictionaries } from '../src/lib/i18n/index';
import {
  LocaleProvider,
  useLocale,
} from '../src/features/preferences/locale-provider';
import {
  createPreferenceStorage,
  LOCALE_KEY,
  THEME_KEY,
} from '../src/features/preferences/storage';
import { LanguageSelect } from '../src/features/preferences/language-select';
import { HealthStatus } from '../src/features/foundation/health-status';
import { HealthClient } from '../src/lib/health-client/index';
import ErrorPage from '../src/app/error';
import { INITIAL_PREFERENCES_SCRIPT } from '../src/features/preferences/initial-preferences';

function Probe() {
  const { messages } = useLocale();
  return (
    <>
      <LanguageSelect />
      <h1>{messages.title}</h1>
    </>
  );
}
beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = 'fr';
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function leaves(value: object, prefix = ''): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entry]) =>
      typeof entry === 'string'
        ? [[prefix + key, entry]]
        : Object.entries(leaves(entry, prefix + key + '.')),
    ),
  );
}
it('has identical nonempty dictionary keys for every shell label', () => {
  const fr = leaves(dictionaries.fr),
    mg = leaves(dictionaries.mg);
  expect(Object.keys(mg).sort()).toEqual(Object.keys(fr).sort());
  expect(Object.values(mg).every((value) => value.trim().length > 0)).toBe(
    true,
  );
});
it.each(['missing', 'corrupt', 'denied'])(
  'falls back to French with %s storage and changes without API',
  (mode) => {
    if (mode === 'corrupt') localStorage.setItem(LOCALE_KEY, 'xx');
    localStorage.setItem(THEME_KEY, 'dark');
    const storage = createPreferenceStorage(() => {
      if (mode === 'denied') throw new Error('denied');
      return localStorage;
    });
    const fetch = vi.spyOn(globalThis, 'fetch');
    render(
      <LocaleProvider storage={storage}>
        <Probe />
      </LocaleProvider>,
    );
    expect(screen.getByRole('heading').textContent).toBe(dictionaries.fr.title);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mg' } });
    expect(document.documentElement.lang).toBe('mg');
    expect(document.title).toBe(dictionaries.mg.metadataTitle);
    expect(screen.getByRole('heading').textContent).toBe(dictionaries.mg.title);
    expect(storage.read(LOCALE_KEY, ['fr', 'mg'], 'fr')).toBe('mg');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(fetch).not.toHaveBeenCalled();
  },
);
it('hydrates saved Malagasy from French SSR without warnings or server storage reads', async () => {
  localStorage.setItem(LOCALE_KEY, 'mg');
  const read = vi.spyOn(Storage.prototype, 'getItem');
  const tree = (
    <LocaleProvider storage={createPreferenceStorage(() => localStorage)}>
      <Probe />
    </LocaleProvider>
  );
  const html = renderToString(tree);
  expect(html).toContain(dictionaries.fr.title);
  expect(read).not.toHaveBeenCalled();
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.append(container);
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  let root!: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, tree);
  });
  expect(container.querySelector('h1')?.textContent).toBe(
    dictionaries.mg.title,
  );
  expect(document.documentElement.lang).toBe('mg');
  expect(errors).not.toHaveBeenCalled();
  await act(async () => root.unmount());
  container.remove();
});
it('translates an unavailable service without starting another request', async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error('offline'));
  const client = new HealthClient('http://localhost:3001', fetcher);
  render(
    <LocaleProvider storage={createPreferenceStorage(() => localStorage)}>
      <Probe />
      <HealthStatus client={client} />
    </LocaleProvider>,
  );
  await screen.findByText(dictionaries.fr.service.unavailable);
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mg' } });
  expect(screen.getByRole('status').textContent).toContain(
    dictionaries.mg.service.recovery,
  );
  expect(fetcher).toHaveBeenCalledTimes(1);
});
it('localizes the error boundary and keeps its retry action working', () => {
  const reset = vi.fn();
  render(
    <LocaleProvider storage={createPreferenceStorage(() => localStorage)}>
      <LanguageSelect />
      <ErrorPage error={new Error('private')} reset={reset} />
    </LocaleProvider>,
  );
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mg' } });
  expect(screen.getByRole('heading').textContent).toBe(
    dictionaries.mg.error.title,
  );
  expect(document.body.textContent).not.toContain('private');
  fireEvent.click(
    screen.getByRole('button', { name: dictionaries.mg.error.retry }),
  );
  expect(reset).toHaveBeenCalledTimes(1);
});
it('bootstraps saved language and falls back independently of the theme', () => {
  localStorage.setItem(LOCALE_KEY, 'mg');
  localStorage.setItem(THEME_KEY, 'dark');
  new Function(INITIAL_PREFERENCES_SCRIPT)();
  expect(document.documentElement.lang).toBe('mg');
  localStorage.setItem(LOCALE_KEY, 'invalid');
  new Function(INITIAL_PREFERENCES_SCRIPT)();
  expect(document.documentElement.lang).toBe('fr');
  expect(document.documentElement.dataset.theme).toBe('dark');
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('denied');
  });
  new Function(INITIAL_PREFERENCES_SCRIPT)();
  expect(document.documentElement.lang).toBe('fr');
  expect(document.documentElement.dataset.theme).toBe('light');
});
