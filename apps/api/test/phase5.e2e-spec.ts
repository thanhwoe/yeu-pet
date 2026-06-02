import { CacheEvict, Cacheable } from '@app/decorators/cache.decorator';
import { ICacheService } from '@app/interfaces/cache.interface';
import { IEventBusService } from '@app/interfaces/event-bus.interface';
import { IPetSittersRepository } from '@app/interfaces/pet-sitters-repository.interface';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { ISitterBookingsRepository } from '@app/interfaces/sitter-bookings-repository.interface';
import { HttpCacheEvictInterceptor } from '@app/interceptors/http-cache-evict.interceptor';
import { HttpCacheInterceptor } from '@app/interceptors/http-cache.interceptor';
import { SitterBookingsController } from '@app/modules/sitter-booking/bookings/sitter-bookings.controller';
import { SitterBookingsService } from '@app/modules/sitter-booking/bookings/sitter-bookings.service';
import { SubscriptionController } from '@app/modules/subscription/subscription.controller';
import { SubscriptionRepository } from '@app/modules/subscription/subscription.repository';
import { SubscriptionService } from '@app/modules/subscription/subscription.service';
import {
  Body,
  Controller,
  Get,
  INestApplication,
  ModuleMetadata,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { Decimal } from '@prisma/client/runtime/client';
import type {
  NextFunction,
  Request,
  Response as ExpressResponse,
} from 'express';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  sitter_bookings_status,
  sitter_bookings_type,
  subscription_tier,
} from '../src/generated/prisma/client';

const accountId = '123e4567-e89b-42d3-a456-426614174000';
const sitterAccountId = '123e4567-e89b-42d3-a456-426614174001';
const sitterId = '123e4567-e89b-42d3-a456-426614174002';
const petId = '123e4567-e89b-42d3-a456-426614174003';

class MemoryCacheService implements ICacheService {
  private readonly store = new Map<string, unknown>();

  get<T>(key: string): Promise<T | null> {
    return Promise.resolve((this.store.get(key) as T | undefined) ?? null);
  }

  set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
    return Promise.resolve();
  }

  del(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }

  delByPattern(pattern: string): Promise<void> {
    const regex = new RegExp(
      `^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.*')}$`,
    );

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }

    return Promise.resolve();
  }

  async wrap<T>(
    key: string,
    ttl: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value);

    return value;
  }
}

@Controller('cache-fixture')
class CacheFixtureController {
  private value = 1;

  @Get()
  @Cacheable(30)
  find() {
    return { value: this.value };
  }

  @Post()
  @CacheEvict()
  update(@Body('value') value: number) {
    this.value = value;
    return { value: this.value };
  }
}

