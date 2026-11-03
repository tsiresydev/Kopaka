import { z } from 'zod';
import {
  LIVE_STATUS,
  READINESS_STATUSES,
  HTTP_ERROR_CODES,
} from '@kopaka/shared-types';
import type {
  LiveResponse,
  ReadyResponse,
  ErrorResponse,
} from '@kopaka/shared-types';

export const liveResponseSchema = z.strictObject({
  status: z.literal(LIVE_STATUS),
}) satisfies z.ZodType<LiveResponse>;
export const readyResponseSchema = z.strictObject({
  status: z.enum(READINESS_STATUSES),
}) satisfies z.ZodType<ReadyResponse>;
export const errorResponseSchema = z.strictObject({
  code: z.enum(HTTP_ERROR_CODES),
}) satisfies z.ZodType<ErrorResponse>;
