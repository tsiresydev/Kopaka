import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { Pool } from 'pg';
const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '../../../..');
const project = 'kopaka-test-' + randomUUID().slice(0, 8);
const port = 15432;
const password = randomUUID();
const databaseUrl =
  'postgresql://kopaka:' + password + '@127.0.0.1:' + port + '/kopaka_test';
const env = {
  ...process.env,
  POSTGRES_PORT: String(port),
  REDIS_PORT: '16379',
  POSTGRES_PASSWORD: password,
  POSTGRES_DB: 'kopaka_test',
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
const migrate = () =>
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
let pool: Pool;
let started = false;
async function row() {
  return (
    await pool.query(
      'SELECT "id", "schemaVersion", "initializedAt" FROM "PlatformBootstrap"',
    )
  ).rows;
}
describe('versioned migration and normal restart on isolated data', () => {
  beforeAll(async () => {
    execFileSync('docker', ['version'], { stdio: 'pipe', timeout: 15000 });
    started = true;
    compose('up', '-d', '--wait', 'postgres');
    pool = new Pool({
      connectionString: databaseUrl,
      max: 1,
      connectionTimeoutMillis: 3000,
    });
  }, 150000);
  afterAll(async () => {
    if (pool) await pool.end();
    if (started) compose('down');
  }, 150000);
  it('starts empty, deploys once, preserves singleton and timestamp on second deploy and restart', async () => {
    expect(
      (
        await pool.query('SELECT to_regclass($1) AS table_name', [
          'public."PlatformBootstrap"',
        ])
      ).rows[0].table_name,
    ).toBeNull();
    migrate();
    const first = await row();
    expect(first).toHaveLength(1);
    expect(first[0].id).toBe('sprint-1');
    expect(first[0].schemaVersion).toBe(1);
    expect(first[0].initializedAt).toBeInstanceOf(Date);
    migrate();
    expect(await row()).toEqual(first);
    await pool.end();
    compose('restart', 'postgres');
    compose('up', '-d', '--wait', 'postgres');
    pool = new Pool({
      connectionString: databaseUrl,
      max: 1,
      connectionTimeoutMillis: 3000,
    });
    expect(await row()).toEqual(first);
    await expect(
      pool.query('INSERT INTO "PlatformBootstrap" VALUES ($1,1,NOW())', [
        'other',
      ]),
    ).rejects.toThrow();
    await expect(
      pool.query('UPDATE "PlatformBootstrap" SET "schemaVersion"=0'),
    ).rejects.toThrow();
  }, 180000);
});
