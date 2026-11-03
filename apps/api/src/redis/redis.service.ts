import { Inject, Injectable } from '@nestjs/common';
import type {
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { createClient } from 'redis';
import { API_CONFIG } from '../config/config.module.js';
import type { ApiConfig } from '../config/config.schema.js';
@Injectable()
export class RedisService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  readonly client;
  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {
    this.client = createClient({
      url: config.REDIS_URL,
      disableOfflineQueue: true,
      commandsQueueMaxLength: config.HEALTH_MAX_CONCURRENT,
      socket: {
        connectTimeout: config.HEALTH_DEPENDENCY_TIMEOUT_MS,
        reconnectStrategy: (retries) =>
          Math.min(100 * 2 ** Math.min(retries, 5), 2000),
      },
    });
    // Diagnostic normalis? en US3 ; ne jamais propager le message brut du driver.
    this.client.on('error', () => {});
  }
  onApplicationBootstrap() {
    void this.client.connect().catch(() => {});
  }
  async ping(callerSignal?: AbortSignal): Promise<string> {
    const timeout = AbortSignal.timeout(
      this.config.HEALTH_DEPENDENCY_TIMEOUT_MS,
    );
    return this.client
      .withCommandOptions({
        abortSignal: callerSignal
          ? AbortSignal.any([timeout, callerSignal])
          : timeout,
      })
      .ping();
  }
  onApplicationShutdown() {
    if (this.client.isOpen) this.client.destroy();
  }
}
