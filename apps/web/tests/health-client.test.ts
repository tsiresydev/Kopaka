import { afterEach, describe, expect, it, vi } from 'vitest';
import { HealthClient } from '../src/lib/health-client/index.js';
const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
describe('one-shot bounded readiness client', () => {
  it('accepts only strict 200/ready and sends no credentials or cache', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ status: 'ready' }));
    expect(
      await new HealthClient('http://localhost:3001', fetcher).check(),
    ).toEqual({ state: 'available' });
    expect(fetcher).toHaveBeenCalledWith(
      'http://localhost:3001/health/ready',
      expect.objectContaining({
        cache: 'no-store',
        credentials: 'omit',
        signal: expect.any(AbortSignal),
      }),
    );
  });
  it.each([
    [503, { status: 'not_ready' }, 'not_ready'],
    [200, { status: 'not_ready' }, 'invalid_response'],
    [200, { status: 'ready', private: 'driver' }, 'invalid_response'],
    [429, {}, 'rate_limited'],
    [500, {}, 'server_error'],
  ])(
    'treats status %s and payload %# as unavailable',
    async (status, body, reason) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(response(body, Number(status)));
      expect(
        await new HealthClient('http://localhost:3001', fetcher).check(),
      ).toEqual({ state: 'unavailable', reason });
    },
  );
  it('handles broken JSON and network errors without exposing their values', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('private-invalid-json'))
      .mockRejectedValueOnce(new Error('private-network-detail'));
    const client = new HealthClient('http://localhost:3001', fetcher);
    expect(await client.check()).toEqual({
      state: 'unavailable',
      reason: 'invalid_response',
    });
    expect(await client.check()).toEqual({
      state: 'unavailable',
      reason: 'network',
    });
  });
  it('shares an active request instead of starting a second fetch', async () => {
    let resolve!: (value: Response) => void;
    const fetcher = vi.fn<typeof fetch>().mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const client = new HealthClient('http://localhost:3001', fetcher);
    const first = client.check();
    const second = client.check();
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
    resolve(response({ status: 'ready' }));
    expect((await first).state).toBe('available');
    expect(client.pending).toBe(false);
  });
  it('enforces three seconds even when fetch ignores cancellation', async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(() => new Promise(() => {}));
    const client = new HealthClient('http://localhost:3001', fetcher);
    const result = client.check();
    await vi.advanceTimersByTimeAsync(3000);
    expect(await result).toEqual({ state: 'unavailable', reason: 'timeout' });
    expect(fetcher.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('includes JSON reading within the timeout budget', async () => {
    vi.useFakeTimers();
    const slow = response({ status: 'ready' });
    vi.spyOn(slow, 'json').mockReturnValue(new Promise(() => {}));
    const client = new HealthClient(
      'http://localhost:3001',
      vi.fn<typeof fetch>().mockResolvedValue(slow),
    );
    const result = client.check();
    await vi.advanceTimersByTimeAsync(3000);
    expect(await result).toEqual({ state: 'unavailable', reason: 'timeout' });
  });
  it('cancels on unmount and ignores the old request after a new attempt', async () => {
    let resolve!: (value: Response) => void;
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(
        () =>
          new Promise((done) => {
            resolve = done;
          }),
      )
      .mockResolvedValueOnce(response({ status: 'ready' }));
    const client = new HealthClient('http://localhost:3001', fetcher);
    const old = client.check();
    client.cancel();
    expect(await old).toEqual({ state: 'unavailable', reason: 'cancelled' });
    expect(await client.check()).toEqual({ state: 'available' });
    resolve(response({ status: 'not_ready' }, 503));
    await Promise.resolve();
    expect(client.pending).toBe(false);
  });
});
