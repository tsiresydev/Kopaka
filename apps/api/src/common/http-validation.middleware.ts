import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { errorResponseSchema } from '@kopaka/validation';
import { healthQuerySchema, requestIdSchema } from '@kopaka/validation/server';
import type { HttpErrorCode } from '@kopaka/shared-types';

export const HTTP_BODY_LIMIT_BYTES = 16 * 1024;
const BODY_FRAMING_TIMEOUT_MS = 1000;
const ALLOW = 'GET, HEAD, OPTIONS';

export function sendHttpError(
  response: ServerResponse,
  status: number,
  code: HttpErrorCode,
): void {
  if (response.headersSent) {
    response.end();
    return;
  }
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(errorResponseSchema.parse({ code })));
}

export function httpContextMiddleware(
  _request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
): void {
  response.setHeader('X-Request-Id', randomUUID());
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}

export function healthRequestValidation(
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
): void {
  let url: URL;
  try {
    url = new URL(request.url ?? '/', 'http://localhost');
  } catch {
    sendHttpError(response, 400, 'INVALID_REQUEST');
    return;
  }
  if (!/^\/health\/(live|ready)\/?$/.test(url.pathname)) {
    next();
    return;
  }

  const incomingId = request.headers['x-request-id'];
  if (incomingId !== undefined) {
    const parsed = requestIdSchema.safeParse(incomingId);
    if (!parsed.success) {
      sendHttpError(response, 400, 'INVALID_REQUEST');
      return;
    }
    response.setHeader('X-Request-Id', parsed.data);
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method ?? '')) {
    response.setHeader('Allow', ALLOW);
    sendHttpError(response, 405, 'METHOD_NOT_ALLOWED');
    return;
  }
  if (
    !healthQuerySchema.safeParse(Object.fromEntries(url.searchParams)).success
  ) {
    sendHttpError(response, 400, 'INVALID_REQUEST');
    return;
  }
  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.end();
    return;
  }

  const length = Number(request.headers['content-length'] ?? 0);
  if (length > 0) {
    // Fermer après la réponse : ne pas drainer un corps interdit sans borne.
    response.setHeader('Connection', 'close');
    sendHttpError(
      response,
      length > HTTP_BODY_LIMIT_BYTES ? 413 : 400,
      'INVALID_REQUEST',
    );
    return;
  }
  if (!request.headers['transfer-encoding']) {
    next();
    return;
  }

  // Un corps chunked vide reste autorisé. Aucun traitement aval avant sa fin.
  let settled = false;
  const finish = (status?: number) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    request.off('data', onData);
    request.off('end', onEnd);
    request.off('aborted', onAbort);
    request.off('error', onAbort);
    if (status) {
      response.setHeader('Connection', 'close');
      sendHttpError(response, status, 'INVALID_REQUEST');
    } else next();
  };
  const onData = (chunk: Buffer) =>
    finish(chunk.length > HTTP_BODY_LIMIT_BYTES ? 413 : 400);
  const onEnd = () => finish();
  const onAbort = () => finish(400);
  const timer = setTimeout(() => finish(400), BODY_FRAMING_TIMEOUT_MS);
  timer.unref();
  request.on('data', onData);
  request.once('end', onEnd);
  request.once('aborted', onAbort);
  request.once('error', onAbort);
}
