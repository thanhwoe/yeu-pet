import { CACHE_EVICT_PATTERNS_KEY } from '@app/constants/cache.constants';
import type { ICacheService } from '@app/interfaces/cache.interface';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of, throwError } from 'rxjs';
import { HttpCacheEvictInterceptor } from './http-cache-evict.interceptor';

const createContext = (
  request: Record<string, unknown>,
  handler = jest.fn(),
): ExecutionContext =>
  ({
    getHandler: () => handler,
    getClass: () => class TestController {},
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as unknown as ExecutionContext;

describe('HttpCacheEvictInterceptor', () => {
  let cacheService: jest.Mocked<ICacheService>;
  let interceptor: HttpCacheEvictInterceptor;

  beforeEach(() => {
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      delByPattern: jest.fn().mockResolvedValue(undefined),
      wrap: jest.fn(),
    };
    interceptor = new HttpCacheEvictInterceptor(cacheService, new Reflector());
  });

  it('evicts user-scoped HTTP cache entries after a successful mutation', async () => {
    const next: CallHandler = { handle: jest.fn(() => of({ ok: true })) };
    const context = createContext({
      method: 'PATCH',
      url: '/pets/pet-1',
      user: { id: 'user-1' },
    });

    await lastValueFrom(interceptor.intercept(context, next));
    await Promise.resolve();

    expect(cacheService.delByPattern.mock.calls).toEqual([
      ['http_cache:user:user-1:*'],
    ]);
  });

  it('expands configured eviction patterns', async () => {
    const handler = jest.fn();
    Reflect.defineMetadata(
      CACHE_EVICT_PATTERNS_KEY,
      ['http_cache:user:{userId}:/budgets*'],
      handler,
    );
    const next: CallHandler = { handle: jest.fn(() => of({ ok: true })) };
    const context = createContext(
      {
        method: 'POST',
        url: '/budgets/transactions',
        user: { id: 'user-1' },
      },
      handler,
    );

    await lastValueFrom(interceptor.intercept(context, next));
    await Promise.resolve();

    expect(cacheService.delByPattern.mock.calls).toEqual([
      ['http_cache:user:user-1:/budgets*'],
    ]);
  });

  it('does not evict cache when the mutation fails', async () => {
    const next: CallHandler = {
      handle: jest.fn(() => throwError(() => new Error('failed'))),
    };
    const context = createContext({
      method: 'DELETE',
      url: '/pets/pet-1',
      user: { id: 'user-1' },
    });

    await expect(
      lastValueFrom(interceptor.intercept(context, next)),
    ).rejects.toThrow('failed');

    expect(cacheService.delByPattern.mock.calls).toHaveLength(0);
  });
});
