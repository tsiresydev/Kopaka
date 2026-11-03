import { readyResponseSchema } from '@kopaka/validation';
type Failure =
  | 'not_ready'
  | 'network'
  | 'timeout'
  | 'invalid_response'
  | 'rate_limited'
  | 'server_error'
  | 'cancelled'
  | 'configuration';
type Result =
  { state: 'available' } | { state: 'unavailable'; reason: Failure };
export class HealthClient {
  private active:
    { controller: AbortController; promise: Promise<Result> } | undefined;
  constructor(
    private readonly origin: string,
    private readonly fetcher: typeof fetch = (input, init) =>
      fetch(input, init),
  ) {}
  get pending() {
    return this.active !== undefined;
  }
  check(): Promise<Result> {
    if (this.active) return this.active.promise;
    const controller = new AbortController();
    let timedOut = false;
    let abort!: () => void;
    const cancelled = new Promise<Result>((resolve) => {
      abort = () =>
        resolve({
          state: 'unavailable',
          reason: timedOut ? 'timeout' : 'cancelled',
        });
      controller.signal.addEventListener('abort', abort, { once: true });
    });
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 3000);
    const promise = Promise.race([
      this.evaluate(controller.signal),
      cancelled,
    ]).finally(() => {
      clearTimeout(timer);
      controller.signal.removeEventListener('abort', abort);
      if (this.active?.controller === controller) this.active = undefined;
    });
    this.active = { controller, promise };
    return promise;
  }
  cancel() {
    const active = this.active;
    this.active = undefined;
    active?.controller.abort();
  }
  private async evaluate(signal: AbortSignal): Promise<Result> {
    let url: URL;
    try {
      url = new URL(this.origin);
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.pathname !== '/' ||
        url.search ||
        url.hash
      )
        throw new Error();
    } catch {
      return { state: 'unavailable', reason: 'configuration' };
    }
    let response: Response;
    try {
      response = await this.fetcher(url.origin + '/health/ready', {
        cache: 'no-store',
        credentials: 'omit',
        signal,
      });
    } catch {
      return { state: 'unavailable', reason: 'network' };
    }
    if (response.status === 429)
      return { state: 'unavailable', reason: 'rate_limited' };
    if (response.status !== 200 && response.status !== 503)
      return { state: 'unavailable', reason: 'server_error' };
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return { state: 'unavailable', reason: 'invalid_response' };
    }
    const parsed = readyResponseSchema.safeParse(body);
    if (!parsed.success)
      return { state: 'unavailable', reason: 'invalid_response' };
    if (response.status === 200 && parsed.data.status === 'ready')
      return { state: 'available' };
    return {
      state: 'unavailable',
      reason:
        response.status === 503 && parsed.data.status === 'not_ready'
          ? 'not_ready'
          : 'invalid_response',
    };
  }
}