describe('Phase 5 integration verification (e2e)', () => {
  let app: INestApplication<App>;

  afterEach(async () => {
    await app?.close();
  });

  const initApp = async (metadata: ModuleMetadata) => {
    const module = await Test.createTestingModule(metadata).compile();
    app = module.createNestApplication();
    app.use(
      (
        request_: Request & { user?: { id: string } },
        _response: ExpressResponse,
        next: NextFunction,
      ) => {
        request_.user = { id: accountId };
        next();
      },
    );
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  };

  it('serializes concurrent sitter booking requests and rejects capacity overflow', async () => {
    const heldBookings: Array<{ id: string; start: Date; end: Date }> = [];
    let bookingSequence = 0;

    const sitterBookingsRepository = {
      createInTx: jest.fn(
        (
          _tx: unknown,
          data: {
            end_time: Date;
            expires_at: Date | null;
            start_time: Date;
            type: sitter_bookings_type;
          },
        ) => {
          bookingSequence += 1;
          const booking = {
            id: `booking-${bookingSequence}`,
            account_id: accountId,
            sitter_id: sitterId,
            pet_id: petId,
            type: data.type,
            status: sitter_bookings_status.pending,
            start_time: data.start_time,
            end_time: data.end_time,
            expires_at: data.expires_at,
          };

          heldBookings.push({
            id: booking.id,
            start: booking.start_time,
            end: booking.end_time,
          });

          return Promise.resolve(booking);
        },
      ),
      countHeldOverlappingInTx: jest.fn(
        (_tx, _sitterId, startTime: Date, endTime: Date) =>
          Promise.resolve(
            heldBookings.filter(
              (booking) => booking.start < endTime && booking.end > startTime,
            ).length,
          ),
      ),
      findByIdempotencyKey: jest.fn(() => Promise.resolve(null)),
      findByIdempotencyKeyInTx: jest.fn(() => Promise.resolve(null)),
      runSerializable: jest.fn(
        (callback: (tx: Record<string, never>) => Promise<unknown>) =>
          callback({}),
      ),
    };
    const petSittersRepository = {
      findById: jest.fn(() =>
        Promise.resolve({
          id: sitterId,
          account_id: sitterAccountId,
          hourly_rate: new Decimal(10),
          daily_rate: new Decimal(60),
          is_available: true,
          max_concurrent_bookings: 1,
        }),
      ),
      lock: jest.fn(() =>
        Promise.resolve({
          id: sitterId,
          account_id: sitterAccountId,
          is_available: true,
          max_concurrent_bookings: 1,
        }),
      ),
    };
    const petsRepository = {
      findByUser: jest.fn(() => Promise.resolve({ id: petId })),
    };

    await initApp({
      controllers: [SitterBookingsController],
      providers: [
        SitterBookingsService,
        {
          provide: ISitterBookingsRepository,
          useValue: sitterBookingsRepository,
        },
        { provide: IPetSittersRepository, useValue: petSittersRepository },
        { provide: IPetsRepository, useValue: petsRepository },
        {
          provide: IEventBusService,
          useValue: { publish: jest.fn(() => Promise.resolve()) },
        },
      ],
    });

    const payload = {
      petId,
      sitterId,
      type: sitter_bookings_type.hourly,
      startTime: '2027-06-02T10:00:00.000Z',
      endTime: '2027-06-02T12:00:00.000Z',
    };

    const responses = await Promise.all([
      request(app.getHttpServer())
        .post('/sitter-bookings')
        .send({ ...payload, idempotencyKey: 'request-1' }),
      request(app.getHttpServer())
        .post('/sitter-bookings')
        .send({ ...payload, idempotencyKey: 'request-2' }),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);
    expect(heldBookings).toHaveLength(1);
  });

  it('ignores stale RevenueCat webhooks delivered after a newer renewal', async () => {
    const subscriptionUpdates: Array<{
      subscription: subscription_tier;
      subscription_expires_at: Date | null;
    }> = [];
    const account: {
      id: string;
      subscription_expires_at: Date | null;
    } = {
      id: accountId,
      subscription_expires_at: new Date('2026-06-01T00:00:00.000Z'),
    };
    const subscriptionRepository = {
      findAccountByRevenueCatUserIds: jest.fn(() => Promise.resolve(account)),
      updateSubscription: jest.fn(
        (
          _id: string,
          data: {
            subscription: subscription_tier;
            subscription_expires_at: Date | null;
          },
        ) => {
          subscriptionUpdates.push(data);
          account.subscription_expires_at = data.subscription_expires_at;
          return Promise.resolve({ id: accountId });
        },
      ),
    };

    await initApp({
      controllers: [SubscriptionController],
      providers: [
        SubscriptionService,
        { provide: SubscriptionRepository, useValue: subscriptionRepository },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'REVENUECAT_WEBHOOK_SECRET'
                ? 'webhook-secret'
                : undefined,
            ),
          },
        },
      ],
    });

    const renewal = (eventId: string, expiresAt: string) => ({
      event: {
        app_user_id: accountId,
        event_timestamp_ms: Date.parse('2026-06-01T00:00:00.000Z'),
        expiration_at_ms: Date.parse(expiresAt),
        id: eventId,
        type: 'RENEWAL',
      },
    });

    await request(app.getHttpServer())
      .post('/subscription/webhook')
      .set('Authorization', 'Bearer webhook-secret')
      .send(renewal('newer-event', '2026-08-01T00:00:00.000Z'))
      .expect(200)
      .expect((response) => {
        const body = response.body as { processed: boolean };
        expect(body.processed).toBe(true);
      });

    await request(app.getHttpServer())
      .post('/subscription/webhook')
      .set('Authorization', 'Bearer webhook-secret')
      .send(renewal('stale-event', '2026-07-01T00:00:00.000Z'))
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            processed: false,
            reason: 'stale_event',
          }),
        );
      });

    expect(subscriptionUpdates).toEqual([
      {
        subscription: subscription_tier.premium,
        subscription_expires_at: new Date('2026-08-01T00:00:00.000Z'),
      },
    ]);
  });

  it('evicts opt-in HTTP cache entries after mutations', async () => {
    await initApp({
      controllers: [CacheFixtureController],
      providers: [
        HttpCacheInterceptor,
        HttpCacheEvictInterceptor,
        { provide: ICacheService, useClass: MemoryCacheService },
      ],
    });

    await request(app.getHttpServer())
      .get('/cache-fixture')
      .expect(200)
      .expect({ value: 1 });

    await request(app.getHttpServer())
      .post('/cache-fixture')
      .send({ value: 2 })
      .expect(201)
      .expect({ value: 2 });

    await request(app.getHttpServer())
      .get('/cache-fixture')
      .expect(200)
      .expect({ value: 2 });
  });
});
