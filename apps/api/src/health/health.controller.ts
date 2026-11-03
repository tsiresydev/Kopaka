import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { ServerResponse } from 'node:http';
import { liveResponseSchema, readyResponseSchema } from '@kopaka/validation';
import { HealthService } from './health.service.js';
import { HealthLimitGuard } from './health-limit.guard.js';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}
  @Get('live')
  live() {
    return liveResponseSchema.parse({ status: 'alive' });
  }

  @Get('ready')
  @UseGuards(HealthLimitGuard)
  async ready(@Res({ passthrough: true }) response: ServerResponse) {
    const controller = new AbortController();
    const close = () => controller.abort();
    response.once('close', close);
    try {
      const requestId = response.getHeader('X-Request-Id');
      const result = await this.health.ready(
        typeof requestId === 'string' ? requestId : undefined,
        controller.signal,
      );
      response.statusCode = result.ready ? 200 : 503;
      return readyResponseSchema.parse({
        status: result.ready ? 'ready' : 'not_ready',
      });
    } finally {
      response.off('close', close);
    }
  }
}
