import {
  CACHEABLE_KEY,
  CACHE_EVICT_PATTERNS_KEY,
  CACHE_TTL_KEY,
  IGNORE_CACHE_KEY,
} from '@app/constants/cache.constants';
import { HttpCacheEvictInterceptor } from '@app/interceptors/http-cache-evict.interceptor';
import { HttpCacheInterceptor } from '@app/interceptors/http-cache.interceptor';
import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';

/**
 * Opt a GET endpoint into HTTP response caching.
 * @param ttlSeconds Time to live in seconds. Defaults to the interceptor TTL.
 */
export const Cacheable = (ttlSeconds?: number) =>
  applyDecorators(
    SetMetadata(CACHEABLE_KEY, true),
    ...(ttlSeconds !== undefined
      ? [SetMetadata(CACHE_TTL_KEY, ttlSeconds)]
      : []),
    UseInterceptors(HttpCacheInterceptor),
  );

/**
 * Define the TTL (in seconds) for caching the endpoint response.
 * @param ttlSeconds Time to live in seconds
 */
export const CacheTTL = (ttlSeconds: number) =>
  SetMetadata(CACHE_TTL_KEY, ttlSeconds);

/**
 * Ignore caching for the endpoint.
 */
export const IgnoreCache = () => SetMetadata(IGNORE_CACHE_KEY, true);

/**
 * Evict HTTP cache entries after a successful mutation.
 *
 * Patterns support the `{userId}` token. If no pattern is provided, all
 * user-scoped HTTP cache entries for the current user are evicted.
 */
export const CacheEvict = (...patterns: string[]) =>
  applyDecorators(
    SetMetadata(CACHE_EVICT_PATTERNS_KEY, patterns),
    UseInterceptors(HttpCacheEvictInterceptor),
  );
