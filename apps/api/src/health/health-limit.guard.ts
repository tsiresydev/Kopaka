import { HttpException, Inject, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { API_CONFIG } from '../config/config.module.js';
import type { ApiConfig } from '../config/config.schema.js';

const WINDOW_MS = 60000;
const MAX_BUCKETS = 4096;
@Injectable()
export class HealthLimitGuard implements CanActivate {
  private readonly windows = new Map<
    string,
    { resetAt: number; count: number }
  >();
  private active = 0;
  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<IncomingMessage>();
    const response = context.switchToHttp().getResponse<ServerResponse>();
    const now = Date.now();
    const ip = request.socket.remoteAddress ?? 'unknown';
    let window = this.windows.get(ip);
    if (!window || now >= window.resetAt) {
      if (this.windows.size >= MAX_BUCKETS)
        for (const [key, entry] of this.windows)
          if (now >= entry.resetAt) this.windows.delete(key);
      if (!window && this.windows.size >= MAX_BUCKETS)
        return this.deny(response, 1);
      window = { resetAt: now + WINDOW_MS, count: 0 };
      this.windows.set(ip, window);
    }
    if (window.count >= this.config.HEALTH_RATE_LIMIT_PER_MINUTE)
      return this.deny(response, Math.ceil((window.resetAt - now) / 1000));
    window.count++;
    if (this.active >= this.config.HEALTH_MAX_CONCURRENT)
      return this.deny(response, 1);
    this.active++;
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      response.off('finish', release);
      response.off('close', release);
      this.active--;
    };
    response.once('finish', release);
    response.once('close', release);
    return true;
  }
  private deny(response: ServerResponse, retryAfter: number): never {
    response.setHeader('Retry-After', String(Math.max(1, retryAfter)));
    throw new HttpException({ code: 'RATE_LIMITED' }, 429);
  }
}
