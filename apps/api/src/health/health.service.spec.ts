import 'reflect-metadata';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { EventEmitter } from 'node:events';
import type { ExecutionContext } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { HealthLimitGuard } from './health-limit.guard.js';
import { HealthController } from './health.controller.js';
import { TechnicalLogger } from '../common/logger.js';
import { parseConfig } from '../config/config.schema.js';
import type { DatabaseService } from '../database/database.service.js';
import type { RedisService } from '../redis/redis.service.js';

const base = parseConfig({
  DATABASE_URL: 'postgresql://fixture:private@127.0.0.1:1/db',
  REDIS_URL: 'redis://127.0.0.1:1',
  WEB_ORIGIN: 'http://localhost:3000',
  HEALTH_DEPENDENCY_TIMEOUT_MS: '50',
  HEALTH_TOTAL_TIMEOUT_MS: '100',
});
const row = { id: 'sprint-1', schemaVersion: 1 };
function fixture(overrides = {}) {
  const find = jest
    .fn<() => Promise<typeof row | null>>()
    .mockResolvedValue(row);
  const ping = jest
    .fn<(signal?: AbortSignal) => Promise<string>>()
    .mockResolvedValue('PONG');
  const logger = { write: jest.fn() };
  const service = new HealthService(
    {
      client: { platformBootstrap: { findUnique: find } },
    } as unknown as DatabaseService,
    { ping } as unknown as RedisService,
    { ...base, ...overrides },
    logger as unknown as TechnicalLogger,
  );
  return { service, find, ping, logger };
}
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('readiness aggregation, deadlines and resource bounds', () => {
  it('requires current PostgreSQL singleton and Redis PONG', async () => {
    const f = fixture();
    const result = await f.service.ready();
    expect(result).toMatchObject({ ready: true, postgres: 'up', redis: 'up' });
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(Number.isNaN(Date.parse(result.checkedAt))).toBe(false);
    expect(f.find).toHaveBeenCalledTimes(1);
    expect(f.ping).toHaveBeenCalledTimes(1);
  });
  it.each([null, { id: 'sprint-1', schemaVersion: 2 }])(
    'refuses missing or unexpected schema %#',
    async (value) => {
      const f = fixture();
      f.find.mockResolvedValue(value);
      expect(await f.service.ready()).toMatchObject({
        ready: false,
        postgres: 'schema_mismatch',
      });
    },
  );
  it('classifies missing table without exposing the Prisma message', async () => {
    const f = fixture();
    f.find.mockRejectedValue({ code: 'P2021', message: 'private-table' });
    expect(await f.service.ready()).toMatchObject({
      ready: false,
      postgres: 'schema_mismatch',
    });
    expect(JSON.stringify(f.logger.write.mock.calls)).not.toContain(
      'private-table',
    );
  });
  it('refuses a non-PONG reply and known IO failures', async () => {
    const f = fixture();
    f.ping.mockResolvedValue('not PONG');
    expect(await f.service.ready()).toMatchObject({
      ready: false,
      redis: 'down',
    });
    f.find.mockRejectedValue(new Error('postgresql://private:secret@host/db'));
    f.ping.mockRejectedValue(new Error('secret-driver-detail'));
    expect(await f.service.ready()).toMatchObject({
      ready: false,
      postgres: 'down',
      redis: 'down',
    });
    expect(JSON.stringify(f.logger.write.mock.calls)).not.toMatch(
      /secret|private|postgresql/,
    );
  });
  it('propagates programming defects as unexpected faults instead of a dependency outage', async () => {
    const f = fixture();
    f.find.mockRejectedValue(new TypeError('private-programming-fault'));
    await expect(f.service.ready()).rejects.toThrow(TypeError);
    expect(JSON.stringify(f.logger.write.mock.calls)).not.toContain(
      'private-programming-fault',
    );
  });
  it('does not cache an earlier success', async () => {
    const f = fixture();
    expect((await f.service.ready()).ready).toBe(true);
    f.ping.mockRejectedValue(new Error('offline'));
    expect((await f.service.ready()).ready).toBe(false);
    f.ping.mockResolvedValue('PONG');
    expect((await f.service.ready()).ready).toBe(true);
  });
  it('runs probes concurrently and bounds their combined latency', async () => {
    jest.useFakeTimers();
    const f = fixture();
    f.find.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(row), 40)),
    );
    f.ping.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('PONG'), 40)),
    );
    const result = f.service.ready();
    await jest.advanceTimersByTimeAsync(40);
    expect((await result).ready).toBe(true);
  });
  it('returns timeout at the dependency deadline and aborts Redis', async () => {
    jest.useFakeTimers();
    const f = fixture();
    f.find.mockImplementation(() => new Promise(() => {}));
    f.ping.mockImplementation(() => new Promise(() => {}));
    const result = f.service.ready();
    await jest.advanceTimersByTimeAsync(50);
    expect(await result).toMatchObject({
      ready: false,
      postgres: 'timeout',
      redis: 'timeout',
    });
    expect(f.ping.mock.calls[0]?.[0]?.aborted).toBe(true);
  });
  it('honors the global deadline defensively', async () => {
    jest.useFakeTimers();
    const f = fixture({ HEALTH_TOTAL_TIMEOUT_MS: 10 });
    f.find.mockImplementation(() => new Promise(() => {}));
    f.ping.mockImplementation(() => new Promise(() => {}));
    const result = f.service.ready();
    await jest.advanceTimersByTimeAsync(10);
    expect(await result).toMatchObject({
      ready: false,
      postgres: 'timeout',
      redis: 'timeout',
    });
  });
  it('retains occupied slots until actual IO settles, even after timeout', async () => {
    jest.useFakeTimers();
    const f = fixture({ PG_POOL_MAX: 2, HEALTH_MAX_CONCURRENT: 2 });
    let release!: (value: typeof row) => void;
    const pending = new Promise<typeof row>((resolve) => {
      release = resolve;
    });
    f.find.mockReturnValue(pending);
    for (let i = 0; i < 5; i++) {
      const request = f.service.ready();
      await jest.advanceTimersByTimeAsync(50);
      expect((await request).ready).toBe(false);
    }
    expect(f.find).toHaveBeenCalledTimes(2);
    release(row);
    await jest.advanceTimersByTimeAsync(0);
    f.find.mockResolvedValue(row);
    expect((await f.service.ready()).ready).toBe(true);
    expect(f.find).toHaveBeenCalledTimes(3);
  });
  it('cancels an evaluation when its caller disconnects', async () => {
    const f = fixture();
    f.find.mockImplementation(() => new Promise(() => {}));
    const controller = new AbortController();
    const result = f.service.ready(undefined, controller.signal);
    controller.abort();
    expect((await result).ready).toBe(false);
  });
  it('never launches IO for an already cancelled caller', async () => {
    const f = fixture();
    expect((await f.service.ready(undefined, AbortSignal.abort())).ready).toBe(
      false,
    );
    expect(f.find).not.toHaveBeenCalled();
    expect(f.ping).not.toHaveBeenCalled();
  });
  it('aborts evaluations and refuses new work during shutdown', async () => {
    const f = fixture();
    f.find.mockImplementation(() => new Promise(() => {}));
    const pending = f.service.ready();
    await Promise.resolve();
    f.service.onApplicationShutdown();
    expect((await pending).ready).toBe(false);
    expect((await f.service.ready()).ready).toBe(false);
    expect(f.find).toHaveBeenCalledTimes(1);
  });
  it('liveness never evaluates readiness or touches dependencies', () => {
    const f = fixture();
    const controller = new HealthController(f.service);
    expect(controller.live()).toEqual({ status: 'alive' });
    expect(f.find).not.toHaveBeenCalled();
    expect(f.ping).not.toHaveBeenCalled();
  });
});

