import { describe, expect, it } from 'vitest';
import {
  liveResponseSchema,
  readyResponseSchema,
  errorResponseSchema,
} from './health.js';
import { healthQuerySchema, requestIdSchema } from './server.js';

describe('shared health contracts', () => {
  it.each(['alive'])('accepts liveness %s', (status) => {
    expect(liveResponseSchema.parse({ status })).toEqual({ status });
  });
  it.each(['ready', 'not_ready'])('accepts readiness %s', (status) => {
    expect(readyResponseSchema.parse({ status })).toEqual({ status });
  });
  it.each([
    'INVALID_REQUEST',
    'METHOD_NOT_ALLOWED',
    'RATE_LIMITED',
    'INTERNAL_ERROR',
  ])('accepts error %s', (code) => {
    expect(errorResponseSchema.parse({ code })).toEqual({ code });
  });
  it.each([
    null,
    [],
    {},
    { status: 'up' },
    { status: 'alive', hostname: 'private' },
  ])('rejects invalid liveness %#', (input) => {
    expect(liveResponseSchema.safeParse(input).success).toBe(false);
  });
  it.each([null, {}, { status: 'alive' }, { status: 'ready', postgres: 'up' }])(
    'rejects invalid readiness %#',
    (input) => {
      expect(readyResponseSchema.safeParse(input).success).toBe(false);
    },
  );
  it.each([
    {},
    { code: 'UNKNOWN' },
    { code: 'INTERNAL_ERROR', message: 'private' },
    { code: 400 },
  ])('rejects invalid errors %#', (input) => {
    expect(errorResponseSchema.safeParse(input).success).toBe(false);
  });
  it('accepts no query and rejects every additional property', () => {
    expect(healthQuerySchema.parse({})).toEqual({});
    expect(healthQuerySchema.safeParse({ unexpected: '' }).success).toBe(false);
  });
  it('validates canonical 36-character UUID and normalizes hexadecimal case', () => {
    const id = 'f912abc0-414a-4b11-80fd-42721450e345';
    expect(requestIdSchema.parse(id)).toBe(id);
    expect(requestIdSchema.parse(id.toUpperCase())).toBe(id);
  });
  it.each([
    '',
    'secret',
    'f912abc0414a4b1180fd42721450e345',
    'f912abc0-414a-4b11-80fd-42721450e345\n',
    ['f912abc0-414a-4b11-80fd-42721450e345'],
  ])('rejects malformed UUID %#', (input) => {
    expect(requestIdSchema.safeParse(input).success).toBe(false);
  });
});
