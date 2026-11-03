import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: [
      'packages/**/*.test.{ts,tsx}',
      'packages/**/*.spec.ts',
      'apps/web/tests/**/*.test.{ts,tsx}',
      'tests/operations/**/*.test.ts',
    ],
    environment: 'jsdom',
    passWithNoTests: true,
  },
});
