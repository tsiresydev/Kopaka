import { z } from 'zod';
const positive = (fallback: number, max: number) =>
  z.coerce.number().int().min(1).max(max).default(fallback);
const url = (protocols: string[]) =>
  z.string().refine((value) => {
    try {
      const parsed = new URL(value);
      return protocols.includes(parsed.protocol) && parsed.hostname.length > 0;
    } catch {
      return false;
    }
  });
const schema = z
  .object({
    DATABASE_URL: url(['postgresql:', 'postgres:']),
    REDIS_URL: url(['redis:', 'rediss:']),
    WEB_ORIGIN: z.string().refine((value) => {
      try {
        return new URL(value).origin === value && /^https?:/.test(value);
      } catch {
        return false;
      }
    }),
    API_PORT: positive(3001, 65535),
    HEALTH_DEPENDENCY_TIMEOUT_MS: positive(1000, 30000),
    HEALTH_TOTAL_TIMEOUT_MS: positive(2000, 60000),
    HEALTH_RATE_LIMIT_PER_MINUTE: positive(30, 10000),
    HEALTH_MAX_CONCURRENT: positive(4, 64),
    PG_POOL_MAX: positive(4, 16),
    PG_CONNECT_TIMEOUT_MS: positive(1000, 30000),
    PG_QUERY_TIMEOUT_MS: positive(1000, 30000),
  })
  .superRefine((value, ctx) => {
    if (value.HEALTH_TOTAL_TIMEOUT_MS < value.HEALTH_DEPENDENCY_TIMEOUT_MS)
      ctx.addIssue({
        code: 'custom',
        path: ['HEALTH_TOTAL_TIMEOUT_MS'],
        message: 'invalid',
      });
  });
export type ApiConfig = z.infer<typeof schema>;
export function parseConfig(input: Record<string, unknown>): ApiConfig {
  const result = schema.safeParse(input);
  if (!result.success)
    throw new Error(
      'Configuration invalide: ' +
        [
          ...new Set(result.error.issues.map((issue) => String(issue.path[0]))),
        ].join(', '),
    );
  return Object.freeze(result.data);
}
