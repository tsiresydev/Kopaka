import { test as platformTest, expect } from './environment';
import type { BrowserContext } from '@playwright/test';

interface GuestVisitors {
  /** Separate cookies/storage: knowledge of a nickname is never a proof. */
  firstGuest: BrowserContext;
  independentGuest: BrowserContext;
}

/** Real platform fixture; no route interception or successful guest identity. */
export const test = platformTest.extend<GuestVisitors>({
  firstGuest: async ({ browser, baseURL }, use) => {
    if (!baseURL) throw new Error('Guest tests require an isolated web origin');
    const context = await browser.newContext({ baseURL });
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },
  independentGuest: async ({ browser, baseURL }, use) => {
    if (!baseURL) throw new Error('Guest tests require an isolated web origin');
    const context = await browser.newContext({ baseURL });
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },
});

export const guestFixtureNames = {
  first: 'Rana Rivo',
  independent: 'Vola Rivo',
  accentCollision: ['Élo', 'E\u0301lo', 'elo'],
  reservedVariant: 'Ad_m1n',
  permittedCounterexample: 'Supporter',
} as const;

// Two tabs of the same identity must use firstGuest.newPage() twice.
// independentGuest is deliberately a different browser context, not a new tab.
export { expect };
