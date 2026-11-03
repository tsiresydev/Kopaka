import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import {
  createPreferenceStorage,
  THEME_KEY,
} from '../src/features/preferences/storage.js';
import {
  ThemeProvider,
  useTheme,
} from '../src/features/preferences/theme-provider.js';
import { INITIAL_PREFERENCES_SCRIPT } from '../src/features/preferences/initial-preferences.js';

function Probe() {
  const { choice, setChoice } = useTheme();
  return (
    <>
      <output>{choice}</output>
      <button onClick={() => setChoice('dark')}>Sombre</button>
      <button onClick={() => setChoice('system')}>Système</button>
    </>
  );
}
beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.theme = 'light';
  document.documentElement.lang = 'fr';
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe('validated local preferences', () => {
  it('uses the new in-memory choice if writes fail while reads still return an old value', () => {
    const storage = createPreferenceStorage(() => ({
      getItem: () => 'light',
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {},
    }));
    storage.write(THEME_KEY, 'dark');
    expect(storage.read(THEME_KEY, ['light', 'dark', 'system'], 'light')).toBe(
      'dark',
    );
  });
  it('ignores only the invalid key, preserving unrelated storage', () => {
    localStorage.setItem(THEME_KEY, 'invalid');
    localStorage.setItem('unrelated', 'keep');
    const clear = vi.spyOn(Storage.prototype, 'clear');
    expect(
      createPreferenceStorage(() => localStorage).read(
        THEME_KEY,
        ['light', 'dark', 'system'],
        'light',
      ),
    ).toBe('light');
    expect(localStorage.getItem('unrelated')).toBe('keep');
    expect(clear).not.toHaveBeenCalled();
  });
  it('keeps changes in memory when storage getter, read or write fails', () => {
    for (const getter of [
      () => {
        throw new Error('denied');
      },
      () => ({
        getItem: () => {
          throw new Error('denied');
        },
        setItem: () => {
          throw new Error('denied');
        },
        removeItem: () => {},
      }),
    ]) {
      const storage = createPreferenceStorage(getter);
      expect(
        storage.read(THEME_KEY, ['light', 'dark', 'system'], 'light'),
      ).toBe('light');
      storage.write(THEME_KEY, 'dark');
      expect(
        storage.read(THEME_KEY, ['light', 'dark', 'system'], 'light'),
      ).toBe('dark');
    }
  });
});
describe('theme SSR, bootstrap and explicit system choice', () => {
  it('starts light even on a dark OS and never consults matchMedia by default', () => {
    const media = vi.fn();
    vi.stubGlobal('matchMedia', media);
    render(
      <ThemeProvider storage={createPreferenceStorage(() => localStorage)}>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText('light')).not.toBeNull();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(media).not.toHaveBeenCalled();
  });
  it('persists explicit choices and resolves system without persisting its result', () => {
    const listeners = new Set<() => void>();
    const query = {
      matches: true,
      addEventListener: vi.fn((_name, listener) => listeners.add(listener)),
      removeEventListener: vi.fn((_name, listener) =>
        listeners.delete(listener),
      ),
    };
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => query),
    );
    const view = render(
      <ThemeProvider storage={createPreferenceStorage(() => localStorage)}>
        <Probe />
      </ThemeProvider>,
    );
    fireEvent.click(screen.getByText('Sombre'));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    fireEvent.click(screen.getByText('Système'));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('system');
    act(() => {
      query.matches = false;
      listeners.forEach((listener) => listener());
    });
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('system');
    view.unmount();
    expect(query.removeEventListener).toHaveBeenCalled();
  });
  it('renders FR/light without reading storage on the server, then hydrates coherently', async () => {
    localStorage.setItem(THEME_KEY, 'dark');
    const read = vi.spyOn(Storage.prototype, 'getItem');
    const tree = (
      <ThemeProvider storage={createPreferenceStorage(() => localStorage)}>
        <Probe />
      </ThemeProvider>
    );
    const html = renderToString(tree);
    expect(html).toContain('light');
    expect(read).not.toHaveBeenCalled();
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.append(container);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, tree);
    });
    expect(container.querySelector('output')?.textContent).toBe('dark');
    expect(document.documentElement.lang).toBe('fr');
    expect(errors).not.toHaveBeenCalled();
    await act(async () => root.unmount());
    container.remove();
  });
  it('applies the initial script with storage blocked or corrupt and no OS default', () => {
    const media = vi.fn();
    vi.stubGlobal('matchMedia', media);
    localStorage.setItem(THEME_KEY, 'invalid');
    new Function(INITIAL_PREFERENCES_SCRIPT)();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(media).not.toHaveBeenCalled();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    new Function(INITIAL_PREFERENCES_SCRIPT)();
    expect(document.documentElement.dataset.theme).toBe('light');
  });
  it('applies saved dark or explicit system before hydration', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    new Function(INITIAL_PREFERENCES_SCRIPT)();
    expect(document.documentElement.dataset.theme).toBe('dark');
    localStorage.setItem(THEME_KEY, 'system');
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: true })),
    );
    new Function(INITIAL_PREFERENCES_SCRIPT)();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
