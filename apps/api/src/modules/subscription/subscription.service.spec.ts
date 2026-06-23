import {
  subscription_status,
  subscription_tier,
} from '@app/generated/prisma/client';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { RevenueCatClient } from './revenuecat.client';
import {
  REVENUECAT_WEBHOOK_JOB,
  RevenueCatSubscriberResponse,
  RevenueCatWebhookPayload,
} from './revenuecat-webhook.interface';
import {
  RevenueCatSubscriptionTarget,
  SubscriptionRepository,
} from './subscription.repository';
import { SubscriptionService } from './subscription.service';

const accountId = '123e4567-e89b-42d3-a456-426614174000';
const sourceAccountId = '223e4567-e89b-42d3-a456-426614174000';
const destinationAccountId = '323e4567-e89b-42d3-a456-426614174000';

const createRepository = () => ({
  applyRevenueCatMutations: jest.fn(),
  countActiveReminders: jest.fn(),
  countBudgetTransactionsThisMonth: jest.fn(),
  countMedicalRecords: jest.fn(),
  countPets: jest.fn(),
  countPhotos: jest.fn(),
  findAccountById: jest.fn(),
  findActivePlanCode: jest.fn().mockResolvedValue(null),
  findLatestUserSubscription: jest.fn(),
  findRevenueCatTarget: jest.fn(),
  findRevenueCatTargetForAccount: jest.fn(),
  findRevenueCatTargets: jest.fn(),
  getUsageCount: jest.fn(),
  incrementUsage: jest.fn(),
  setManualSubscription: jest.fn(),
});

const createClient = () => ({
  getSubscriber: jest.fn(),
});

const createQueue = () => ({
  add: jest.fn(),
});

const createTarget = (
  id = accountId,
  overrides: {
    account?: Record<string, unknown>;
    subscription?: Record<string, unknown> | null;
  } = {},
): RevenueCatSubscriptionTarget => ({
  account: {
    id,
    subscription: subscription_tier.premium,
    subscription_expires_at: new Date('2099-07-01T00:00:00.000Z'),
    ...overrides.account,
  } as never,
  subscription:
    overrides.subscription === null
      ? null
      : ({
          id: `subscription-${id}`,
          account_id: id,
          plan_code: 'premium_monthly',
          provider_customer_id: id,
          provider_original_id: `original-${id}`,
          status: subscription_status.active,
          expires_at: new Date('2099-07-01T00:00:00.000Z'),
          last_rc_event_at: null,
          last_rc_event_id: null,
          ...overrides.subscription,
        } as never),
});

const createPayload = (
  overrides: Record<string, unknown> = {},
): RevenueCatWebhookPayload => ({
  api_version: '1.0',
  event: {
    aliases: ['anonymous-user'],
    app_user_id: accountId,
    entitlement_ids: ['Yeu Pet Pro'],
    environment: 'PRODUCTION',
    event_timestamp_ms: Date.parse('2026-06-01T00:00:00.000Z'),
    expiration_at_ms: Date.parse('2099-07-01T00:00:00.000Z'),
    id: 'event-1',
    original_app_user_id: 'original-user',
    product_id: 'premium_monthly',
    type: 'RENEWAL',
    ...overrides,
  },
});

const activeSubscriber = (
  originalAppUserId = 'original-user',
): RevenueCatSubscriberResponse => ({
  subscriber: {
    entitlements: {
      'Yeu Pet Pro': {
        expires_date: '2099-07-01T00:00:00.000Z',
        product_identifier: 'premium_monthly',
        purchase_date: '2026-06-01T00:00:00.000Z',
      },
    },
    original_app_user_id: originalAppUserId,
    subscriptions: {
      premium_monthly: {
        expires_date: '2099-07-01T00:00:00.000Z',
        period_type: 'normal',
        purchase_date: '2026-06-01T00:00:00.000Z',
      },
    },
  },
});

const expiredSubscriber = (
  originalAppUserId = 'original-user',
): RevenueCatSubscriberResponse => ({
  subscriber: {
    entitlements: {
      'Yeu Pet Pro': {
        expires_date: '2020-01-01T00:00:00.000Z',
        product_identifier: 'premium_monthly',
        purchase_date: '2019-12-01T00:00:00.000Z',
      },
    },
    original_app_user_id: originalAppUserId,
    subscriptions: {
      premium_monthly: {
        expires_date: '2020-01-01T00:00:00.000Z',
        period_type: 'normal',
        purchase_date: '2019-12-01T00:00:00.000Z',
      },
    },
  },
});

