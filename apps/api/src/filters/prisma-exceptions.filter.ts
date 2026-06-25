import {
  type ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { API_ERROR_CODES } from '@app/errors/api-error-codes';
import { LocalizationService } from '@app/modules/shared/localization/localization.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import * as Sentry from '@sentry/nestjs';
import { Request, Response } from 'express';

type RequestWithUser = Request & { user?: { id?: string } };

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  constructor(private readonly localizationService: LocalizationService) {}

  async catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUser>();

    const payload: {
      statusCode: number;
      errorCode: string;
      messageKey: string;
      message: string;
      timestamp: string;
      path: string;
    } = {
      statusCode: 500,
      errorCode: API_ERROR_CODES.INTERNAL_SERVER_ERROR,
      messageKey: 'errors.common.internalServerError',
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    switch (exception.code) {
      case 'P2025':
        payload.statusCode = HttpStatus.NOT_FOUND;
        payload.errorCode = API_ERROR_CODES.PRISMA_RECORD_NOT_FOUND;
        payload.messageKey = 'errors.common.recordNotFound';
        payload.message = 'Record not found';
        break;
      case 'P2002':
        payload.statusCode = HttpStatus.CONFLICT;
        payload.errorCode = API_ERROR_CODES.PRISMA_UNIQUE_CONSTRAINT;
        payload.messageKey = 'errors.common.uniqueConstraint';
        payload.message = 'Unique constraint violation';
        break;
      case 'P2003':
        payload.statusCode = HttpStatus.BAD_REQUEST;
        payload.errorCode = API_ERROR_CODES.PRISMA_FOREIGN_KEY_CONSTRAINT;
        payload.messageKey = 'errors.common.foreignKeyConstraint';
        payload.message = 'Foreign key constraint failed';
        break;
      case 'P2007':
        payload.statusCode = HttpStatus.BAD_REQUEST;
        payload.errorCode = API_ERROR_CODES.PRISMA_DATA_VALIDATION;
        payload.messageKey = 'errors.common.dataValidation';
        payload.message = 'Data validation error';
        break;
      default:
        // System level database errors (lost connections, etc.) -> Capture in Sentry
        Sentry.captureException(exception);
        break;
    }

    if (payload.statusCode < 500) {
      this.logger.warn(
        `Prisma Client Warning [${exception.code}]: ${payload.message} | Path: ${request.url}`,
      );
    } else {
      this.logger.error(
        `Prisma Client Exception [${exception.code}]: ${exception.message} | Path: ${request.url}`,
        exception.stack,
      );
    }

    const language = await this.localizationService.resolveLanguage({
      accountId: request.user?.id,
      acceptLanguage: request.headers['accept-language'],
    });
    const localizedMessage = this.localizationService.translate(
      payload.messageKey,
      language,
    );

    response.status(payload.statusCode).json({
      ...payload,
      message:
        localizedMessage === payload.messageKey
          ? payload.message
          : localizedMessage,
    });
  }
}
