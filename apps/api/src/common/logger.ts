import { Injectable } from '@nestjs/common';
import { requestIdSchema } from '@kopaka/validation/server';

export type LogEvent =
  'http_request' | 'dependency_check' | 'readiness_check' | 'shutdown';
const outcomes = [
  'up',
  'down',
  'timeout',
  'schema_mismatch',
  'ready',
  'not_ready',
  'success',
  'rejected',
  'error',
  'closed',
] as const;

@Injectable()
export class TechnicalLogger {
  write(event: LogEvent, fields: Record<string, unknown> = {}): void {
    const outcome = outcomes.includes(
      fields.outcome as (typeof outcomes)[number],
    )
      ? fields.outcome
      : 'error';
    const record: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level:
        outcome === 'error'
          ? 'error'
          : [
                'down',
                'timeout',
                'schema_mismatch',
                'not_ready',
                'rejected',
              ].includes(String(outcome))
            ? 'warn'
            : 'info',
      event,
      outcome,
    };
    const id = requestIdSchema.safeParse(fields.requestId);
    if (id.success) record.requestId = id.data;
    if (
      typeof fields.durationMs === 'number' &&
      Number.isFinite(fields.durationMs) &&
      fields.durationMs >= 0
    )
      record.durationMs = Math.round(fields.durationMs);
    if (fields.dependency === 'postgres' || fields.dependency === 'redis')
      record.dependency = fields.dependency;
    process.stdout.write(JSON.stringify(record) + '\n');
  }
}
