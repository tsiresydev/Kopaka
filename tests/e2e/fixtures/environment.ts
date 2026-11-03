import { test as base, expect } from '@playwright/test';
import { execFileSync, spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { appendFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';

interface Environment {
  baseURL: string;
  apiURL: string;
  stopDependency(name: 'postgres' | 'redis'): void;
  startDependency(name: 'postgres' | 'redis'): Promise<void>;
  stopApi(): Promise<void>;
  startApi(): Promise<void>;
}
const root = resolve(import.meta.dirname, '../../..');
export const test = base.extend<
  { browserEvidence: void },
  { environment: Environment }
>({
  browserEvidence: [
    async ({ browser, browserName }, use, testInfo) => {
      testInfo.annotations.push({
        type: 'browser-version',
        description: `${browserName} ${browser.version()} / ${process.platform} ${process.arch} / Node ${process.versions.node}`,
      });
      await use();
    },
    { auto: true },
  ],
  environment: [
    async ({ playwright }, use, workerInfo) => {
      void playwright;
      const password = randomUUID().replaceAll('-', '');
      const project = 'kopaka-web-test-' + randomUUID().slice(0, 8);
      const baseURL = 'http://127.0.0.1:13010';
      const apiURL = 'http://127.0.0.1:13011';
      const apiEnv = {
        ...process.env,
        DATABASE_URL:
          'postgresql://kopaka:' +
          password +
          '@127.0.0.1:15434/kopaka_web_test',
        REDIS_URL: 'redis://127.0.0.1:16381',
        WEB_ORIGIN: baseURL,
        API_PORT: '13011',
        HEALTH_RATE_LIMIT_PER_MINUTE: '1000',
      };
      const dockerEnv = {
        ...process.env,
        POSTGRES_PASSWORD: password,
        POSTGRES_DB: 'kopaka_web_test',
        POSTGRES_PORT: '15434',
        REDIS_PORT: '16381',
      };
      const webEnv = {
        ...process.env,
        NEXT_PUBLIC_API_BASE_URL: apiURL,
        KOPAKA_E2E_BUILD: '1',
      };
      let api: ChildProcess | undefined;
      let web: ChildProcess | undefined;
      let started = false;
      mkdirSync(resolve(root, 'test-results'), { recursive: true });
      const logPath = resolve(
        root,
        'test-results',
        'environment-' + workerInfo.workerIndex + '.log',
      );
      const log = (chunk: unknown) =>
        appendFileSync(
          logPath,
          String(chunk).replaceAll(password, '[redacted]'),
        );
      const run = (command: string, args: string[], env: NodeJS.ProcessEnv) => {
        try {
          const output = execFileSync(command, args, {
            cwd: root,
            env,
            stdio: 'pipe',
            timeout: 180000,
          });
          log(output);
        } catch (error) {
          const failure = error as { stdout?: Buffer; stderr?: Buffer };
          if (failure.stdout) log(failure.stdout);
          if (failure.stderr) log(failure.stderr);
          throw new Error(
            'E2E environment command failed; see sanitized environment log.',
          );
        }
      };
      const compose = (...args: string[]) =>
        run(
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
          dockerEnv,
        );
      const stop = async (child: ChildProcess | undefined) => {
        if (!child || child.exitCode !== null) return;
        await new Promise<void>((resolve) => {
          child.once('exit', () => resolve());
          child.kill();
        });
      };
      const start = (args: string[], env: NodeJS.ProcessEnv, cwd = root) => {
        const child = spawn(process.execPath, args, {
          cwd,
          env,
          stdio: 'pipe',
        });
        child.stdout?.on('data', log);
        child.stderr?.on('data', log);
        return child;
      };
      const wait = async (url: string, expected: number) => {
        const deadline = Date.now() + 30000;
        while (Date.now() < deadline) {
          try {
            if (
              (await fetch(url, { signal: AbortSignal.timeout(1000) }))
                .status === expected
            )
              return;
          } catch {
            /* Service may still be starting. */
          }
          await pause(150);
        }
        throw new Error(
          'E2E service startup timeout; see sanitized environment log.',
        );
      };
      const startApi = async () => {
        api = start(['apps/api/dist/main.js'], apiEnv);
        await wait(apiURL + '/health/ready', 200);
      };
      try {
        run('docker', ['version'], process.env);
        started = true;
        compose('up', '-d', '--wait');
        if (!process.env.npm_execpath) throw new Error('Run E2E through pnpm.');
        run(
          process.execPath,
          [process.env.npm_execpath, '--filter', '@kopaka/api', 'build'],
          process.env,
        );
        run(process.execPath, ['scripts/db.mjs', 'migrate', 'deploy'], apiEnv);
        await startApi();
        run(
          process.execPath,
          [process.env.npm_execpath, '--filter', '@kopaka/web', 'build'],
          webEnv,
        );
        web = start(
          [
            resolve(root, 'apps/web/node_modules/next/dist/bin/next'),
            'start',
            '--hostname',
            '127.0.0.1',
            '--port',
            '13010',
          ],
          webEnv,
          resolve(root, 'apps/web'),
        );
        await wait(baseURL, 200);
        await use({
          baseURL,
          apiURL,
          stopDependency: (name) => compose('stop', name),
          startDependency: async (name) => {
            compose('up', '-d', '--wait', name);
            await wait(apiURL + '/health/ready', 200);
          },
          stopApi: async () => {
            await stop(api);
            api = undefined;
          },
          startApi,
        });
      } finally {
        await stop(web);
        await stop(api);
        if (started) compose('down');
      }
    },
    { scope: 'worker', timeout: 240000 },
  ],
  baseURL: async ({ environment }, use) => use(environment.baseURL),
});
export { expect };
