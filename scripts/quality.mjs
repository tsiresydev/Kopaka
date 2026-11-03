import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const checks = [
  'lint',
  'format:check',
  'typecheck',
  'test:unit',
  'test:integration',
  'build',
  'test:e2e',
];
const args = process.argv.slice(2);
const selected =
  args.length === 0
    ? checks
    : args[0] === '--only' && args.length === 2
      ? args[1].split(',')
      : [];
if (
  !selected.length ||
  selected.some((check) => !checks.includes(check)) ||
  !process.env.npm_execpath
) {
  console.error(
    'Usage: pnpm quality [--only lint,format:check,typecheck,test:unit,test:integration,build,test:e2e]',
  );
  process.exit(2);
}
mkdirSync(new URL('../quality-results/', import.meta.url), { recursive: true });
const reportPath = new URL('../quality-results/summary.json', import.meta.url);
const report = {
  startedAt: new Date().toISOString(),
  status: 'running',
  checks: [],
};
const save = () =>
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
save();
let failed = false;
for (const check of selected) {
  if (failed) {
    report.checks.push({ name: check, status: 'skipped' });
    continue;
  }
  console.log(`\n[quality] START ${check}`);
  const started = Date.now();
  const result = spawnSync(
    process.execPath,
    [process.env.npm_execpath, 'run', check],
    { cwd: root, env: process.env, stdio: 'inherit' },
  );
  failed = result.status !== 0 || Boolean(result.error);
  const status = failed ? 'failed' : 'passed';
  report.checks.push({
    name: check,
    status,
    exitCode: result.status ?? 1,
    durationMs: Date.now() - started,
  });
  console.log(`[quality] ${status.toUpperCase()} ${check}`);
  save();
}
report.status = failed ? 'failed' : 'passed';
report.finishedAt = new Date().toISOString();
save();
const summary = [
  '| Check | Result |',
  '|---|---|',
  ...report.checks.map((check) => `| ${check.name} | ${check.status} |`),
  '',
  `Quality: **${report.status}**`,
  '',
].join('\n');
console.log('\n' + summary);
if (process.env.GITHUB_STEP_SUMMARY)
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
process.exitCode = failed ? 1 : 0;
