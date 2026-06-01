import {
  CACHEABLE_KEY,
  CACHE_TTL_KEY,
  HTTP_CACHE_PREFIX,
  IGNORE_CACHE_KEY,
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
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(ICacheService)
    private readonly cacheService: ICacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const isIgnored = this.reflector.getAllAndOverride<boolean>(
      IGNORE_CACHE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isIgnored) {
      return next.handle();
    }

    const isCacheable = this.reflector.getAllAndOverride<boolean>(
      CACHEABLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isCacheable) {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request & { user: accounts }>();

    if (request.method !== 'GET') {
      return next.handle();
    }

    const ttl = this.reflector.getAllAndOverride<number>(CACHE_TTL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const cacheTtl = ttl !== undefined ? ttl : 60;
    const user = request.user;
    const scope = user?.id ? `user:${user.id}` : 'public';
    const key = `${HTTP_CACHE_PREFIX}:${scope}:${request.originalUrl ?? request.url}`;

    try {
      const cachedResponse = await this.cacheService.get(key);
      if (cachedResponse !== null) {
        return of(cachedResponse);
      }
    } catch {
      // In case Redis fails, proceed normally
    }

    return next.handle().pipe(
      tap((response) => {
        this.cacheService.set(key, response, cacheTtl).catch(() => {});
      }),
    );
  }
}
