import {
  type ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import * as Sentry from '@sentry/nestjs';
import { Request, Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const payload = {
      statusCode: 500,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    switch (exception.code) {
      case 'P2025':
        payload.statusCode = HttpStatus.NOT_FOUND;
        payload.message = 'Record not found';
        break;
      case 'P2002':
        payload.statusCode = HttpStatus.CONFLICT;
        payload.message = 'Unique constraint violation';
        break;
      case 'P2003':
        payload.statusCode = HttpStatus.BAD_REQUEST;
        payload.message = 'Foreign key constraint failed';
        break;
      case 'P2007':
        payload.statusCode = HttpStatus.BAD_REQUEST;
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

    response.status(payload.statusCode).json(payload);
  }
}
