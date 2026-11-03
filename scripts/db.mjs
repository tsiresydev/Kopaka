import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, URL } from 'node:url';
import { config } from 'dotenv';
const root = fileURLToPath(new URL('../', import.meta.url));
config({
  path: fileURLToPath(new URL('../apps/api/.env', import.meta.url)),
  quiet: true,
});
const args = process.argv.slice(2);
if (args[0] !== 'generate') {
  try {
    const url = new URL(process.env.DATABASE_URL ?? '');
    if (!['postgresql:', 'postgres:'].includes(url.protocol)) throw Error();
  } catch {
    console.error('Configuration invalide: DATABASE_URL');
    process.exit(1);
  }
}
const result = spawnSync(
  process.execPath,
  [
    createRequire(import.meta.url).resolve('prisma/build/index.js'),
    ...args,
    '--config',
    'prisma/prisma.config.ts',
  ],
  { cwd: root, stdio: 'inherit' },
);
process.exit(result.status ?? 1);
