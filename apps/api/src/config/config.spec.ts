import { describe, expect, it } from '@jest/globals';
import { parseConfig } from './config.schema.js';
const valid = {
  DATABASE_URL: 'postgresql://local:fixture@127.0.0.1:5432/kopaka',
  REDIS_URL: 'redis://127.0.0.1:6379',
  WEB_ORIGIN: 'http://localhost:3000',
};
describe('configuration', () => {
  it('accepts local configuration and bounded defaults', () => {
    const config = parseConfig(valid);
    expect(config.API_PORT).toBe(3001);
    expect(config.PG_POOL_MAX).toBe(4);
    expect(config.HEALTH_DEPENDENCY_TIMEOUT_MS).toBe(1000);
  });
  it.each(['DATABASE_URL', 'REDIS_URL', 'WEB_ORIGIN'])(
    'rejects missing %s',
    (key) => {
      const input: Record<string, string> = { ...valid };
      delete input[key];
      expect(() => parseConfig(input)).toThrow(key);
    },
  );
  it.each([
    { DATABASE_URL: 'private-value-do-not-leak' },
    { DATABASE_URL: 'postgresql:' },
    { REDIS_URL: 'redis:' },
    { REDIS_URL: 'https://private-value-do-not-leak' },
    { WEB_ORIGIN: 'http://localhost:3000/path' },
    { API_PORT: '0' },
    { PG_POOL_MAX: '100000' },
    { HEALTH_DEPENDENCY_TIMEOUT_MS: '-1' },
    { HEALTH_TOTAL_TIMEOUT_MS: '0' },
    { HEALTH_MAX_CONCURRENT: '0' },
    { HEALTH_RATE_LIMIT_PER_MINUTE: 'NaN' },
  ])('rejects invalid values without leaking input', (patch) => {
    try {
      parseConfig({ ...valid, ...patch });
      throw new Error('accepted');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const message = (error as Error).message;
      expect(message).toContain('Configuration invalide:');
      expect(message).not.toContain('private-value-do-not-leak');
      expect(message).not.toContain('fixture');
    }
  });
  it('rejects dependency deadline exceeding total deadline', () => {
    expect(() =>
      parseConfig({
        ...valid,
        HEALTH_DEPENDENCY_TIMEOUT_MS: '3000',
        HEALTH_TOTAL_TIMEOUT_MS: '2000',
      }),
    ).toThrow('HEALTH_TOTAL_TIMEOUT_MS');
  });
  it('ignores unrelated process environment entries', () => {
    expect(parseConfig({ ...valid, UNRELATED: 'hidden' })).not.toHaveProperty(
      'UNRELATED',
    );
  });
});
