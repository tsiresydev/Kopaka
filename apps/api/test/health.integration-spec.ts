import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';
import type { Server } from 'node:http';
import { Pool } from 'pg';
import request from 'supertest';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { API_CONFIG } from '../src/config/config.module.js';
import { parseConfig } from '../src/config/config.schema.js';
import { configureHttp } from '../src/common/configure-http.js';
import { HealthService } from '../src/health/health.service.js';
import { RedisService } from '../src/redis/redis.service.js';
import {
  liveResponseSchema,
  readyResponseSchema,
  errorResponseSchema,
} from '@kopaka/validation';

const root = resolve(import.meta.dirname, '../../../..');
const require = createRequire(import.meta.url);
const project = 'kopaka-health-test-' + randomUUID().slice(0, 8);
const password = randomUUID();
const databaseUrl =
  'postgresql://kopaka:' + password + '@127.0.0.1:15433/kopaka_health_test';
const env = {
  ...process.env,
  POSTGRES_PASSWORD: password,
  POSTGRES_DB: 'kopaka_health_test',
  POSTGRES_PORT: '15433',
  REDIS_PORT: '16380',
  DATABASE_URL: databaseUrl,
};
const compose = (...args: string[]) =>
  execFileSync(
    'docker',
    [
      'compose',
      '--env-file',
      'infra/docker/.env.example',
      '-p',
      project,
      '-f',
      'infra/docker/compose.yaml',
      ...args,
    ],
    { cwd: root, env, stdio: 'pipe', timeout: 120000 },
  );
