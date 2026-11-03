import { spawnSync } from 'node:child_process';
const run = (args, env = process.env) => {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env });
  if (result.status !== 0) process.exit(result.status ?? 1);
};
run(['../../scripts/workspace.mjs', 'build', '@kopaka/api']);
run(['../../node_modules/typescript/bin/tsc', '-p', 'tsconfig.test.json']);
run(
  [
    '--experimental-vm-modules',
    '../../node_modules/jest/bin/jest.js',
    '--config',
    'test/jest.config.mjs',
    '--runInBand',
  ],
  { ...process.env, KOPAKA_INTEGRATION: '1' },
);
