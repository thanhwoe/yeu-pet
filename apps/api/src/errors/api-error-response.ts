import { HttpStatus } from '@nestjs/common';
import type { TranslationParams } from '@app/modules/shared/localization/localization.types';
import { API_ERROR_CODES } from './api-error-codes';

export type ApiErrorParams = TranslationParams;

export type ApiErrorMetadata = {
  errorCode: string;
  messageKey: string;
  params?: ApiErrorParams;
};

export type ApiErrorResponse = ApiErrorMetadata & {
  statusCode: number;
  message: string | string[];
  path?: string;
  timestamp?: string;
  errors?: unknown;
};

export const DEFAULT_ERROR_METADATA: Record<number, ApiErrorMetadata> = {
  [HttpStatus.BAD_REQUEST]: {
    errorCode: API_ERROR_CODES.BAD_REQUEST,
    messageKey: 'errors.common.badRequest',
  },
  [HttpStatus.UNAUTHORIZED]: {
    errorCode: API_ERROR_CODES.UNAUTHORIZED,
    messageKey: 'errors.common.unauthorized',
  },
  [HttpStatus.FORBIDDEN]: {
    errorCode: API_ERROR_CODES.FORBIDDEN,
    messageKey: 'errors.common.forbidden',
  },
  [HttpStatus.NOT_FOUND]: {
    errorCode: API_ERROR_CODES.NOT_FOUND,
    messageKey: 'errors.common.notFound',
  },
  [HttpStatus.CONFLICT]: {
    errorCode: API_ERROR_CODES.CONFLICT,
    messageKey: 'errors.common.conflict',
  },
  [HttpStatus.TOO_MANY_REQUESTS]: {
    errorCode: API_ERROR_CODES.TOO_MANY_REQUESTS,
    messageKey: 'errors.common.tooManyRequests',
  },
  [HttpStatus.INTERNAL_SERVER_ERROR]: {
    errorCode: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    messageKey: 'errors.common.internalServerError',
  },
};

export function getDefaultErrorMetadata(status: number): ApiErrorMetadata {
  return (
    DEFAULT_ERROR_METADATA[status] ??
    DEFAULT_ERROR_METADATA[HttpStatus.INTERNAL_SERVER_ERROR]
  );
}