function context(ip = '127.0.0.1') {
  const response = Object.assign(new EventEmitter(), { setHeader: jest.fn() });
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ socket: { remoteAddress: ip } }),
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
  return { response, host };
}
describe('in-memory readiness limits', () => {
  it('limits requests in an anchored 60-second window and expires it', () => {
    jest.useFakeTimers();
    jest.setSystemTime(0);
    const guard = new HealthLimitGuard({
      ...base,
      HEALTH_RATE_LIMIT_PER_MINUTE: 2,
    });
    for (let i = 0; i < 2; i++) {
      const c = context();
      expect(guard.canActivate(c.host)).toBe(true);
      c.response.emit('finish');
    }
    const denied = context();
    expect(() => guard.canActivate(denied.host)).toThrow();
    expect(denied.response.setHeader).toHaveBeenCalledWith('Retry-After', '60');
    jest.advanceTimersByTime(60001);
    const c = context();
    expect(guard.canActivate(c.host)).toBe(true);
    c.response.emit('finish');
  });
  it('allows four active evaluations and releases each lease once', () => {
    const guard = new HealthLimitGuard(base);
    const active = Array.from({ length: 4 }, (_, i) => context(String(i)));
    active.forEach((c) => expect(guard.canActivate(c.host)).toBe(true));
    const denied = context('other');
    expect(() => guard.canActivate(denied.host)).toThrow();
    expect(denied.response.setHeader).toHaveBeenCalledWith('Retry-After', '1');
    active[0]!.response.emit('finish');
    active[0]!.response.emit('close');
    const replacement = context('new');
    expect(guard.canActivate(replacement.host)).toBe(true);
    expect(() => guard.canActivate(context('extra').host)).toThrow();
    active.slice(1).forEach((c) => c.response.emit('close'));
    replacement.response.emit('close');
  });
});

describe('structured logger redaction', () => {
  it('outputs only allowlisted fields, canonical ids and normalized outcomes', () => {
    const write = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    new TechnicalLogger().write('dependency_check', {
      dependency: 'postgres',
      outcome: 'down',
      requestId: 'f912abc0-414a-4b11-80fd-42721450e345',
      durationMs: 5,
      body: 'secret',
      ip: 'private',
      DATABASE_URL: 'secret-url',
      stack: 'secret-stack',
    });
    const record = JSON.parse(String(write.mock.calls[0]?.[0]));
    expect(Object.keys(record).sort()).toEqual(
      [
        'dependency',
        'durationMs',
        'event',
        'level',
        'outcome',
        'requestId',
        'timestamp',
      ].sort(),
    );
    expect(record).toMatchObject({
      event: 'dependency_check',
      dependency: 'postgres',
      outcome: 'down',
      durationMs: 5,
    });
    expect(JSON.stringify(record)).not.toMatch(/secret|private/);
  });
  it('drops invalid IDs, invalid durations and arbitrary driver outcomes', () => {
    const write = jest
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    new TechnicalLogger().write('readiness_check', {
      requestId: 'secret-header',
      durationMs: -1,
      dependency: 'secret-host',
      outcome: 'secret-error',
    });
    const record = JSON.parse(String(write.mock.calls[0]?.[0]));
    expect(record).not.toHaveProperty('requestId');
    expect(record).not.toHaveProperty('durationMs');
    expect(record).not.toHaveProperty('dependency');
    expect(record.outcome).toBe('error');
    expect(JSON.stringify(record)).not.toContain('secret');
  });
});
