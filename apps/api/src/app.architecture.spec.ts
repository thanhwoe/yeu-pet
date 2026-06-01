import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { ROLES_KEY } from './decorators/roles.decorator';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { PrismaExceptionFilter } from './filters/prisma-exceptions.filter';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CustomThrottlerGuard } from './guards/throttler.guard';
import { ErrorLoggingInterceptor } from './interceptors/error-logging.interceptor';
import { HttpCacheInterceptor } from './interceptors/http-cache.interceptor';
import { TrackInterceptor } from './interceptors/track.interceptor';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AuthController } from './modules/auth/auth.controller';

interface ProviderRegistration {
  provide?: unknown;
  useClass?: unknown;
}

const getProviders = (): ProviderRegistration[] =>
  Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AppModule) as
    | ProviderRegistration[]
    | [];

const getHandler = (controller: object, name: string): (() => void) =>
  Object.getOwnPropertyDescriptor(controller, name)?.value as () => void;

describe('App architecture wiring', () => {
  it('registers global filters through Nest DI in the expected order', () => {
    const filters = getProviders()
      .filter((provider) => provider.provide === APP_FILTER)
      .map((provider) => provider.useClass);

    expect(filters).toEqual([
      SentryGlobalFilter,
      AllExceptionsFilter,
      PrismaExceptionFilter,
    ]);
  });

  it('registers auth, role, and throttling guards globally', () => {
    const guards = getProviders()
      .filter((provider) => provider.provide === APP_GUARD)
      .map((provider) => provider.useClass);

    expect(guards).toEqual([JwtAuthGuard, RolesGuard, CustomThrottlerGuard]);
  });

  it('keeps HTTP caching opt-in rather than a global interceptor', () => {
    const interceptors = getProviders()
      .filter((provider) => provider.provide === APP_INTERCEPTOR)
      .map((provider) => provider.useClass);

    expect(interceptors).toEqual([ErrorLoggingInterceptor, TrackInterceptor]);
    expect(interceptors).not.toContain(HttpCacheInterceptor);
  });

  it('keeps public and role decorators aligned with their global guards', () => {
    expect(
      Reflect.getMetadata(
        IS_PUBLIC_KEY,
        getHandler(AppController.prototype, 'getHello'),
      ),
    ).toBe(true);

    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        getHandler(AuthController.prototype, 'healthCheck'),
      ),
    ).toEqual(['admin']);
  });
});
