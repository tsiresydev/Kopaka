import { Global, Module } from '@nestjs/common';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { parseConfig } from './config.schema.js';
export const API_CONFIG = Symbol('API_CONFIG');
@Global()
@Module({
  providers: [
    {
      provide: API_CONFIG,
      useFactory: () => {
        config({
          path: fileURLToPath(new URL('../../.env', import.meta.url)),
          quiet: true,
        });
        return parseConfig(process.env);
      },
    },
  ],
  exports: [API_CONFIG],
})
export class ConfigModule {}
