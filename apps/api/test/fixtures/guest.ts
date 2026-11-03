import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Test data only. Never import from apps/api/src or enable a production clock. */
export const GUEST_FIXTURE_INSTANT = '2026-11-03T12:00:00.000Z';
export const GUEST_FIXTURE_APPROVAL = 'fixture-only:not-owner-approved';

export function createGuestTestClock(initial = GUEST_FIXTURE_INSTANT) {
  let instant = Date.parse(initial);
  const validate = (value: number) => {
    if (!Number.isFinite(value) || Number.isNaN(new Date(value).getTime())) {
      throw new RangeError('Invalid guest test instant');
    }
    return value;
  };
  validate(instant);
  return {
    now: () => new Date(instant),
    set(value: string) {
      instant = validate(Date.parse(value));
    },
    advance(milliseconds: number) {
      instant = validate(instant + milliseconds);
    },
  };
}

export const guestFixtureVisitors = {
  first: { nickname: 'Rana Rivo' },
  independent: { nickname: 'Vola Rivo' },
} as const;

export const guestNicknameFixtures = {
  lengths: [
    { nickname: 'Ra', graphemes: 2, validLength: false },
    { nickname: 'Ran', graphemes: 3, validLength: true },
    { nickname: 'R'.repeat(20), graphemes: 20, validLength: true },
    { nickname: 'R'.repeat(21), graphemes: 21, validLength: false },
  ],
  sameUniqueKey: ['Élo', 'E\u0301lo', 'elo'],
  distinctUniqueKeys: ['Rana1', 'Ranai', 'Rana-Rivo', 'Rana Rivo', 'Rana_Rivo'],
  reservedVariants: ['Ad_m1n', 'Àd-mïn', 'A d m i n'],
  notBlockedByReservedNameAlone: ['Supporter', 'Admin123'],
  invalidCharacters: ['Ra\u202ena', 'Ra\u200bna'],
} as const;

/** Guard before future test cleanup. This helper never connects or deletes. */
export function assertGuestTestDatabase(
  connectionString: string,
  expectedDatabase: string,
): void {
  const message = 'Guest fixtures require their dedicated isolated database';
  try {
    const url = new URL(connectionString);
    if (
      !/^kopaka_guest_test_[a-f0-9]{8}$/.test(expectedDatabase) ||
      !['postgresql:', 'postgres:'].includes(url.protocol) ||
      !['127.0.0.1', 'localhost'].includes(url.hostname) ||
      url.port !== '15435' ||
      url.pathname !== `/${expectedDatabase}` ||
      url.search !== '' ||
      url.hash !== ''
    ) {
      throw new Error(message);
    }
  } catch {
    // Never include a connection string, password or caller input in errors.
    throw new Error(message);
  }
}

/** Caller supplies its test-data directory; no dependence on source/dist cwd. */
export function readGuestContentFixture(
  directory: string,
  kind: 'manifest' | 'documents' | 'moderation-policy' | 'counterexamples',
): unknown {
  return JSON.parse(readFileSync(resolve(directory, `${kind}.json`), 'utf8'));
}
