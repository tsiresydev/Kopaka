import { Catch, HttpException } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { ServerResponse } from 'node:http';
import type { HttpErrorCode } from '@kopaka/shared-types';
import { sendHttpError } from './http-validation.middleware.js';

const knownErrors: Readonly<Record<number, HttpErrorCode>> = {
  400: 'INVALID_REQUEST',
  404: 'INVALID_REQUEST',
  405: 'METHOD_NOT_ALLOWED',
  413: 'INVALID_REQUEST',
  429: 'RATE_LIMITED',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const code = knownErrors[status] ?? 'INTERNAL_ERROR';
    // Ni message, ni cause, ni réponse arbitraire de l'exception ne sont diffusés.
    sendHttpError(
      host.switchToHttp().getResponse<ServerResponse>(),
      knownErrors[status] ? status : 500,
      code,
    );
  }
}
