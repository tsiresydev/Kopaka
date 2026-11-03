import 'reflect-metadata';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { createServer, request as httpRequest } from 'node:http';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import request from 'supertest';
import { BadRequestException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module.js';
import { API_CONFIG } from '../config/config.module.js';
import { parseConfig } from '../config/config.schema.js';
import {
  healthRequestValidation,
  httpContextMiddleware,
  HTTP_BODY_LIMIT_BYTES,
} from './http-validation.middleware.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { configureHttp } from './configure-http.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const validId = 'f912abc0-414a-4b11-80fd-42721450e345';

describe('health request validation before any downstream work', () => {
  let server: Server;
  let failure: unknown;
  const next = jest.fn();
  beforeEach(async () => {
    next.mockClear();
    failure = undefined;
    server = createServer((req, res) => {
      httpContextMiddleware(req, res, () =>
        healthRequestValidation(req, res, () => {
          next();
          if (failure) {
            const host = {
              switchToHttp: () => ({ getResponse: () => res }),
            } as unknown as ArgumentsHost;
            new HttpExceptionFilter().catch(failure, host);
          } else {
            res.statusCode = 204;
            res.end();
          }
        }),
      );
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
  });
  afterEach(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });
  it.each(['/health/live', '/health/ready', '/health/live/'])(
    'accepts valid request %s without body mutation',
    async (path) => {
      const response = await request(server)
        .get(path)
        .set('X-Request-Id', validId)
        .expect(204);
      expect(response.headers['x-request-id']).toBe(validId);
      expect(response.headers['cache-control']).toBe('no-store');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['set-cookie']).toBeUndefined();
      expect(next).toHaveBeenCalledTimes(1);
    },
  );
  it('generates a safe UUID when absent', async () => {
    const response = await request(server).get('/health/live').expect(204);
    expect(response.headers['x-request-id']).toMatch(uuid);
  });
  it.each([
    '/health/live?unexpected=1',
    '/health/ready?unexpected=',
    '/health/live?__proto__=x',
  ])('rejects unknown query before downstream: %s', async (path) => {
    const response = await request(server).get(path).expect(400);
    expect(response.body).toEqual({ code: 'INVALID_REQUEST' });
    expect(next).not.toHaveBeenCalled();
  });
  it('rejects invalid header without echoing its value', async () => {
    const response = await request(server)
      .get('/health/ready')
      .set('X-Request-Id', 'private-driver-detail')
      .expect(400);
    expect(response.body).toEqual({ code: 'INVALID_REQUEST' });
    expect(response.headers['x-request-id']).toMatch(uuid);
    expect(response.text).not.toContain('private-driver-detail');
    expect(next).not.toHaveBeenCalled();
  });
  it('rejects repeated request id headers before downstream', async () => {
    await request(server)
      .get('/health/live')
      .set('X-Request-Id', validId + ', ' + validId)
      .expect(400);
    expect(next).not.toHaveBeenCalled();
  });
  it('rejects an unfinished chunked request within the framing deadline', async () => {
    const address = server.address() as AddressInfo;
    const status = await new Promise<number>((resolve, reject) => {
      const req = httpRequest(
        {
          host: '127.0.0.1',
          port: address.port,
          path: '/health/live',
          method: 'GET',
          headers: { 'Transfer-Encoding': 'chunked' },
        },
        (res) => {
          res.resume();
          res.on('end', () => {
            resolve(res.statusCode ?? 0);
            req.destroy();
          });
        },
      );
      req.on('error', reject);
      req.flushHeaders();
    });
    expect(status).toBe(400);
    expect(next).not.toHaveBeenCalled();
  }, 4000);
  it('rejects a nonempty GET body before downstream', async () => {
    await request(server)
      .get('/health/live')
      .send('x')
      .expect(400, { code: 'INVALID_REQUEST' });
    expect(next).not.toHaveBeenCalled();
  });
  it('rejects HEAD body and returns no response body', async () => {
    const response = await request(server)
      .head('/health/ready')
      .set('Content-Length', '1')
      .expect(400);
    expect(response.text).toBeUndefined();
    expect(next).not.toHaveBeenCalled();
  });
  it('rejects oversized declared body with a generic 413', async () => {
    await request(server)
      .get('/health/live')
      .set('Content-Length', String(HTTP_BODY_LIMIT_BYTES + 1))
      .expect(413, { code: 'INVALID_REQUEST' });
    expect(next).not.toHaveBeenCalled();
  });
  it.each(['POST', 'PUT', 'DELETE'])(
    'rejects %s with Allow before downstream',
    async (method) => {
      const agent = request(server);
      const pending =
        agent[method.toLowerCase() as 'post' | 'put' | 'delete'](
          '/health/ready',
        );
      const response = await pending.expect(405);
      expect(response.headers.allow).toBe('GET, HEAD, OPTIONS');
      expect(response.body).toEqual({ code: 'METHOD_NOT_ALLOWED' });
      expect(next).not.toHaveBeenCalled();
    },
  );
  it.each(['', 'x'])(
    'handles chunked GET framing without bypass: body=%s',
    async (body) => {
      const address = server.address() as AddressInfo;
      const result = await new Promise<{ status: number; text: string }>(
        (resolve, reject) => {
          const req = httpRequest(
            {
              host: '127.0.0.1',
              port: address.port,
              path: '/health/live',
              method: 'GET',
              headers: { 'Transfer-Encoding': 'chunked' },
            },
            (res) => {
              let text = '';
              res.on('data', (chunk) => {
                text += String(chunk);
              });
              res.on('end', () =>
                resolve({ status: res.statusCode ?? 0, text }),
              );
            },
          );
          req.on('error', reject);
          if (body) req.write(body);
          req.end();
        },
      );
      expect(result.status).toBe(body ? 400 : 204);
      expect(next).toHaveBeenCalledTimes(body ? 0 : 1);
    },
  );
  it.each([
    new Error('postgresql://private:secret@host/db'),
    new BadRequestException({ stack: 'private', message: 'secret' }),
  ])('filters exceptions without driver detail %#', async (exception) => {
    failure = exception;
    const response = await request(server)
      .get('/health/live')
      .expect(exception instanceof BadRequestException ? 400 : 500);
    expect(response.body).toEqual({
      code:
        exception instanceof BadRequestException
          ? 'INVALID_REQUEST'
          : 'INTERNAL_ERROR',
    });
    expect(response.text).not.toMatch(/secret|private|stack|postgresql/);
  });
});

describe('Nest HTTP configuration with health controllers', () => {
  let app: NestExpressApplication;
  beforeAll(async () => {
    const config = parseConfig({
      DATABASE_URL: 'postgresql://fixture:local@127.0.0.1:1/kopaka',
      REDIS_URL: 'redis://127.0.0.1:1',
      WEB_ORIGIN: 'http://localhost:3000',
    });
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(API_CONFIG)
      .useValue(config)
      .compile();
    app = module.createNestApplication<NestExpressApplication>({
      logger: false,
      bodyParser: false,
    });
    configureHttp(app, config.WEB_ORIGIN);
    await app.init();
  });
  afterAll(async () => {
    await app?.close();
  });
  it('rejects malformed health request with CORS, generic response and safe headers', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/health/ready?unknown=1')
      .set('Origin', 'http://localhost:3000')
      .expect(400);
    expect(response.body).toEqual({ code: 'INVALID_REQUEST' });
    expect(response.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000',
    );
    expect(
      response.headers['access-control-allow-credentials'],
    ).toBeUndefined();
    expect(response.headers['cache-control']).toBe('no-store');
  });
  it('does not grant a different origin permission', async () => {
    const response = await request(app.getHttpServer() as Server)
      .get('/health/live?x=1')
      .set('Origin', 'http://localhost:3000.evil')
      .expect(400);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
  it('advertises only contracted methods/header on preflight', async () => {
    const response = await request(app.getHttpServer() as Server)
      .options('/health/live')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'X-Request-Id')
      .expect(204);
    expect(response.headers['access-control-allow-methods']).toBe(
      'GET,HEAD,OPTIONS',
    );
    expect(response.headers['access-control-allow-headers']).toBe(
      'X-Request-Id',
    );
    expect(
      response.headers['access-control-allow-credentials'],
    ).toBeUndefined();
  });
  it('validates preflight query before responding', async () => {
    const response = await request(app.getHttpServer() as Server)
      .options('/health/live?unknown=1')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET')
      .expect(400);
    expect(response.body).toEqual({ code: 'INVALID_REQUEST' });
  });
  it('returns a generic 413 for the configured parser limit without adding any POST endpoint', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/')
      .send({ private: 'x'.repeat(HTTP_BODY_LIMIT_BYTES + 1) })
      .expect(413);
    expect(response.body).toEqual({ code: 'INVALID_REQUEST' });
  });
  it('keeps trust proxy disabled and serves liveness independently', async () => {
    expect(app.getHttpAdapter().getInstance().get('trust proxy')).toBe(false);
    await request(app.getHttpServer() as Server)
      .get('/health/live')
      .expect(200, { status: 'alive' });
  });
});
