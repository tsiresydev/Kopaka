import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '.pnpm-store/**',
      '**/dist-test/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.next-e2e/**',
      'quality-results/**',
      '**/coverage/**',
      '**/*.min.js',
      '.agents/**',
      '.specify/**',
      'design-system/**',
      'playwright-report/**',
      'test-results/**',
      'apps/web/next-env.d.ts',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/apps/**', '@kopaka/api', '@kopaka/web'],
              message: 'Les applications restent indépendantes.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'apps/web/**/*.{ts,tsx}',
      'packages/ui/**/*.{ts,tsx}',
      'packages/shared-types/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/apps/**',
                '@kopaka/api',
                '@kopaka/web',
                '@nestjs/*',
                '@prisma/*',
                'prisma',
                'pg',
                'redis',
                '@kopaka/validation/server',
                '**/config/config.schema*',
              ],
              message:
                'Aucun code serveur dans le navigateur ou les types partagés.',
            },
          ],
        },
      ],
    },
  },
);