const config = parseConfig({
  DATABASE_URL: databaseUrl,
  REDIS_URL: 'redis://127.0.0.1:16380',
  WEB_ORIGIN: 'http://localhost:3000',
  HEALTH_RATE_LIMIT_PER_MINUTE: '1000',
});
const logs: string[] = [];
let app: NestExpressApplication;
let pool: Pool;
let started = false;
let stdout: ReturnType<typeof jest.spyOn>;
async function api(overrides = {}) {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(API_CONFIG)
    .useValue({ ...config, ...overrides })
    .compile();
  const instance = module.createNestApplication<NestExpressApplication>({
    logger: false,
    bodyParser: false,
  });
  configureHttp(instance, config.WEB_ORIGIN);
  await instance.listen(0, '127.0.0.1');
  return instance;
}
function http(instance = app) {
  return request(instance.getHttpServer() as Server);
}
async function waitReady(instance = app) {
  for (let i = 0; i < 100; i++) {
    const response = await http(instance).get('/health/ready');
    if (response.status === 200) return response;
    await pause(100);
  }
  throw new Error('Readiness did not recover');
}
async function waitRedis(instance: NestExpressApplication) {
  for (let i = 0; i < 100; i++) {
    if (instance.get(RedisService).client.isReady) return;
    await pause(50);
  }
  throw new Error('Redis did not connect');
}
describe('real health HTTP, PostgreSQL and Redis (isolated Compose)', () => {
  beforeAll(async () => {
    execFileSync('docker', ['version'], { stdio: 'pipe', timeout: 15000 });
    stdout = jest.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
      if (typeof chunk === 'string' && chunk.startsWith('{')) logs.push(chunk);
      return true;
    });
    started = true;
    compose('up', '-d', '--wait');
    pool = new Pool({
      connectionString: databaseUrl,
      max: 2,
      connectionTimeoutMillis: 3000,
    });
    pool.on('error', () => {});
    app = await api();
  }, 180000);
  afterAll(async () => {
    try {
      await app?.close();
      if (pool) await pool.end();
      if (started) compose('down');
    } finally {
      stdout?.mockRestore();
    }
  }, 150000);
  it('boots alive on an unmigrated database, becomes ready only after migration', async () => {
    const alive = await http().get('/health/live').expect(200);
    expect(liveResponseSchema.parse(alive.body)).toEqual({ status: 'alive' });
    const response = await http().get('/health/ready').expect(503);
    expect(readyResponseSchema.parse(response.body)).toEqual({
      status: 'not_ready',
    });
    expect(
      (
        await pool.query('SELECT to_regclass($1) AS name', [
          'public."PlatformBootstrap"',
        ])
      ).rows[0].name,
    ).toBeNull();
    execFileSync(
      process.execPath,
      [
        require.resolve('prisma/build/index.js'),
        'migrate',
        'deploy',
        '--config',
        'prisma/prisma.config.ts',
      ],
      { cwd: root, env, stdio: 'pipe', timeout: 60000 },
    );
    const ready = await waitReady();
    expect(readyResponseSchema.parse(ready.body)).toEqual({ status: 'ready' });
  }, 90000);
  it('checks HEAD, headers, CORS and invalid entries before any readiness evaluation', async () => {
    const service = jest.spyOn(app.get(HealthService), 'ready');
    try {
      const ready = await http()
        .get('/health/ready')
        .set('Origin', config.WEB_ORIGIN)
        .expect(200);
      expect(ready.headers['cache-control']).toBe('no-store');
      expect(ready.headers['x-content-type-options']).toBe('nosniff');
      expect(ready.headers['access-control-allow-origin']).toBe(
        config.WEB_ORIGIN,
      );
      expect(ready.headers['access-control-allow-credentials']).toBeUndefined();
      expect(ready.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
      expect(ready.headers['set-cookie']).toBeUndefined();
      for (const path of ['/health/live', '/health/ready']) {
        const head = await http().head(path).expect(200);
        expect(head.text).toBeUndefined();
      }
      const previous = service.mock.calls.length;
      for (const path of [
        '/health/live?unexpected=1',
        '/health/ready?unexpected=1',
      ]) {
        const invalid = await http().get(path).expect(400);
        expect(errorResponseSchema.parse(invalid.body)).toEqual({
          code: 'INVALID_REQUEST',
        });
      }
      await http()
        .get('/health/ready')
        .set('X-Request-Id', 'secret-header')
        .expect(400, { code: 'INVALID_REQUEST' });
      await http().get('/health/ready').send('secret-body').expect(400);
      const method = await http().post('/health/ready').expect(405);
      expect(method.headers.allow).toBe('GET, HEAD, OPTIONS');
      expect(method.body).toEqual({ code: 'METHOD_NOT_ALLOWED' });
      await http()
        .options('/health/ready')
        .set('Origin', config.WEB_ORIGIN)
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);
      expect(service.mock.calls.length).toBe(previous);
      const denied = await http()
        .get('/health/live')
        .set('Origin', 'http://invalid.local')
        .expect(200);
      expect(denied.headers['access-control-allow-origin']).toBeUndefined();
    } finally {
      service.mockRestore();
    }
  });
  it('refuses a missing singleton or wrong version without repairing the fixture', async () => {
    const original = (await pool.query('SELECT * FROM "PlatformBootstrap"'))
      .rows[0];
    try {
      await pool.query('UPDATE "PlatformBootstrap" SET "schemaVersion"=2');
      await http().get('/health/ready').expect(503, { status: 'not_ready' });
      expect(
        (await pool.query('SELECT "schemaVersion" FROM "PlatformBootstrap"'))
          .rows[0].schemaVersion,
      ).toBe(2);
      await pool.query('DELETE FROM "PlatformBootstrap"');
      await http().get('/health/ready').expect(503);
      expect(
        (
          await pool.query(
            'SELECT COUNT(*)::int AS count FROM "PlatformBootstrap"',
          )
        ).rows[0].count,
      ).toBe(0);
    } finally {
      await pool.query(
        'INSERT INTO "PlatformBootstrap" VALUES ($1,$2,$3) ON CONFLICT ("id") DO UPDATE SET "schemaVersion"=EXCLUDED."schemaVersion"',
        [original.id, original.schemaVersion, original.initializedAt],
      );
    }
    await waitReady();
  });
  it.each(['redis', 'postgres'])(
    'reports real %s outage while live stays positive, then recovers',
    async (dependency) => {
      compose('stop', dependency);
      try {
        await http().get('/health/live').expect(200, { status: 'alive' });
        await http().get('/health/ready').expect(503, { status: 'not_ready' });
      } finally {
        compose('up', '-d', '--wait', dependency);
      }
      expect((await waitReady()).body).toEqual({ status: 'ready' });
    },
    90000,
  );
  it('limits quota in memory and ignores spoofed forwarding headers; live is independent', async () => {
    const instance = await api({ HEALTH_RATE_LIMIT_PER_MINUTE: 2 });
    const service = jest.spyOn(instance.get(HealthService), 'ready');
    try {
      await waitRedis(instance);
      await http(instance).get('/health/ready').expect(200);
      await http(instance).get('/health/ready').expect(200);
      const limited = await http(instance)
        .get('/health/ready')
        .set('X-Forwarded-For', '198.51.100.1')
        .expect(429);
      expect(limited.body).toEqual({ code: 'RATE_LIMITED' });
      expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
      expect(service).toHaveBeenCalledTimes(2);
      await http(instance).get('/health/live').expect(200, { status: 'alive' });
    } finally {
      service.mockRestore();
      await instance.close();
    }
  });
  it('refuses a fifth concurrent evaluation without launching another probe', async () => {
    const instance = await api({
      HEALTH_MAX_CONCURRENT: 4,
      HEALTH_DEPENDENCY_TIMEOUT_MS: 2000,
      HEALTH_TOTAL_TIMEOUT_MS: 4000,
      PG_QUERY_TIMEOUT_MS: 2000,
    });
    const service = jest.spyOn(instance.get(HealthService), 'ready');
    const lock = await pool.connect();
    let requests: Array<Promise<request.Response>> = [];
    try {
      await waitRedis(instance);
      await lock.query('BEGIN');
      await lock.query(
        'LOCK TABLE "PlatformBootstrap" IN ACCESS EXCLUSIVE MODE',
      );
      requests = Array.from({ length: 4 }, () =>
        http(instance)
          .get('/health/ready')
          .then((response) => response),
      );
      for (let i = 0; i < 100 && service.mock.calls.length < 4; i++)
        await pause(10);
      expect(service).toHaveBeenCalledTimes(4);
      const refused = await http(instance).get('/health/ready').expect(429);
      expect(refused.body).toEqual({ code: 'RATE_LIMITED' });
      expect(Number(refused.headers['retry-after'])).toBeGreaterThan(0);
      expect(service).toHaveBeenCalledTimes(4);
    } finally {
      await lock.query('ROLLBACK');
      lock.release();
      await Promise.all(requests);
      service.mockRestore();
      await instance.close();
    }
  }, 30000);
  it('bounds real blocked SQL probes and recovers after releasing the lock', async () => {
    const lock = await pool.connect();
    try {
      await lock.query('BEGIN');
      await lock.query(
        'LOCK TABLE "PlatformBootstrap" IN ACCESS EXCLUSIVE MODE',
      );
      for (let i = 0; i < 2; i++) {
        const start = performance.now();
        await http().get('/health/ready').expect(503, { status: 'not_ready' });
        expect(performance.now() - start).toBeLessThan(
          config.HEALTH_TOTAL_TIMEOUT_MS,
        );
      }
      const pending = await pool.query(
        "SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock'",
      );
      expect(pending.rows[0].count).toBeLessThanOrEqual(
        config.HEALTH_MAX_CONCURRENT,
      );
    } finally {
      await lock.query('ROLLBACK');
      lock.release();
    }
    await waitReady();
  }, 15000);
  it('returns a generic 500 for an injected unexpected fault without exposing it', async () => {
    // Injection de faute uniquement dans le test, sur le contrôleur réel ; aucune route artificielle.
    const service = jest
      .spyOn(app.get(HealthService), 'ready')
      .mockRejectedValueOnce(
        new Error('secret-driver-detail postgresql://private:secret@host/db'),
      );
    try {
      await http().get('/health/ready').expect(500, { code: 'INTERNAL_ERROR' });
    } finally {
      service.mockRestore();
    }
  });
  it('writes normalized diagnostic logs only, with no request body, IP or secret', () => {
    const records = logs.map((line) => JSON.parse(line));
    expect(
      records.some(
        (record) =>
          record.event === 'dependency_check' &&
          record.dependency === 'postgres' &&
          record.outcome === 'schema_mismatch',
      ),
    ).toBe(true);
    expect(
      records.some(
        (record) =>
          record.event === 'dependency_check' &&
          record.dependency === 'redis' &&
          record.outcome !== 'up',
      ),
    ).toBe(true);
    for (const record of records) {
      expect(
        Object.keys(record).every((key) =>
          [
            'timestamp',
            'level',
            'event',
            'requestId',
            'durationMs',
            'dependency',
            'outcome',
          ].includes(key),
        ),
      ).toBe(true);
      expect(Number.isNaN(Date.parse(record.timestamp))).toBe(false);
      if (record.requestId) expect(record.requestId).toMatch(/^[0-9a-f-]{36}$/);
      if (record.durationMs !== undefined)
        expect(record.durationMs).toBeGreaterThanOrEqual(0);
    }
    expect(logs.join('')).not.toContain(password);
    expect(logs.join('')).not.toMatch(
      /secret-header|secret-body|secret-driver-detail|postgresql:\/\/|198\.51\.100\.1/,
    );
  });
  it('boots HTTP even with both dependencies already stopped', async () => {
    compose('stop', 'postgres', 'redis');
    let instance: NestExpressApplication | undefined;
    try {
      instance = await api();
      await http(instance).get('/health/live').expect(200, { status: 'alive' });
      await http(instance)
        .get('/health/ready')
        .expect(503, { status: 'not_ready' });
    } finally {
      await instance?.close();
      compose('up', '-d', '--wait');
    }
    await waitReady();
  }, 90000);
});
