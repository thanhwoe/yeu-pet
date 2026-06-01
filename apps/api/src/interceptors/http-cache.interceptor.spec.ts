import {
  CACHEABLE_KEY,
  CACHE_TTL_KEY,
  IGNORE_CACHE_KEY,
} from '@app/constants/cache.constants';
import type { ICacheService } from '@app/interfaces/cache.interface';
import { Reflector } from '@nestjs/core';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { HttpCacheInterceptor } from './http-cache.interceptor';

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

describe('HttpCacheInterceptor', () => {
  let cacheService: jest.Mocked<ICacheService>;
  let reflector: Reflector;
  let interceptor: HttpCacheInterceptor;

  beforeEach(() => {
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      delByPattern: jest.fn(),
      wrap: jest.fn(),
    };
    reflector = new Reflector();
    interceptor = new HttpCacheInterceptor(cacheService, reflector);
  });

  it('passes through undecorated routes', async () => {
    const handle = jest.fn(() => of({ ok: true }));
    const next: CallHandler = { handle };
    const context = createContext({ method: 'GET', url: '/pets' });

    await lastValueFrom(await interceptor.intercept(context, next));

    expect(cacheService.get.mock.calls).toHaveLength(0);
    expect(handle).toHaveBeenCalled();
  });

  it('returns cached data for cacheable GET routes', async () => {
    const handler = jest.fn();
    Reflect.defineMetadata(CACHEABLE_KEY, true, handler);
    cacheService.get.mockResolvedValue({ cached: true });
    const handle = jest.fn(() => of({ fresh: true }));
    const next: CallHandler = { handle };
    const context = createContext(
      {
        method: 'GET',
        url: '/pets',
        originalUrl: '/pets?page=1',
        user: { id: 'user-1' },
      },
      handler,
    );

    const response = await lastValueFrom(
      await interceptor.intercept(context, next),
    );

    expect(response).toEqual({ cached: true });
    expect(cacheService.get.mock.calls).toEqual([
      ['http_cache:user:user-1:/pets?page=1'],
    ]);
    expect(handle).not.toHaveBeenCalled();
  });

  it('stores successful cacheable GET responses with the configured TTL', async () => {
    const handler = jest.fn();
    Reflect.defineMetadata(CACHEABLE_KEY, true, handler);
    Reflect.defineMetadata(CACHE_TTL_KEY, 120, handler);
    cacheService.get.mockResolvedValue(null);
    cacheService.set.mockResolvedValue(undefined);
    const next: CallHandler = { handle: jest.fn(() => of({ fresh: true })) };
    const context = createContext(
      {
        method: 'GET',
        url: '/budgets',
        originalUrl: '/budgets?month=6&year=2026',
        user: { id: 'user-1' },
      },
      handler,
    );

    await lastValueFrom(await interceptor.intercept(context, next));

    expect(cacheService.set.mock.calls).toEqual([
      [
        'http_cache:user:user-1:/budgets?month=6&year=2026',
        { fresh: true },
        120,
      ],
    ]);
  });

  it('honors IgnoreCache metadata even when a route is cacheable', async () => {
    const handler = jest.fn();
    Reflect.defineMetadata(CACHEABLE_KEY, true, handler);
    Reflect.defineMetadata(IGNORE_CACHE_KEY, true, handler);
    const handle = jest.fn(() => of({ fresh: true }));
    const next: CallHandler = { handle };
    const context = createContext({ method: 'GET', url: '/pets' }, handler);

    await lastValueFrom(await interceptor.intercept(context, next));

    expect(cacheService.get.mock.calls).toHaveLength(0);
    expect(handle).toHaveBeenCalled();
  });
});
