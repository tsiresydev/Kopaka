import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { RedisModule } from '../redis/redis.module.js';
import { HealthService } from './health.service.js';
import { HealthController } from './health.controller.js';
import { HealthLimitGuard } from './health-limit.guard.js';
import { TechnicalLogger } from '../common/logger.js';

@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [HealthController],
  providers: [HealthService, HealthLimitGuard, TechnicalLogger],
  exports: [HealthService, TechnicalLogger],
})
export class HealthModule {}
