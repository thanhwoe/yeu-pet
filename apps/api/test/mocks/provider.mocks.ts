import { PrismaService } from '@app/database/prisma/prisma.service';
import { ICacheService } from '@app/interfaces/cache.interface';
import { IEventBusService } from '@app/interfaces/event-bus.interface';
import { TrackService } from '@app/modules/shared/track/track.service';
import { ConfigService } from '@nestjs/config';

export interface MockProvider<T> {
  provide: unknown;
  useValue: T;
}

export const createMockConfigService = (
  values: Record<string, string | undefined> = {},
): Pick<ConfigService, 'get'> => ({
  get: jest.fn((key: string) => values[key]),
});

export const createMockCacheService = (): ICacheService => ({
  get: <T>(): Promise<T | null> => Promise.resolve(null),
  set: (): Promise<void> => Promise.resolve(undefined),
  del: (): Promise<void> => Promise.resolve(undefined),
  delByPattern: (): Promise<void> => Promise.resolve(undefined),
  wrap: <T>(...args: [string, number, () => Promise<T>]): Promise<T> =>
    args[2](),
});

export const createMockEventBusService = (): IEventBusService => ({
  publish: (): Promise<void> => Promise.resolve(undefined),
  subscribe: (): Promise<() => Promise<void>> =>
    Promise.resolve(() => Promise.resolve(undefined)),
});

export const createMockTrackService = (): jest.Mocked<
  Pick<TrackService, 'capture' | 'error' | 'onModuleDestroy'>
> => ({
  capture: jest.fn(),
  error: jest.fn(),
  onModuleDestroy: jest.fn(() => Promise.resolve(undefined)),
});

export const createMockPrismaService = (): Record<string, unknown> => ({
  $connect: jest.fn(() => Promise.resolve(undefined)),
  $disconnect: jest.fn(() => Promise.resolve(undefined)),
  $queryRaw: jest.fn(() => Promise.resolve([])),
  $executeRaw: jest.fn(() => Promise.resolve(0)),
  $transaction: jest.fn((operation: unknown) => {
    if (typeof operation === 'function') {
      return (operation as (tx: Record<string, unknown>) => Promise<unknown>)(
        {},
      );
    }

    if (Array.isArray(operation)) {
      return Promise.all(operation);
    }

    return Promise.resolve(operation);
  }),
});

export const mockConfigProvider = (
  values?: Record<string, string | undefined>,
): MockProvider<Pick<ConfigService, 'get'>> => ({
  provide: ConfigService,
  useValue: createMockConfigService(values),
});

export const mockCacheProvider = (): MockProvider<ICacheService> => ({
  provide: ICacheService,
  useValue: createMockCacheService(),
});

export const mockEventBusProvider = (): MockProvider<IEventBusService> => ({
  provide: IEventBusService,
  useValue: createMockEventBusService(),
});

export const mockTrackProvider = (): MockProvider<
  jest.Mocked<Pick<TrackService, 'capture' | 'error' | 'onModuleDestroy'>>
> => ({
  provide: TrackService,
  useValue: createMockTrackService(),
});

export const mockPrismaProvider = (): MockProvider<
  Record<string, unknown>
> => ({
  provide: PrismaService,
  useValue: createMockPrismaService(),
});
