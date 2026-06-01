import {
  CACHE_EVICT_PATTERNS_KEY,
  HTTP_CACHE_PREFIX,
} from '@app/constants/cache.constants';
import type { accounts } from '@app/generated/prisma/client';
import { ICacheService } from '@app/interfaces/cache.interface';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class HttpCacheEvictInterceptor implements NestInterceptor {
  constructor(
    @Inject(ICacheService)
    private readonly cacheService: ICacheService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request & { user?: accounts }>();

    if (!MUTATION_METHODS.has(request.method)) {
      return next.handle();
    }

    const configuredPatterns =
      this.reflector.getAllAndOverride<string[]>(CACHE_EVICT_PATTERNS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    return next.handle().pipe(
      tap(() => {
        const patterns = this.resolvePatterns(request, configuredPatterns);
        void Promise.all(
          patterns.map((pattern) =>
            this.cacheService.delByPattern(pattern).catch(() => undefined),
          ),
        );
      }),
    );
  }

  private resolvePatterns(
    request: Request & { user?: accounts },
    configuredPatterns: string[],
  ): string[] {
    const userId = request.user?.id;

    if (!configuredPatterns.length) {
      if (!userId) return [`${HTTP_CACHE_PREFIX}:public:*`];
      return [`${HTTP_CACHE_PREFIX}:user:${userId}:*`];
    }

    return configuredPatterns.map((pattern) =>
      pattern.replaceAll('{userId}', userId ?? 'public'),
    );
  }
}
