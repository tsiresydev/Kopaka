import type { NestExpressApplication } from '@nestjs/platform-express';
import {
  httpContextMiddleware,
  healthRequestValidation,
  HTTP_BODY_LIMIT_BYTES,
} from './http-validation.middleware.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { TechnicalLogger } from './logger.js';

export function configureHttp(
  app: NestExpressApplication,
  webOrigin: string,
): void {
  const express = app.getHttpAdapter().getInstance();
  express.set('trust proxy', false);
  express.disable('x-powered-by');
  app.use(httpContextMiddleware);
  const logger = app.get(TechnicalLogger);
  app.use(
    (_request: IncomingMessage, response: ServerResponse, next: () => void) => {
      const start = performance.now();
      response.once('finish', () =>
        logger.write('http_request', {
          requestId: response.getHeader('X-Request-Id'),
          durationMs: Math.max(0, performance.now() - start),
          outcome:
            response.statusCode >= 500
              ? 'error'
              : response.statusCode >= 400
                ? 'rejected'
                : 'success',
        }),
      );
      next();
    },
  );
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allowed: boolean) => void,
    ) => callback(null, origin === webOrigin),
    methods: ['GET', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['X-Request-Id'],
    credentials: false,
    preflightContinue: true,
  });
  app.use(healthRequestValidation);
  app.useBodyParser('json', { limit: HTTP_BODY_LIMIT_BYTES });
  app.useBodyParser('urlencoded', {
    limit: HTTP_BODY_LIMIT_BYTES,
    extended: false,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
}
