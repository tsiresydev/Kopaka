import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const [mode, target] = process.argv.slice(2);
if (
  !['build', 'dev'].includes(mode) ||
  !['@kopaka/api', '@kopaka/web'].includes(target) ||
  !process.env.npm_execpath
)
  throw new Error('Commande workspace invalide');
const pnpm = (args) =>
  spawnSync(process.execPath, [process.env.npm_execpath, ...args], {
    cwd: root,
    stdio: 'inherit',
  });
const filter =
  mode === 'dev' && target === '@kopaka/web' ? target + '^...' : target;
const result = pnpm(['exec', 'turbo', 'run', 'compile', '--filter=' + filter]);
if (result.status !== 0) process.exit(result.status ?? 1);
if (mode === 'build') process.exit(0);
const cwd = fileURLToPath(
  new URL('../apps/' + target.split('/')[1] + '/', import.meta.url),
);
const children = [];
const start = (args) => {
  const child = spawn(process.execPath, args, { cwd, stdio: 'inherit' });
  children.push(child);
  child.on('exit', (code) => {
    if (code) process.exitCode = code;
  });
  return child;
};
if (target === '@kopaka/api') {
  start([
    fileURLToPath(
      new URL('../node_modules/typescript/bin/tsc', import.meta.url),
    ),
    '-p',
    'tsconfig.json',
    '--watch',
    '--preserveWatchOutput',
  ]);
  start(['--watch', 'dist/main.js']);
} else
  start([
    fileURLToPath(
      new URL('../apps/web/node_modules/next/dist/bin/next', import.meta.url),
    ),
    'dev',
    '--hostname',
    '127.0.0.1',
    '--port',
    '3000',
  ]);
const stop = () => {
  for (const child of children) child.kill();
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
process.on('exit', stop);
