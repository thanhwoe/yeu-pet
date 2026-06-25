import {
  type ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  getDefaultErrorMetadata,
  type ApiErrorMetadata,
} from '@app/errors/api-error-response';
import { API_ERROR_CODES } from '@app/errors/api-error-codes';
import { LocalizationService } from '@app/modules/shared/localization/localization.service';
import type { TranslationParams } from '@app/modules/shared/localization/localization.types';
import * as Sentry from '@sentry/nestjs';
import { Request, Response } from 'express';

type RequestWithUser = Request & { user?: { id?: string } };

type ExceptionResponseObject = Record<string, unknown> & {
  message?: string | string[];
  errorCode?: string;
  messageKey?: string;
  params?: TranslationParams;
  errors?: unknown;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly localizationService: LocalizationService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUser>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const exceptionPayload = this.toExceptionPayload(exceptionResponse);
    const metadata = this.toErrorMetadata(status, exceptionPayload);
    const language = await this.localizationService.resolveLanguage({
      accountId: request.user?.id,
      acceptLanguage: request.headers['accept-language'],
    });
    const fallbackMessage = this.toFallbackMessage(exceptionResponse, status);
    const localizedMessage = this.localizationService.translate(
      metadata.messageKey,
      language,
      metadata.params,
    );

    // Unexpected server crash (status >= 500) -> capture to Sentry
    // Client-side exceptions (400, 401, 403, 404) -> lightweight logging warning, ignore in Sentry
    if (status >= 500) {
      Sentry.captureException(exception);
    } else {
      this.logger.warn(
        `Client Exception: ${status} | Path: ${request.url} | Message: ${JSON.stringify(exceptionResponse)}`,
      );
    }

    const body = {
      statusCode: status,
      errorCode: metadata.errorCode,
      messageKey: metadata.messageKey,
      message:
        localizedMessage === metadata.messageKey
          ? fallbackMessage
          : localizedMessage,
      ...(metadata.params ? { params: metadata.params } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exceptionPayload?.errors) {
      response.status(status).json({
        ...body,
        errors: exceptionPayload.errors,
      });
    } else {
      response.status(status).json(body);
    }
  }

  private toExceptionPayload(
    exceptionResponse: string | object | null,
  ): ExceptionResponseObject | null {
    if (typeof exceptionResponse !== 'object' || exceptionResponse === null) {
      return null;
    }

    return exceptionResponse as ExceptionResponseObject;
  }

  private toErrorMetadata(
    status: number,
    payload: ExceptionResponseObject | null,
  ): ApiErrorMetadata {
    const fallback = getDefaultErrorMetadata(status);

    if (payload?.message === 'Validation failed' || payload?.errors) {
      return {
        errorCode: payload.errorCode ?? API_ERROR_CODES.VALIDATION_FAILED,
        messageKey: payload.messageKey ?? 'errors.common.validationFailed',
        params: payload.params,
      };
    }

    return {
      errorCode: payload?.errorCode ?? fallback.errorCode,
      messageKey: payload?.messageKey ?? fallback.messageKey,
      params: payload?.params ?? fallback.params,
    };
  }

  private toFallbackMessage(
    exceptionResponse: string | object | null,
    status: number,
  ): string | string[] {
    if (typeof exceptionResponse === 'string') return exceptionResponse;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const message = (exceptionResponse as ExceptionResponseObject).message;
      if (message) return message;
    }

    return status >= 500 ? 'Internal server error' : 'Request failed';
  }
}
