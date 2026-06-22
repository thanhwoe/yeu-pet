import {
  subscription_status,
  subscription_tier,
} from '@app/generated/prisma/client';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionService } from './subscription.service';

const accountId = '123e4567-e89b-42d3-a456-426614174000';

const createRepository = () =>
  ({
    findAccountByRevenueCatUserIds: jest.fn(),
    updateSubscription: jest.fn(),
    findAccountById: jest.fn(),
    findLatestUserSubscription: jest.fn(),
    countPets: jest.fn(),
    countActiveReminders: jest.fn(),
    countMedicalRecords: jest.fn(),
    countBudgetTransactionsThisMonth: jest.fn(),
    countPhotos: jest.fn(),
    getUsageCount: jest.fn(),
    setManualSubscription: jest.fn(),
  }) as jest.Mocked<Pick<SubscriptionRepository, keyof SubscriptionRepository>>;

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

  const mockUsage = ({
    pets = 1,
    activeReminders = 2,
    medicalRecords = 3,
    budgetTransactionsThisMonth = 4,
    photos = 5,
    aiMessagesThisMonth = 1,
  } = {}) => {
    repository.countPets.mockResolvedValue(pets);
    repository.countActiveReminders.mockResolvedValue(activeReminders);
    repository.countMedicalRecords.mockResolvedValue(medicalRecords);
    repository.countBudgetTransactionsThisMonth.mockResolvedValue(
      budgetTransactionsThisMonth,
    );
    repository.countPhotos.mockResolvedValue(photos);
    repository.getUsageCount.mockResolvedValue({
      count: aiMessagesThisMonth,
    });
  };

  it('returns free entitlements with current usage', async () => {
    repository.findAccountById.mockResolvedValue({
      id: accountId,
      subscription: subscription_tier.free,
      subscription_expires_at: null,
    } as never);
    repository.findLatestUserSubscription.mockResolvedValue(null);
    mockUsage();

    await expect(service.getEntitlements(accountId)).resolves.toMatchObject({
      tier: 'free',
      status: 'free',
      planCode: 'free',
      limits: {
        maxPets: 2,
        aiMessagesPerMonth: 5,
      },
      usage: {
        pets: 1,
        aiMessagesThisMonth: 1,
      },
    });
  });

  it('returns the Premium access boundary with live usage', async () => {
    const expiresAt = new Date('2099-07-20T00:00:00.000Z');
    repository.findAccountById.mockResolvedValue({
      id: accountId,
      subscription: subscription_tier.premium,
      subscription_expires_at: expiresAt,
    } as never);
    repository.findLatestUserSubscription.mockResolvedValue({
      plan_code: 'premium_monthly',
      status: subscription_status.active,
      expires_at: expiresAt,
    } as never);
    mockUsage({ pets: 2, activeReminders: 4 });

    await expect(service.getEntitlements(accountId)).resolves.toMatchObject({
      tier: 'premium',
      status: 'active',
      planCode: 'premium_monthly',
      expiresAt,
      limits: {
        maxPets: -1,
        recurringReminders: true,
        exportMedicalSummary: true,
      },
      usage: {
        pets: 2,
        activeReminders: 4,
      },
    });
  });

  it('keeps mock subscription changes disabled in production', async () => {
    service = createService(repository, { NODE_ENV: 'production' });

    await expect(service.mockUpgrade(accountId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.mockDowngrade(accountId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.setManualSubscription).not.toHaveBeenCalled();
  });

  it('applies a mock upgrade in development and returns refreshed usage', async () => {
    repository.setManualSubscription.mockResolvedValue({
      id: 'subscription-id',
    } as never);
    repository.findAccountById.mockResolvedValue({
      id: accountId,
      subscription: subscription_tier.premium,
      subscription_expires_at: null,
    } as never);
    repository.findLatestUserSubscription.mockResolvedValue({
      plan_code: 'premium_monthly',
      status: subscription_status.active,
      expires_at: null,
    } as never);
    mockUsage({ pets: 2, aiMessagesThisMonth: 3 });

    await expect(service.mockUpgrade(accountId)).resolves.toMatchObject({
      tier: 'premium',
      usage: { pets: 2, aiMessagesThisMonth: 3 },
    });
    expect(repository.setManualSubscription).toHaveBeenCalledWith(
      accountId,
      subscription_tier.premium,
    );
  });

  it('blocks pet creation when the free pet limit is reached', async () => {
    repository.findAccountById.mockResolvedValue({
      id: accountId,
      subscription: subscription_tier.free,
      subscription_expires_at: null,
    } as never);
    repository.findLatestUserSubscription.mockResolvedValue(null);
    mockUsage({ pets: 2 });

    await expect(service.assertCanCreatePet(accountId)).rejects.toMatchObject({
      status: 429,
    } satisfies Partial<HttpException>);
  });

  it('blocks photo uploads when the free photo limit is reached', async () => {
    repository.findAccountById.mockResolvedValue({
      id: accountId,
      subscription: subscription_tier.free,
      subscription_expires_at: null,
    } as never);
    repository.findLatestUserSubscription.mockResolvedValue(null);
    mockUsage({ photos: 20 });

    await expect(service.assertCanUploadPhoto(accountId)).rejects.toMatchObject(
      {
        status: 429,
      } satisfies Partial<HttpException>,
    );
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