describe('SubscriptionService', () => {
  let repository: ReturnType<typeof createRepository>;
  let client: ReturnType<typeof createClient>;
  let queue: ReturnType<typeof createQueue>;
  let config: Record<string, string | undefined>;
  let service: SubscriptionService;

  beforeEach(() => {
    repository = createRepository();
    client = createClient();
    queue = createQueue();
    config = {
      REVENUECAT_PREMIUM_ENTITLEMENT_ID: 'Yeu Pet Pro',
      REVENUECAT_WEBHOOK_SECRET: 'webhook-secret',
    };
    service = new SubscriptionService(
      repository as unknown as SubscriptionRepository,
      {
        get: jest.fn((key: string) => config[key]),
      } as unknown as ConfigService,
      client as unknown as RevenueCatClient,
      queue as unknown as Queue<RevenueCatWebhookPayload>,
    );
  });

  const mockUsage = () => {
    repository.countPets.mockResolvedValue(1);
    repository.countActiveReminders.mockResolvedValue(2);
    repository.countMedicalRecords.mockResolvedValue(3);
    repository.countBudgetTransactionsThisMonth.mockResolvedValue(4);
    repository.countPhotos.mockResolvedValue(5);
    repository.getUsageCount.mockResolvedValue({ count: 1 });
  };

  it('treats an expired access boundary as expired even if the stored status is active', async () => {
    repository.findAccountById.mockResolvedValue({
      id: accountId,
      subscription: subscription_tier.premium,
      subscription_expires_at: new Date('2020-01-01T00:00:00.000Z'),
    });
    repository.findLatestUserSubscription.mockResolvedValue({
      plan_code: 'premium_monthly',
      status: subscription_status.active,
      expires_at: new Date('2020-01-01T00:00:00.000Z'),
    });

    await expect(service.getCurrentPlan(accountId)).resolves.toMatchObject({
      status: subscription_status.expired,
      tier: subscription_tier.free,
    });
  });

  it('keeps mock subscription changes disabled in production', async () => {
    config.NODE_ENV = 'production';

    await expect(service.mockUpgrade(accountId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.setManualSubscription).not.toHaveBeenCalled();
  });

  it('authenticates and queues a webhook by event id without processing it inline', async () => {
    queue.add.mockResolvedValue({ id: 'event-1' });

    await expect(
      service.enqueueRevenueCatWebhook(
        createPayload(),
        'Bearer webhook-secret',
      ),
    ).resolves.toEqual({ eventId: 'event-1', received: true });

    expect(queue.add).toHaveBeenCalledWith(
      REVENUECAT_WEBHOOK_JOB,
      createPayload(),
      expect.objectContaining({ jobId: 'event-1' }),
    );
    expect(repository.findRevenueCatTarget).not.toHaveBeenCalled();
  });

  it('rejects webhooks with an invalid authorization header', async () => {
    await expect(
      service.enqueueRevenueCatWebhook(createPayload(), 'wrong-secret'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('uses app user id, original id, and aliases to update one stable subscription', async () => {
    repository.findRevenueCatTarget.mockResolvedValue(createTarget());
    repository.applyRevenueCatMutations.mockResolvedValue();

    await expect(
      service.processRevenueCatWebhook(createPayload()),
    ).resolves.toEqual({
      accountId,
      eventId: 'event-1',
      eventType: 'RENEWAL',
      processed: true,
    });

    expect(repository.findRevenueCatTarget).toHaveBeenCalledWith([
      accountId,
      'original-user',
      'anonymous-user',
    ]);
    expect(repository.applyRevenueCatMutations).toHaveBeenCalledWith([
      expect.objectContaining({
        accountId,
        accountTier: subscription_tier.premium,
        expiresAt: new Date('2099-07-01T00:00:00.000Z'),
        lastRcEventAt: BigInt(Date.parse('2026-06-01T00:00:00.000Z')),
        lastRcEventId: 'event-1',
        providerCustomerId: accountId,
        providerOriginalId: 'original-user',
        status: subscription_status.active,
        subscriptionId: `subscription-${accountId}`,
      }),
    ]);
  });

  it('creates trial state from an initial purchase timestamp', async () => {
    repository.findRevenueCatTarget.mockResolvedValue(
      createTarget(accountId, {
        account: {
          subscription: subscription_tier.free,
          subscription_expires_at: null,
        },
        subscription: null,
      }),
    );

    await service.processRevenueCatWebhook(
      createPayload({
        period_type: 'TRIAL',
        product_id: 'yeupet_premium_yearly',
        purchased_at_ms: Date.parse('2026-05-31T12:00:00.000Z'),
        type: 'INITIAL_PURCHASE',
      }),
    );

    expect(repository.applyRevenueCatMutations).toHaveBeenCalledWith([
      expect.objectContaining({
        accountTier: subscription_tier.premium,
        planCode: 'premium_yearly',
        startedAt: new Date('2026-05-31T12:00:00.000Z'),
        status: subscription_status.trialing,
      }),
    ]);
  });

  it('skips duplicate and out-of-order webhook events', async () => {
    repository.findRevenueCatTarget.mockResolvedValue(
      createTarget(accountId, {
        subscription: {
          last_rc_event_at: BigInt(Date.parse('2026-06-02T00:00:00.000Z')),
          last_rc_event_id: 'newer-event',
        },
      }),
    );

    await expect(
      service.processRevenueCatWebhook(createPayload()),
    ).resolves.toMatchObject({ processed: false, reason: 'stale_event' });

    repository.findRevenueCatTarget.mockResolvedValue(
      createTarget(accountId, {
        subscription: { last_rc_event_id: 'event-1' },
      }),
    );

    await expect(
      service.processRevenueCatWebhook(createPayload()),
    ).resolves.toMatchObject({ processed: false, reason: 'duplicate_event' });
    expect(repository.applyRevenueCatMutations).not.toHaveBeenCalled();
  });

  it('records a normal cancellation without revoking access early', async () => {
    repository.findRevenueCatTarget.mockResolvedValue(createTarget());

    await service.processRevenueCatWebhook(
      createPayload({
        cancel_reason: 'UNSUBSCRIBE',
        type: 'CANCELLATION',
      }),
    );

    expect(repository.applyRevenueCatMutations).toHaveBeenCalledWith([
      expect.objectContaining({
        accountTier: subscription_tier.premium,
        cancelledAt: new Date('2026-06-01T00:00:00.000Z'),
        expiresAt: new Date('2099-07-01T00:00:00.000Z'),
        status: subscription_status.active,
      }),
    ]);
  });

  it('checks current Customer Info before a support cancellation revokes access', async () => {
    repository.findRevenueCatTarget.mockResolvedValue(createTarget());
    client.getSubscriber.mockResolvedValue(activeSubscriber());

    await service.processRevenueCatWebhook(
      createPayload({
        cancel_reason: 'CUSTOMER_SUPPORT',
        type: 'CANCELLATION',
      }),
    );

    expect(client.getSubscriber).toHaveBeenCalledWith(accountId);
    expect(repository.applyRevenueCatMutations).toHaveBeenCalledWith([
      expect.objectContaining({
        accountTier: subscription_tier.premium,
        cancelledAt: new Date('2026-06-01T00:00:00.000Z'),
        status: subscription_status.active,
      }),
    ]);
  });

  it('restores active access on uncancellation', async () => {
    repository.findRevenueCatTarget.mockResolvedValue(createTarget());

    await service.processRevenueCatWebhook(
      createPayload({ type: 'UNCANCELLATION' }),
    );

    expect(repository.applyRevenueCatMutations).toHaveBeenCalledWith([
      expect.objectContaining({
        accountTier: subscription_tier.premium,
        cancelledAt: null,
        status: subscription_status.active,
      }),
    ]);
  });

  it('keeps access during a configured billing grace period', async () => {
    repository.findRevenueCatTarget.mockResolvedValue(createTarget());
    const gracePeriodEndsAt = Date.parse('2099-07-05T00:00:00.000Z');

    await service.processRevenueCatWebhook(
      createPayload({
        grace_period_expiration_at_ms: gracePeriodEndsAt,
        type: 'BILLING_ISSUE',
      }),
    );

    expect(repository.applyRevenueCatMutations).toHaveBeenCalledWith([
      expect.objectContaining({
        accountExpiresAt: new Date(gracePeriodEndsAt),
        accountTier: subscription_tier.premium,
        status: subscription_status.grace_period,
      }),
    ]);
  });

  it('updates the plan on a product change without revoking access', async () => {
    repository.findRevenueCatTarget.mockResolvedValue(createTarget());

    await service.processRevenueCatWebhook(
      createPayload({
        new_product_id: 'yeupet_premium_yearly',
        type: 'PRODUCT_CHANGE',
      }),
    );

    expect(repository.applyRevenueCatMutations).toHaveBeenCalledWith([
      expect.objectContaining({
        accountTier: subscription_tier.premium,
        planCode: 'premium_yearly',
        status: subscription_status.active,
      }),
    ]);
  });

  it('verifies an expiration with RevenueCat before revoking and caps free-tier counters', async () => {
    repository.findRevenueCatTarget.mockResolvedValue(createTarget());
    client.getSubscriber.mockResolvedValue(expiredSubscriber());

    await service.processRevenueCatWebhook(
      createPayload({ type: 'EXPIRATION' }),
    );

    expect(client.getSubscriber).toHaveBeenCalledWith(accountId);
    expect(repository.applyRevenueCatMutations).toHaveBeenCalledWith([
      expect.objectContaining({
        accountExpiresAt: null,
        accountTier: subscription_tier.free,
        capUsageCounters: {
          ai_conversations: 5,
          ai_messages: 5,
          medical_records: 10,
        },
        status: subscription_status.expired,
      }),
    ]);
  });

  it('ignores sandbox events in production', async () => {
    config.NODE_ENV = 'production';

    await expect(
      service.processRevenueCatWebhook(
        createPayload({ environment: 'SANDBOX' }),
      ),
    ).resolves.toMatchObject({
      processed: false,
      reason: 'sandbox_event_in_production',
    });
    expect(repository.findRevenueCatTarget).not.toHaveBeenCalled();
  });

  it('logs and ignores RevenueCat test events without touching data', async () => {
    await expect(
      service.processRevenueCatWebhook(createPayload({ type: 'TEST' })),
    ).resolves.toMatchObject({ processed: false, reason: 'test_event' });
    expect(repository.findRevenueCatTarget).not.toHaveBeenCalled();
    expect(repository.applyRevenueCatMutations).not.toHaveBeenCalled();
  });

  it('verifies both sides of a transfer and applies the changes atomically', async () => {
    const source = createTarget(sourceAccountId);
    const destination = createTarget(destinationAccountId, {
      account: {
        subscription: subscription_tier.free,
        subscription_expires_at: null,
      },
      subscription: null,
    });
    repository.findRevenueCatTargets
      .mockResolvedValueOnce([source])
      .mockResolvedValueOnce([destination]);
    client.getSubscriber
      .mockResolvedValueOnce(expiredSubscriber(sourceAccountId))
      .mockResolvedValueOnce(activeSubscriber(destinationAccountId));

    await service.processRevenueCatWebhook(
      createPayload({
        app_user_id: undefined,
        aliases: undefined,
        original_app_user_id: undefined,
        transferred_from: [sourceAccountId],
        transferred_to: [destinationAccountId],
        type: 'TRANSFER',
      }),
    );

    expect(repository.applyRevenueCatMutations).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          accountId: sourceAccountId,
          accountTier: subscription_tier.free,
        }),
        expect.objectContaining({
          accountId: destinationAccountId,
          accountTier: subscription_tier.premium,
        }),
      ]),
    );
  });

  it('syncs the authenticated account from RevenueCat Customer Info', async () => {
    const target = createTarget(accountId, {
      account: {
        subscription: subscription_tier.free,
        subscription_expires_at: null,
      },
      subscription: null,
    });
    repository.findRevenueCatTargetForAccount.mockResolvedValue(target);
    client.getSubscriber.mockResolvedValue(activeSubscriber());
    repository.findAccountById.mockResolvedValue({
      id: accountId,
      subscription: subscription_tier.premium,
      subscription_expires_at: new Date('2099-07-01T00:00:00.000Z'),
    });
    repository.findLatestUserSubscription.mockResolvedValue({
      plan_code: 'premium_monthly',
      status: subscription_status.active,
      expires_at: new Date('2099-07-01T00:00:00.000Z'),
    });
    mockUsage();

    await expect(
      service.syncRevenueCatSubscription(accountId),
    ).resolves.toMatchObject({
      status: subscription_status.active,
      tier: subscription_tier.premium,
    });

    expect(client.getSubscriber).toHaveBeenCalledWith(accountId);
    expect(repository.applyRevenueCatMutations).toHaveBeenCalledWith([
      expect.objectContaining({
        accountId,
        accountTier: subscription_tier.premium,
        providerCustomerId: accountId,
      }),
    ]);
  });
});
