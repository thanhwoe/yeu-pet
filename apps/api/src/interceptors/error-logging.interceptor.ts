import { TrackService } from '@app/modules/shared/track/track.service';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorLoggingInterceptor.name);

  constructor(private readonly trackService: TrackService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') return next.handle();

    const request = context.switchToHttp().getRequest<any>();
    const { method, url, body } = request;

    return next.handle().pipe(
      catchError((err) => {
        const status = err instanceof HttpException ? err.getStatus() : 500;

        if (status >= 500) {
          // Unexpected server crash -> full logging & analytics tracking
          this.logger.error(
            `Error in ${method} ${url}`,
            JSON.stringify(
              {
                body,
                error: err.message,
                stack: err.stack,
              },
              null,
              2,
            ),
          );

          const userId = request.user?.id || 'anonymous';
          const errorObject =
            err instanceof Error ? err : new Error(String(err));
          this.trackService.error(errorObject, {
            distinctId: userId,
            properties: {
              path: url,
              method,
              body: typeof body === 'object' ? body : undefined,
            },
          });
        } else {
          // Client-side exceptions (400, 401, 403, 404) -> lightweight warning logging
          this.logger.warn(
            `Client Error ${status} in ${method} ${url} | Message: ${err.message}`,
          );
        }

        return throwError(() => err);
      }),
    );
  }
}
