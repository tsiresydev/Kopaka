export const LIVE_STATUS = 'alive';
export const READINESS_STATUSES = ['ready', 'not_ready'] as const;
export const HTTP_ERROR_CODES = [
  'INVALID_REQUEST',
  'METHOD_NOT_ALLOWED',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
] as const;

export type ReadinessStatus = (typeof READINESS_STATUSES)[number];
export type HttpErrorCode = (typeof HTTP_ERROR_CODES)[number];
export interface LiveResponse {
  status: typeof LIVE_STATUS;
}
export interface ReadyResponse {
  status: ReadinessStatus;
}
export interface ErrorResponse {
  code: HttpErrorCode;
}
