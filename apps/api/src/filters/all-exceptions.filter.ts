import {
  type ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

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
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    const isValidationError =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'errors' in exceptionResponse;

    if (isValidationError) {
      response.status(status).json({
        ...body,
        message: (exceptionResponse as unknown as Error).message,
        errors: exceptionResponse.errors,
      });
    } else {
      response.status(status).json({
        ...body,
        message:
          typeof exceptionResponse === 'object' && exceptionResponse !== null
            ? (exceptionResponse as Error).message
            : (exceptionResponse ?? 'Internal server error'),
      });
    }
  }
}
