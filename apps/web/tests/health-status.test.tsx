import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { HealthClient } from '../src/lib/health-client/index.js';
import { HealthStatus } from '../src/features/foundation/health-status.js';
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const ready = () => new Response('{"status":"ready"}');
describe('real availability region', () => {
  it('fetches once, keeps one polite region, invalidates success during retry and preserves focus', async () => {
    let resolve!: (value: Response) => void;
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(ready())
      .mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done;
          }),
      );
    render(
      <HealthStatus
        client={new HealthClient('http://localhost:3001', fetcher)}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Disponible'),
    );
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status').getAttribute('aria-live')).toBe('polite');
    expect(fetcher).toHaveBeenCalledTimes(1);
    const button = screen.getByRole('button', { name: 'Réessayer' });
    button.focus();
    fireEvent.click(button);
    expect(screen.getByRole('status').textContent).not.toContain('Disponible');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(button);
    fireEvent.click(button);
    expect(fetcher).toHaveBeenCalledTimes(2);
    await act(async () => resolve(ready()));
    expect(screen.getByRole('status').textContent).toContain('Disponible');
    expect(document.activeElement).toBe(button);
  });
  it('offers recovery for unavailable responses without showing internal details', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('{"status":"not_ready","host":"private"}', {
        status: 503,
      }),
    );
    render(
      <HealthStatus
        client={new HealthClient('http://localhost:3001', fetcher)}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Indisponible'),
    );
    expect(document.body.textContent).not.toContain('private');
    expect(
      screen
        .getByRole('button', { name: 'Réessayer' })
        .getAttribute('aria-disabled'),
    ).not.toBe('true');
  });
  it('aborts on unmount and rejects a stale result after remount', async () => {
    let resolve!: (value: Response) => void;
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done;
          }),
      )
      .mockResolvedValueOnce(ready());
    const client = new HealthClient('http://localhost:3001', fetcher);
    const view = render(<HealthStatus client={client} />);
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    view.unmount();
    expect(fetcher.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    render(<HealthStatus client={client} />);
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Disponible'),
    );
    await act(async () =>
      resolve(new Response('{"status":"not_ready"}', { status: 503 })),
    );
    expect(screen.getByRole('status').textContent).toContain('Disponible');
  });
});
