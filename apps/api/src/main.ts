import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { API_CONFIG } from './config/config.module.js';
import type { ApiConfig } from './config/config.schema.js';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { configureHttp } from './common/configure-http.js';
try {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
    abortOnError: false,
    bodyParser: false,
  });
  configureHttp(app, app.get<ApiConfig>(API_CONFIG).WEB_ORIGIN);
  app.enableShutdownHooks();
  await app.listen(app.get<ApiConfig>(API_CONFIG).API_PORT, '127.0.0.1');
} catch (error) {
  const message =
    error instanceof Error &&
    /^Configuration invalide: [A-Z_, 0-9]+$/.test(error.message)
      ? error.message
      : 'D?marrage impossible';
  process.stderr.write(message + '\n');
  process.exitCode = 1;
}
