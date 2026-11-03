import { describe, expect, it } from '@jest/globals';
import { assertGuestTestDatabase, createGuestTestClock } from './guest.js';

describe('guest fixture safety boundaries (no database connection)', () => {
  const database = 'kopaka_guest_test_a1b2c3d4';

  it('allows only the explicitly named isolated loopback test database', () => {
    expect(() =>
      assertGuestTestDatabase(
        `postgresql://fixture:fixture@127.0.0.1:15435/${database}`,
        database,
      ),
    ).not.toThrow();
  });

  it.each([
    'postgresql://fixture:fixture@127.0.0.1:5432/kopaka',
    `postgresql://fixture:fixture@127.0.0.1:5432/${database}`,
    `postgresql://fixture:fixture@example.invalid:15435/${database}`,
    'postgresql://fixture:fixture@127.0.0.1:15435/kopaka_guest_test_00000000',
    `postgresql://fixture:fixture@127.0.0.1:15435/${database}?options=-csearch_path%3Dpublic`,
    'not-a-database-url',
  ])('refuses a non-owned cleanup target without echoing its URL', (url) => {
    expect(() => assertGuestTestDatabase(url, database)).toThrow(
      'Guest fixtures require their dedicated isolated database',
    );
  });

  it('rejects a caller attempting to designate the development database', () => {
    expect(() =>
      assertGuestTestDatabase(
        'postgresql://fixture:fixture@127.0.0.1:15435/kopaka',
        'kopaka',
      ),
    ).toThrow();
  });

  it('controls test time without changing the global clock or shared Date objects', () => {
    const clock = createGuestTestClock();
    const first = clock.now();
    first.setUTCFullYear(2000);
    expect(clock.now().toISOString()).toBe('2026-11-03T12:00:00.000Z');
    clock.advance(1);
    expect(clock.now().toISOString()).toBe('2026-11-03T12:00:00.001Z');
    clock.set('2026-12-03T12:00:00.000Z');
    expect(clock.now().toISOString()).toBe('2026-12-03T12:00:00.000Z');
    expect(() => clock.advance(Number.NaN)).toThrow(RangeError);
    expect(clock.now().toISOString()).toBe('2026-12-03T12:00:00.000Z');
  });
});
