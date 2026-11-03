import { Inject, Injectable } from '@nestjs/common';
import type { OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { API_CONFIG } from '../config/config.module.js';
import type { ApiConfig } from '../config/config.schema.js';
@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  readonly client: PrismaClient;
  constructor(@Inject(API_CONFIG) config: ApiConfig) {
    const adapter = new PrismaPg(
      {
        connectionString: config.DATABASE_URL,
        max: config.PG_POOL_MAX,
        connectionTimeoutMillis: config.PG_CONNECT_TIMEOUT_MS,
        query_timeout: config.PG_QUERY_TIMEOUT_MS,
        statement_timeout: config.PG_QUERY_TIMEOUT_MS,
        idleTimeoutMillis: 10000,
      },
      { onPoolError: () => {}, onConnectionError: () => {} },
    );
    this.client = new PrismaClient({ adapter, log: [] });
  }
  async onApplicationShutdown() {
    await this.client.$disconnect();
  }
}
