import { Inject, Injectable } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { RedisService } from '../redis/redis.service.js';
import { API_CONFIG } from '../config/config.module.js';
import type { ApiConfig } from '../config/config.schema.js';
import { TechnicalLogger } from '../common/logger.js';

type Outcome = 'up' | 'down' | 'timeout' | 'schema_mismatch';
type Dependency = 'postgres' | 'redis';
export interface HealthSnapshot {
  readonly ready: boolean;
  readonly postgres: Outcome;
  readonly redis: Outcome;
  readonly checkedAt: string;
  readonly durationMs: number;
}

@Injectable()
export class HealthService implements OnApplicationShutdown {
  private readonly occupied: Record<Dependency, number> = {
    postgres: 0,
    redis: 0,
  };
  private readonly evaluations = new Set<AbortController>();
  private closing = false;
  constructor(
    private readonly database: DatabaseService,
    private readonly redis: RedisService,
    @Inject(API_CONFIG) private readonly config: ApiConfig,
    private readonly logger: TechnicalLogger,
  ) {}

  async ready(
    requestId?: string,
    callerSignal?: AbortSignal,
  ): Promise<HealthSnapshot> {
    const start = performance.now();
    if (this.closing) return this.snapshot('down', 'down', start, false);
    const controller = new AbortController();
    this.evaluations.add(controller);
    const signal = callerSignal
      ? AbortSignal.any([controller.signal, callerSignal])
      : controller.signal;
    const deadline = start + this.config.HEALTH_TOTAL_TIMEOUT_MS;
    const timer = setTimeout(
      () => controller.abort(),
      this.config.HEALTH_TOTAL_TIMEOUT_MS,
    );
    try {
      const [postgres, redis] = await Promise.all([
        this.probe(
          'postgres',
          async () => {
            const row = await this.database.client.platformBootstrap.findUnique(
              {
                where: { id: 'sprint-1' },
                select: { id: true, schemaVersion: true },
              },
            );
            return row?.id === 'sprint-1' && row.schemaVersion === 1
              ? 'up'
              : 'schema_mismatch';
          },
          signal,
          deadline,
          requestId,
        ),
        this.probe(
          'redis',
          async (probeSignal) =>
            (await this.redis.ping(probeSignal)) === 'PONG' ? 'up' : 'down',
          signal,
          deadline,
          requestId,
        ),
      ]);
      const result = this.snapshot(
        postgres,
        redis,
        start,
        !signal.aborted && performance.now() <= deadline,
      );
      this.logger.write('readiness_check', {
        requestId,
        durationMs: result.durationMs,
        outcome: result.ready ? 'ready' : 'not_ready',
      });
      return result;
    } catch (error) {
      this.logger.write('readiness_check', {
        requestId,
        durationMs: Math.max(0, performance.now() - start),
        outcome: 'error',
      });
      throw error;
    } finally {
      controller.abort();
      clearTimeout(timer);
      this.evaluations.delete(controller);
    }
  }

  private snapshot(
    postgres: Outcome,
    redis: Outcome,
    start: number,
    withinDeadline: boolean,
  ): HealthSnapshot {
    return Object.freeze({
      ready: withinDeadline && postgres === 'up' && redis === 'up',
      postgres,
      redis,
      checkedAt: new Date().toISOString(),
      durationMs: Math.max(0, Math.round(performance.now() - start)),
    });
  }

  private async probe(
    dependency: Dependency,
    operation: (signal: AbortSignal) => Promise<Outcome>,
    parent: AbortSignal,
    totalDeadline: number,
    requestId?: string,
  ): Promise<Outcome> {
    const start = performance.now();
    const capacity =
      dependency === 'postgres'
        ? Math.min(this.config.PG_POOL_MAX, this.config.HEALTH_MAX_CONCURRENT)
        : this.config.HEALTH_MAX_CONCURRENT;
    const log = (outcome: Outcome) => {
      this.logger.write('dependency_check', {
        dependency,
        requestId,
        durationMs: Math.max(0, performance.now() - start),
        outcome,
      });
      return outcome;
    };
    if (parent.aborted || this.occupied[dependency] >= capacity)
      return log('timeout');
    this.occupied[dependency]++;
    const controller = new AbortController();
    const signal = AbortSignal.any([parent, controller.signal]);
    const deadline = Math.min(
      start + this.config.HEALTH_DEPENDENCY_TIMEOUT_MS,
      totalDeadline,
    );
    const result = await new Promise<Outcome>((resolve, reject) => {
      let settled = false;
      const finish = (outcome: Outcome, fault?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal.removeEventListener('abort', onAbort);
        if (fault) {
          reject(fault);
          return;
        }
        resolve(
          signal.aborted || performance.now() >= deadline ? 'timeout' : outcome,
        );
      };
      const onAbort = () => finish('timeout');
      const timer = setTimeout(
        () => controller.abort(),
        Math.max(0, deadline - performance.now()),
      );
      signal.addEventListener('abort', onAbort, { once: true });
      // La place n'est libérée qu'à la fin réelle de l'IO, jamais à l'expiration
      // de la réponse HTTP. Les requêtes SQL non annulables restent bornées.
      Promise.resolve()
        .then(() =>
          signal.aborted || performance.now() >= deadline
            ? ('timeout' as const)
            : operation(signal),
        )
        .then(
          (outcome) => finish(outcome),
          (error) => {
            if (
              error instanceof TypeError ||
              error instanceof ReferenceError ||
              error instanceof RangeError ||
              error instanceof SyntaxError ||
              error instanceof URIError ||
              error instanceof EvalError
            ) {
              finish('down', error);
              return;
            }
            const rawCode =
              typeof error === 'object' && error !== null && 'code' in error
                ? error.code
                : undefined;
            const code = typeof rawCode === 'string' ? rawCode : '';
            const name = error instanceof Error ? error.name : '';
            finish(
              dependency === 'postgres' && ['P2021', 'P2022'].includes(code)
                ? 'schema_mismatch'
                : ['ETIMEDOUT', 'P1002', 'P1008', 'P2024', '57014'].includes(
                      code,
                    ) || ['AbortError', 'TimeoutError'].includes(name)
                  ? 'timeout'
                  : 'down',
            );
          },
        )
        .finally(() => {
          this.occupied[dependency]--;
        });
    });
    return log(result);
  }

  onApplicationShutdown(): void {
    this.closing = true;
    for (const controller of this.evaluations) controller.abort();
    this.logger.write('shutdown', { outcome: 'closed' });
  }
}
