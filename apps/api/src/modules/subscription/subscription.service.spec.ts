import { subscription_tier } from '@app/generated/prisma/client';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionService } from './subscription.service';

const accountId = '123e4567-e89b-42d3-a456-426614174000';

const createRepository = () =>
  ({
    findAccountByRevenueCatUserIds: jest.fn(),
    updateSubscription: jest.fn(),
  }) as jest.Mocked<
    Pick<
      SubscriptionRepository,
      'findAccountByRevenueCatUserIds' | 'updateSubscription'
    >
  >;

const createService = (
  repository: ReturnType<typeof createRepository>,
  config: Record<string, string | undefined> = {
    REVENUECAT_WEBHOOK_SECRET: 'webhook-secret',
  },
) =>
  new SubscriptionService(
    repository as unknown as SubscriptionRepository,
    {
      get: jest.fn((key: string) => config[key]),
    } as unknown as ConfigService,
  );

const createPayload = (overrides: Record<string, unknown> = {}) => ({
  api_version: '1.0',
  event: {
    app_user_id: accountId,
    event_timestamp_ms: Date.parse('2026-06-01T00:00:00.000Z'),
    expiration_at_ms: Date.parse('2026-07-01T00:00:00.000Z'),
    id: 'event-1',
    type: 'RENEWAL',
    ...overrides,
  },
});

describe('SubscriptionService', () => {
  let repository: ReturnType<typeof createRepository>;
  let service: SubscriptionService;

  beforeEach(() => {
    repository = createRepository();
    service = createService(repository);
  });

  it('rejects webhooks with an invalid authorization header', async () => {
    await expect(
      service.handleRevenueCatWebhook(createPayload(), 'wrong-secret'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('upgrades an account when a newer RevenueCat renewal arrives', async () => {
    repository.findAccountByRevenueCatUserIds.mockResolvedValue({
      id: accountId,
      subscription_expires_at: new Date('2026-06-01T00:00:00.000Z'),
    } as never);
    repository.updateSubscription.mockResolvedValue({ id: accountId } as never);

    const result = await service.handleRevenueCatWebhook(
      createPayload(),
      'Bearer webhook-secret',
    );

    expect(result).toEqual({
      accountId,
      eventId: 'event-1',
      eventType: 'RENEWAL',
      processed: true,
    });
    expect(repository.findAccountByRevenueCatUserIds.mock.calls).toEqual([
      [[accountId]],
    ]);
    expect(repository.updateSubscription.mock.calls).toEqual([
      [
        accountId,
        {
          subscription: subscription_tier.premium,
          subscription_expires_at: new Date('2026-07-01T00:00:00.000Z'),
        },
      ],
    ]);
  });

  it('ignores stale events that would move the expiration backwards', async () => {
    repository.findAccountByRevenueCatUserIds.mockResolvedValue({
      id: accountId,
      subscription_expires_at: new Date('2026-08-01T00:00:00.000Z'),
    } as never);

    const result = await service.handleRevenueCatWebhook(
      createPayload(),
      'webhook-secret',
    );

    expect(result).toEqual({
      accountId,
      eventId: 'event-1',
      eventType: 'RENEWAL',
      processed: false,
      reason: 'stale_event',
    });
    expect(repository.updateSubscription.mock.calls).toHaveLength(0);
  });

  it('downgrades on expiration when event timestamp is newer than stored expiry', async () => {
    repository.findAccountByRevenueCatUserIds.mockResolvedValue({
      id: accountId,
      subscription_expires_at: new Date('2026-07-01T00:00:00.000Z'),
    } as never);
    repository.updateSubscription.mockResolvedValue({ id: accountId } as never);

    await service.handleRevenueCatWebhook(
      createPayload({
        event_timestamp_ms: Date.parse('2026-07-01T00:05:00.000Z'),
        expiration_at_ms: Date.parse('2026-07-01T00:00:00.000Z'),
        type: 'EXPIRATION',
      }),
      'webhook-secret',
    );

    expect(repository.updateSubscription.mock.calls).toEqual([
      [
        accountId,
        {
          subscription: subscription_tier.free,
          subscription_expires_at: new Date('2026-07-01T00:00:00.000Z'),
        },
      ],
    ]);
  });

  it('ignores cancellation events because access ends on expiration events', async () => {
    const result = await service.handleRevenueCatWebhook(
      createPayload({ type: 'CANCELLATION' }),
      'webhook-secret',
    );

    expect(result).toEqual({
      eventId: 'event-1',
      eventType: 'CANCELLATION',
      processed: false,
      reason: 'event_type_ignored',
    });
    expect(repository.findAccountByRevenueCatUserIds.mock.calls).toHaveLength(
      0,
    );
  });
});
