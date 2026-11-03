import 'reflect-metadata';
import { describe, expect, it } from '@jest/globals';
import { AppModule } from './app.module.js';
import { API_CONFIG } from './config/config.module.js';
import { parseConfig } from './config/config.schema.js';
import { Test } from '@nestjs/testing';
import { DatabaseService } from './database/database.service.js';
import { RedisService } from './redis/redis.service.js';
describe('US1 bootstrap without data services', () => {
  it('boots with unavailable dependencies and closes resources', async () => {
    const config = parseConfig({
      DATABASE_URL: 'postgresql://fixture:private@127.0.0.1:1/kopaka',
      REDIS_URL: 'redis://127.0.0.1:1',
      WEB_ORIGIN: 'http://localhost:3000',
      HEALTH_DEPENDENCY_TIMEOUT_MS: '50',
    });
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(API_CONFIG)
      .useValue(config)
      .compile();
    const app = module.createNestApplication({ logger: false });
    try {
      await app.init();
      expect(app.get(DatabaseService).client).toBeDefined();
      expect(app.get(RedisService)).toBeDefined();
      await expect(app.get(RedisService).ping()).rejects.toThrow();
    } finally {
      await app.close();
    }
  }, 5000);
});
