import {
  accounts,
  reminder_repeat_frequency,
  subscription_status,
  subscription_tier,
} from '@app/generated/prisma/client';
import { API_ERROR_CODES } from '@app/errors/api-error-codes';
import { BULLMQ_QUEUES } from '@app/modules/shared/bullmq/bullmq.queue';
import { InjectQueue } from '@nestjs/bullmq';
import { timingSafeEqual } from 'crypto';
import { Queue } from 'bullmq';
import dayjs from 'dayjs';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ParsedRevenueCatWebhookEvent,
  REVENUECAT_SUBSCRIPTION_EVENTS,
  REVENUECAT_WEBHOOK_JOB,
  RevenueCatSubscriberResponse,
  RevenueCatWebhookEvent,
  RevenueCatWebhookAck,
  RevenueCatWebhookPayload,
  RevenueCatWebhookResult,
} from './revenuecat-webhook.interface';
import { RevenueCatClient } from './revenuecat.client';
import {
  SUBSCRIPTION_FEATURE_KEYS,
  SUBSCRIPTION_LIMITS,
} from './subscription-limits';
import {
  RevenueCatSubscriptionMutation,
  RevenueCatSubscriptionTarget,
  SubscriptionRepository,
} from './subscription.repository';

export interface EntitlementUsage {
  pets: number;
  activeReminders: number;
  medicalRecords: number;
  budgetTransactionsThisMonth: number;
  photos: number;
  aiMessagesThisMonth: number;
}

const FREE_USAGE_COUNTER_LIMITS = {
  ai_conversations: SUBSCRIPTION_LIMITS.free.aiMessagesPerMonth,
  ai_messages: SUBSCRIPTION_LIMITS.free.aiMessagesPerMonth,
  medical_records: SUBSCRIPTION_LIMITS.free.maxMedicalRecords,
};

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly configService: ConfigService,
    private readonly revenueCatClient: RevenueCatClient,
    @InjectQueue(BULLMQ_QUEUES.REVENUECAT_WEBHOOK)
    private readonly revenueCatWebhookQueue: Queue<RevenueCatWebhookPayload>,
  ) {}

  async getCurrentPlan(accountId: string) {
    const account =
      await this.subscriptionRepository.findAccountById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const subscription =
      await this.subscriptionRepository.findLatestUserSubscription(accountId);

    const status = this.resolveStatus(account, subscription?.status);
    const tier =
      status === subscription_status.active ||
      status === subscription_status.trialing ||
      status === subscription_status.grace_period
        ? subscription_tier.premium
        : subscription_tier.free;

    return {
      tier,
      status,
      expiresAt:
        subscription?.expires_at ?? account.subscription_expires_at ?? null,
      planCode:
        subscription?.plan_code ??
        (tier === subscription_tier.premium ? 'premium_monthly' : 'free'),
    };
  }

  async getEntitlements(accountId: string) {
    const plan = await this.getCurrentPlan(accountId);
    const usage = await this.getUsage(accountId);
    const limits = SUBSCRIPTION_LIMITS[plan.tier];

    return {
      ...plan,
      limits,
      usage,
    };
  }

  async mockUpgrade(accountId: string) {
    this.assertMockSubscriptionAllowed();
    await this.subscriptionRepository.setManualSubscription(
      accountId,
      subscription_tier.premium,
    );
    return this.getEntitlements(accountId);
  }

  async mockDowngrade(accountId: string) {
    this.assertMockSubscriptionAllowed();
    await this.subscriptionRepository.setManualSubscription(
      accountId,
      subscription_tier.free,
    );
    return this.getEntitlements(accountId);
  }

  async assertCanCreatePet(accountId: string): Promise<void> {
    const entitlements = await this.getEntitlements(accountId);
    const limit = entitlements.limits.maxPets;

    if (limit >= 0 && entitlements.usage.pets >= limit) {
      throw new HttpException(
        {
          errorCode: API_ERROR_CODES.SUBSCRIPTION_PET_LIMIT_REACHED,
          message: 'Free plan pet limit reached',
          messageKey: 'errors.subscription.petLimitReached',
          feature: 'pets',
          limit,
          params: {
            feature: 'pets',
            limit,
            usage: entitlements.usage.pets,
          },
          usage: entitlements.usage.pets,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async assertCanCreateReminder(
    accountId: string,
    input: { repeatFrequency?: reminder_repeat_frequency },
  ): Promise<void> {
    const entitlements = await this.getEntitlements(accountId);

    if (
      input.repeatFrequency &&
      input.repeatFrequency !== reminder_repeat_frequency.none &&
      !entitlements.limits.recurringReminders
    ) {
      throw new HttpException(
        {
          errorCode: API_ERROR_CODES.SUBSCRIPTION_PREMIUM_REQUIRED,
          message: 'Recurring reminders require Premium',
          messageKey: 'errors.subscription.premiumRequired',
          feature: 'recurringReminders',
          params: {
            feature: 'recurringReminders',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const limit = entitlements.limits.maxActiveReminders;

    if (limit >= 0 && entitlements.usage.activeReminders >= limit) {
      throw new HttpException(
        {
          errorCode: API_ERROR_CODES.SUBSCRIPTION_REMINDER_LIMIT_REACHED,
          message: 'Free plan active reminder limit reached',
          messageKey: 'errors.subscription.reminderLimitReached',
          feature: 'reminders',
          limit,
          params: {
            feature: 'reminders',
            limit,
            usage: entitlements.usage.activeReminders,
          },
          usage: entitlements.usage.activeReminders,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async assertCanCreateMedicalRecord(accountId: string): Promise<void> {
    const entitlements = await this.getEntitlements(accountId);
    const limit = entitlements.limits.maxMedicalRecords;

    if (limit >= 0 && entitlements.usage.medicalRecords >= limit) {
      throw new HttpException(
        {
          errorCode: API_ERROR_CODES.SUBSCRIPTION_MEDICAL_RECORD_LIMIT_REACHED,
          message: 'Free plan medical record limit reached',
          messageKey: 'errors.subscription.medicalRecordLimitReached',
          feature: 'medicalRecords',
          limit,
          params: {
            feature: 'medicalRecords',
            limit,
            usage: entitlements.usage.medicalRecords,
          },
          usage: entitlements.usage.medicalRecords,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async assertCanUploadPhoto(accountId: string): Promise<void> {
    const entitlements = await this.getEntitlements(accountId);
    const limit = entitlements.limits.maxPhotos;

    if (limit >= 0 && entitlements.usage.photos >= limit) {
      throw new HttpException(
        {
          errorCode: API_ERROR_CODES.SUBSCRIPTION_PHOTO_LIMIT_REACHED,
          message: 'Free plan photo limit reached',
          messageKey: 'errors.subscription.photoLimitReached',
          feature: 'photos',
          limit,
          params: {
            feature: 'photos',
            limit,
            usage: entitlements.usage.photos,
          },
          usage: entitlements.usage.photos,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async assertCanUploadMedicalImages(
    accountId: string,
    count: number,
  ): Promise<void> {
    const entitlements = await this.getEntitlements(accountId);
    const limit = entitlements.limits.maxImagesPerMedicalRecord;

    if (limit >= 0 && count > limit) {
      throw new HttpException(
        {
          errorCode: API_ERROR_CODES.SUBSCRIPTION_PHOTO_LIMIT_REACHED,
          message: 'Medical image limit reached',
          messageKey: 'errors.subscription.photoLimitReached',
          feature: 'medicalAttachments',
          limit,
          params: {
            feature: 'medicalAttachments',
            limit,
            usage: count,
          },
          usage: count,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async assertCanCreateBudgetTransaction(
    accountId: string,
    date: Date,
  ): Promise<void> {
    const entitlements = await this.getEntitlementsForMonth(accountId, date);
    const limit = entitlements.limits.maxBudgetTransactionsPerMonth;

    if (limit >= 0 && entitlements.usage.budgetTransactionsThisMonth >= limit) {
      throw new HttpException(
        {
          errorCode:
            API_ERROR_CODES.SUBSCRIPTION_BUDGET_TRANSACTION_LIMIT_REACHED,
          message: 'Free plan monthly budget transaction limit reached',
          messageKey: 'errors.subscription.budgetTransactionLimitReached',
          feature: 'budgetTransactions',
          limit,
          params: {
            feature: 'budgetTransactions',
            limit,
            usage: entitlements.usage.budgetTransactionsThisMonth,
          },
          usage: entitlements.usage.budgetTransactionsThisMonth,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async assertCanUseAi(accountId: string): Promise<void> {
    const entitlements = await this.getEntitlements(accountId);
    const limit = entitlements.limits.aiMessagesPerMonth;

    if (limit >= 0 && entitlements.usage.aiMessagesThisMonth >= limit) {
      throw new HttpException(
        {
          errorCode: API_ERROR_CODES.SUBSCRIPTION_AI_LIMIT_REACHED,
          message: 'AI monthly quota reached',
          messageKey: 'errors.subscription.aiLimitReached',
          feature: SUBSCRIPTION_FEATURE_KEYS.aiMessages,
          limit,
          params: {
            feature: SUBSCRIPTION_FEATURE_KEYS.aiMessages,
            limit,
            usage: entitlements.usage.aiMessagesThisMonth,
          },
          usage: entitlements.usage.aiMessagesThisMonth,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async incrementUsage(accountId: string, featureKey: string): Promise<number> {
    const now = dayjs();
    return this.subscriptionRepository.incrementUsage(
      accountId,
      featureKey,
      now.format('YYYY-MM'),
      now.endOf('month').toDate(),
    );
  }

  async enqueueRevenueCatWebhook(
    payload: RevenueCatWebhookPayload,
    authorizationHeader?: string,
  ): Promise<RevenueCatWebhookAck> {
    this.assertAuthorized(authorizationHeader);

    const event = this.parseEvent(payload);

    await this.revenueCatWebhookQueue.add(REVENUECAT_WEBHOOK_JOB, payload, {
      jobId: event.id,
      removeOnComplete: { age: 7 * 24 * 60 * 60, count: 10_000 },
      removeOnFail: { age: 30 * 24 * 60 * 60, count: 10_000 },
    });

    return { eventId: event.id, received: true };
  }

  async processRevenueCatWebhook(
    payload: RevenueCatWebhookPayload,
  ): Promise<RevenueCatWebhookResult> {
    const event = this.parseEvent(payload);

    if (
      event.environment === 'SANDBOX' &&
      this.configService.get<string>('NODE_ENV') === 'production'
    ) {
      this.logger.warn(
        `Ignoring sandbox RevenueCat event ${event.id} in production`,
      );
      return this.ignored(event, 'sandbox_event_in_production');
    }

    if (event.type === REVENUECAT_SUBSCRIPTION_EVENTS.TEST) {
      this.logger.log(`Received RevenueCat test event ${event.id}`);
      return this.ignored(event, 'test_event');
    }

    if (event.type === REVENUECAT_SUBSCRIPTION_EVENTS.TRANSFER) {
      return this.processTransferEvent(event);
    }

    if (!this.matchesConfiguredEntitlement(event)) {
      return this.ignored(event, 'entitlement_ignored');
    }

    const revenueCatIds = this.extractRevenueCatIds(event);

    if (revenueCatIds.length === 0) {
      return this.ignored(event, 'no_matching_account_id');
    }

    const target =
      await this.subscriptionRepository.findRevenueCatTarget(revenueCatIds);

    if (!target) {
      this.logger.warn(
        `No account matched RevenueCat event ${event.id} (${event.type})`,
      );
      return this.ignored(event, 'account_not_found');
    }

    const skipReason = this.getEventSkipReason(target, event);

    if (skipReason) {
      this.logger.warn(
        `Skipping RevenueCat event ${event.id} for account ${target.account.id}: ${skipReason}`,
      );
      return this.ignored(event, skipReason, target.account.id);
    }

    const mutation = await this.toWebhookMutation(target, event);

    if (!mutation) {
      return this.ignored(event, 'event_type_ignored', target.account.id);
    }

    await this.subscriptionRepository.applyRevenueCatMutations([mutation]);

    if (event.type === REVENUECAT_SUBSCRIPTION_EVENTS.BILLING_ISSUE) {
      this.logger.warn(
        `RevenueCat billing issue for account ${target.account.id} (${event.id})`,
      );
    }

    return {
      accountId: target.account.id,
      eventId: event.id,
      eventType: event.type,
      processed: true,
    };
  }

  async syncRevenueCatSubscription(accountId: string) {
    const target =
      await this.subscriptionRepository.findRevenueCatTargetForAccount(
        accountId,
      );

    if (!target) {
      throw new NotFoundException('Account not found');
    }

    const subscriber = await this.revenueCatClient.getSubscriber(accountId);
    const mutation = await this.toSubscriberMutation(
      target,
      subscriber,
      accountId,
    );

    await this.subscriptionRepository.applyRevenueCatMutations([mutation]);

    return this.getEntitlements(accountId);
  }

  private async getUsage(accountId: string): Promise<EntitlementUsage> {
    const now = dayjs();
    return this.getUsageForMonth(accountId, now.toDate());
  }

  private async getEntitlementsForMonth(accountId: string, date: Date) {
    const plan = await this.getCurrentPlan(accountId);
    const usage = await this.getUsageForMonth(accountId, date);
    const limits = SUBSCRIPTION_LIMITS[plan.tier];

    return {
      ...plan,
      limits,
      usage,
    };
  }

  private async getUsageForMonth(
    accountId: string,
    date: Date,
  ): Promise<EntitlementUsage> {
    const month = dayjs(date);
    const monthStart = month.startOf('month').toDate();
    const monthEnd = month.endOf('month').toDate();
    const periodKey = month.format('YYYY-MM');

    const [
      pets,
      activeReminders,
      medicalRecords,
      budgetTransactionsThisMonth,
      photos,
      aiMessagesUsage,
    ] = await Promise.all([
      this.subscriptionRepository.countPets(accountId),
      this.subscriptionRepository.countActiveReminders(accountId),
      this.subscriptionRepository.countMedicalRecords(accountId),
      this.subscriptionRepository.countBudgetTransactionsThisMonth(
        accountId,
        monthStart,
        monthEnd,
      ),
      this.subscriptionRepository.countPhotos(accountId),
      this.subscriptionRepository.getUsageCount(
        accountId,
        SUBSCRIPTION_FEATURE_KEYS.aiMessages,
        periodKey,
      ),
    ]);

    return {
      pets,
      activeReminders,
      medicalRecords,
      budgetTransactionsThisMonth,
      photos,
      aiMessagesThisMonth: aiMessagesUsage?.count ?? 0,
    };
  }

  private resolveStatus(
    account: accounts,
    subscriptionStatus?: subscription_status,
  ): subscription_status {
    if (subscriptionStatus) {
      if (
        (subscriptionStatus === subscription_status.active ||
          subscriptionStatus === subscription_status.trialing ||
          subscriptionStatus === subscription_status.grace_period) &&
        account.subscription_expires_at &&
        account.subscription_expires_at.getTime() <= Date.now()
      ) {
        return subscription_status.expired;
      }

      return subscriptionStatus;
    }

    if (
      account.subscription === subscription_tier.premium &&
      (!account.subscription_expires_at ||
        account.subscription_expires_at.getTime() > Date.now())
    ) {
      return subscription_status.active;
    }

    return subscription_status.free;
  }

  private assertMockSubscriptionAllowed(): void {
    const environment =
      this.configService.get<string>('NODE_ENV') ?? 'development';

    if (environment === 'production') {
      throw new BadRequestException(
        'Mock subscription endpoints are disabled in production',
      );
    }
  }

  private assertAuthorized(authorizationHeader?: string): void {
    const secret = this.configService.get<string>('REVENUECAT_WEBHOOK_SECRET');

    if (!secret) {
      throw new UnauthorizedException(
        'RevenueCat webhook secret is not configured',
      );
    }

    const actual = authorizationHeader?.trim();

    if (!actual) {
      throw new UnauthorizedException(
        'Missing RevenueCat authorization header',
      );
    }

    const expectedHeaders = new Set([secret, `Bearer ${secret}`]);

    for (const expected of expectedHeaders) {
      if (this.secureEquals(actual, expected)) {
        return;
      }
    }

    throw new UnauthorizedException('Invalid RevenueCat authorization header');
  }

  private secureEquals(actual: string, expected: string): boolean {
    const actualBuffer = Buffer.from(actual);
    const expectedBuffer = Buffer.from(expected);

    if (actualBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(actualBuffer, expectedBuffer);
  }

  private parseEvent(
    payload: RevenueCatWebhookPayload,
  ): ParsedRevenueCatWebhookEvent {
    const event = payload.event;

    if (
      !event?.id ||
      !event.type ||
      event.event_timestamp_ms === undefined ||
      !Number.isSafeInteger(event.event_timestamp_ms)
    ) {
      throw new BadRequestException('Invalid RevenueCat webhook payload');
    }

    return event as ParsedRevenueCatWebhookEvent;
  }

  private async processTransferEvent(
    event: ParsedRevenueCatWebhookEvent,
  ): Promise<RevenueCatWebhookResult> {
    const transferredFrom = [...new Set(event.transferred_from ?? [])];
    const transferredTo = [...new Set(event.transferred_to ?? [])];

    if (transferredFrom.length === 0 || transferredTo.length === 0) {
      return this.ignored(event, 'invalid_transfer_event');
    }

    const [sourceTargets, destinationTargets] = await Promise.all([
      this.subscriptionRepository.findRevenueCatTargets(transferredFrom),
      this.subscriptionRepository.findRevenueCatTargets(transferredTo),
    ]);

    const targetEntries = [
      ...sourceTargets.map((target) => ({ ids: transferredFrom, target })),
      ...destinationTargets.map((target) => ({ ids: transferredTo, target })),
    ];
    const uniqueTargets = new Map<
      string,
      { ids: string[]; target: RevenueCatSubscriptionTarget }
    >();

    for (const entry of targetEntries) {
      uniqueTargets.set(entry.target.account.id, entry);
    }

    const mutations: RevenueCatSubscriptionMutation[] = [];

    for (const { ids, target } of uniqueTargets.values()) {
      if (this.getEventSkipReason(target, event)) {
        continue;
      }

      const appUserId = this.pickRevenueCatId(target, ids);
      const subscriber = await this.revenueCatClient.getSubscriber(appUserId);
      const mutation = await this.toSubscriberMutation(
        target,
        subscriber,
        appUserId,
      );

      mutations.push(this.withEventIdentity(mutation, event));
    }

    if (mutations.length === 0) {
      const reason =
        uniqueTargets.size === 0 ? 'account_not_found' : 'stale_event';

      if (reason === 'account_not_found') {
        this.logger.warn(`No accounts matched RevenueCat transfer ${event.id}`);
      }

      return this.ignored(event, reason);
    }

    await this.subscriptionRepository.applyRevenueCatMutations(mutations);

    return {
      eventId: event.id,
      eventType: event.type,
      processed: true,
    };
  }

  private async toWebhookMutation(
    target: RevenueCatSubscriptionTarget,
    event: ParsedRevenueCatWebhookEvent,
  ): Promise<RevenueCatSubscriptionMutation | null> {
    const eventAt = this.fromMs(event.event_timestamp_ms);
    const expiresAt = this.fromNullableMs(event.expiration_at_ms);
    const planCode = await this.resolvePlanCode(
      event.new_product_id ?? event.product_id,
      subscription_tier.premium,
    );
    const base = this.webhookMutationBase(target, event);

    switch (event.type) {
      case REVENUECAT_SUBSCRIPTION_EVENTS.INITIAL_PURCHASE:
        if (!expiresAt) return null;
        return {
          ...base,
          accountExpiresAt: expiresAt,
          accountTier: subscription_tier.premium,
          cancelledAt: null,
          expiresAt,
          planCode,
          startedAt: this.fromNullableMs(event.purchased_at_ms) ?? eventAt,
          status:
            event.period_type === 'TRIAL'
              ? subscription_status.trialing
              : subscription_status.active,
        };

      case REVENUECAT_SUBSCRIPTION_EVENTS.RENEWAL:
        if (!expiresAt) return null;
        return {
          ...base,
          accountExpiresAt: expiresAt,
          accountTier: subscription_tier.premium,
          cancelledAt: null,
          expiresAt,
          planCode,
          status: subscription_status.active,
        };

      case REVENUECAT_SUBSCRIPTION_EVENTS.CANCELLATION: {
        const immediateRevocation = ['CUSTOMER_SUPPORT', 'FRAUD'].includes(
          event.cancel_reason ?? '',
        );

        if (immediateRevocation) {
          const verified = await this.toVerifiedSubscriberMutation(
            target,
            event,
          );

          return {
            ...verified,
            cancelledAt: eventAt,
            status:
              verified.accountTier === subscription_tier.free
                ? subscription_status.cancelled
                : verified.status,
          };
        }

        return {
          ...base,
          accountExpiresAt: expiresAt ?? undefined,
          accountTier: subscription_tier.premium,
          cancelledAt: eventAt,
          expiresAt: expiresAt ?? undefined,
          status: subscription_status.active,
        };
      }

      case REVENUECAT_SUBSCRIPTION_EVENTS.EXPIRATION: {
        const verified = await this.toVerifiedSubscriberMutation(target, event);
        return {
          ...verified,
          capUsageCounters:
            verified.accountTier === subscription_tier.free
              ? FREE_USAGE_COUNTER_LIMITS
              : undefined,
          status:
            verified.accountTier === subscription_tier.free
              ? subscription_status.expired
              : verified.status,
        };
      }

      case REVENUECAT_SUBSCRIPTION_EVENTS.UNCANCELLATION:
        return {
          ...base,
          accountExpiresAt: expiresAt ?? undefined,
          accountTier: subscription_tier.premium,
          cancelledAt: null,
          expiresAt: expiresAt ?? undefined,
          status: subscription_status.active,
        };

      case REVENUECAT_SUBSCRIPTION_EVENTS.BILLING_ISSUE: {
        const gracePeriodEndsAt = this.fromNullableMs(
          event.grace_period_expiration_at_ms,
        );
        const accessEndsAt = gracePeriodEndsAt ?? expiresAt;

        return {
          ...base,
          accountExpiresAt: accessEndsAt ?? undefined,
          accountTier: subscription_tier.premium,
          expiresAt: accessEndsAt ?? undefined,
          status:
            gracePeriodEndsAt && gracePeriodEndsAt.getTime() > Date.now()
              ? subscription_status.grace_period
              : subscription_status.active,
        };
      }

      case REVENUECAT_SUBSCRIPTION_EVENTS.PRODUCT_CHANGE:
        return {
          ...base,
          accountExpiresAt: expiresAt ?? undefined,
          accountTier: subscription_tier.premium,
          expiresAt: expiresAt ?? undefined,
          planCode,
          status: subscription_status.active,
        };

      case REVENUECAT_SUBSCRIPTION_EVENTS.SUBSCRIPTION_EXTENDED:
      case REVENUECAT_SUBSCRIPTION_EVENTS.TEMPORARY_ENTITLEMENT_GRANT:
        if (!expiresAt) return null;
        return {
          ...base,
          accountExpiresAt: expiresAt,
          accountTier: subscription_tier.premium,
          expiresAt,
          planCode,
          status: subscription_status.active,
        };

      default:
        return null;
    }
  }

  private async toVerifiedSubscriberMutation(
    target: RevenueCatSubscriptionTarget,
    event: ParsedRevenueCatWebhookEvent,
  ): Promise<RevenueCatSubscriptionMutation> {
    const ids = this.extractRevenueCatIds(event);
    const appUserId = this.pickRevenueCatId(target, ids);
    const subscriber = await this.revenueCatClient.getSubscriber(appUserId);
    const mutation = await this.toSubscriberMutation(
      target,
      subscriber,
      appUserId,
    );

    return this.withEventIdentity(mutation, event);
  }

  private async toSubscriberMutation(
    target: RevenueCatSubscriptionTarget,
    response: RevenueCatSubscriberResponse,
    appUserId: string,
  ): Promise<RevenueCatSubscriptionMutation> {
    const now = new Date();
    const entitlements = Object.entries(response.subscriber.entitlements ?? {});
    const configuredEntitlementId = this.configService.get<string>(
      'REVENUECAT_PREMIUM_ENTITLEMENT_ID',
    );
    const entitlementEntry = configuredEntitlementId
      ? entitlements.find(([id]) => id === configuredEntitlementId)
      : entitlements.find(([, entitlement]) =>
          this.isEntitlementActive(entitlement, now),
        );
    const entitlement = entitlementEntry?.[1];
    const productId = entitlement?.product_identifier ?? undefined;
    const subscription = productId
      ? response.subscriber.subscriptions?.[productId]
      : undefined;
    const entitlementExpiresAt = this.fromIso(entitlement?.expires_date);
    const entitlementGraceEndsAt = this.fromIso(
      entitlement?.grace_period_expires_date,
    );
    const subscriptionExpiresAt = this.fromIso(subscription?.expires_date);
    const subscriptionGraceEndsAt = this.fromIso(
      subscription?.grace_period_expires_date,
    );
    const accessEndsAt = this.latestDate(
      entitlementExpiresAt,
      entitlementGraceEndsAt,
      subscriptionExpiresAt,
      subscriptionGraceEndsAt,
    );
    const isLifetime = Boolean(
      entitlement &&
      !entitlement.expires_date &&
      !entitlement.grace_period_expires_date,
    );
    const isActive = Boolean(
      entitlement &&
      (isLifetime || (accessEndsAt && accessEndsAt.getTime() > now.getTime())),
    );
    const inGracePeriod = Boolean(
      isActive &&
      (entitlementGraceEndsAt ?? subscriptionGraceEndsAt) &&
      entitlementExpiresAt &&
      entitlementExpiresAt.getTime() <= now.getTime(),
    );
    const accountTier = isActive
      ? subscription_tier.premium
      : subscription_tier.free;
    const status = isActive
      ? inGracePeriod
        ? subscription_status.grace_period
        : subscription?.period_type?.toUpperCase() === 'TRIAL'
          ? subscription_status.trialing
          : subscription_status.active
      : target.subscription
        ? subscription_status.expired
        : subscription_status.free;
    const planCode = productId
      ? await this.resolvePlanCode(productId, subscription_tier.premium)
      : (target.subscription?.plan_code ?? 'free');

    return {
      accountExpiresAt: isActive ? accessEndsAt : null,
      accountId: target.account.id,
      accountTier,
      cancelledAt: this.fromIso(subscription?.unsubscribe_detected_at),
      expiresAt:
        entitlement || subscription
          ? accessEndsAt
          : (target.subscription?.expires_at ?? null),
      planCode,
      providerCustomerId: appUserId,
      providerOriginalId:
        response.subscriber.original_app_user_id ??
        target.subscription?.provider_original_id ??
        null,
      startedAt:
        this.fromIso(entitlement?.purchase_date) ??
        this.fromIso(subscription?.purchase_date) ??
        undefined,
      status,
      subscriptionId: target.subscription?.id,
    };
  }

  private webhookMutationBase(
    target: RevenueCatSubscriptionTarget,
    event: ParsedRevenueCatWebhookEvent,
  ): RevenueCatSubscriptionMutation {
    return {
      accountId: target.account.id,
      accountTier: target.account.subscription,
      lastRcEventAt: BigInt(event.event_timestamp_ms),
      lastRcEventId: event.id,
      providerCustomerId: event.app_user_id,
      providerOriginalId: event.original_app_user_id,
      status: target.subscription?.status ?? subscription_status.free,
      subscriptionId: target.subscription?.id,
    };
  }

  private withEventIdentity(
    mutation: RevenueCatSubscriptionMutation,
    event: ParsedRevenueCatWebhookEvent,
  ): RevenueCatSubscriptionMutation {
    return {
      ...mutation,
      lastRcEventAt: BigInt(event.event_timestamp_ms),
      lastRcEventId: event.id,
    };
  }

  private getEventSkipReason(
    target: RevenueCatSubscriptionTarget,
    event: ParsedRevenueCatWebhookEvent,
  ): 'duplicate_event' | 'stale_event' | null {
    if (target.subscription?.last_rc_event_id === event.id) {
      return 'duplicate_event';
    }

    const lastEventAt = target.subscription?.last_rc_event_at;

    if (
      lastEventAt !== null &&
      lastEventAt !== undefined &&
      lastEventAt > BigInt(event.event_timestamp_ms)
    ) {
      return 'stale_event';
    }

    return null;
  }

  private async resolvePlanCode(
    productId: string | null | undefined,
    tier: subscription_tier,
  ): Promise<string> {
    const exactPlanCode =
      await this.subscriptionRepository.findActivePlanCode(productId);

    if (exactPlanCode) {
      return exactPlanCode;
    }

    if (tier === subscription_tier.free) {
      return 'free';
    }

    return productId && /(annual|year)/i.test(productId)
      ? 'premium_yearly'
      : 'premium_monthly';
  }

  private pickRevenueCatId(
    target: RevenueCatSubscriptionTarget,
    ids: string[],
  ): string {
    return (
      ids.find((id) => id === target.account.id) ??
      ids.find((id) => id === target.subscription?.provider_customer_id) ??
      ids.find((id) => id === target.subscription?.provider_original_id) ??
      ids[0] ??
      target.account.id
    );
  }

  private isEntitlementActive(
    entitlement: {
      expires_date?: string | null;
      grace_period_expires_date?: string | null;
    },
    now: Date,
  ): boolean {
    if (!entitlement.expires_date && !entitlement.grace_period_expires_date) {
      return true;
    }

    const accessEndsAt = this.latestDate(
      this.fromIso(entitlement.expires_date),
      this.fromIso(entitlement.grace_period_expires_date),
    );

    return Boolean(accessEndsAt && accessEndsAt.getTime() > now.getTime());
  }

  private latestDate(...dates: Array<Date | null>): Date | null {
    return dates.reduce<Date | null>((latest, date) => {
      if (!date || (latest && latest.getTime() >= date.getTime())) {
        return latest;
      }

      return date;
    }, null);
  }

  private fromIso(value?: string | null): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private matchesConfiguredEntitlement(event: RevenueCatWebhookEvent): boolean {
    const entitlementId = this.configService.get<string>(
      'REVENUECAT_PREMIUM_ENTITLEMENT_ID',
    );

    if (!entitlementId) {
      return true;
    }

    const eventEntitlements = [
      event.entitlement_id,
      ...(event.entitlement_ids ?? []),
    ].filter((id): id is string => Boolean(id));

    return (
      eventEntitlements.length === 0 ||
      eventEntitlements.includes(entitlementId)
    );
  }

  private extractRevenueCatIds(event: RevenueCatWebhookEvent): string[] {
    return [
      event.app_user_id,
      event.original_app_user_id,
      ...(event.aliases ?? []),
    ]
      .filter((id): id is string => Boolean(id))
      .filter((id, index, ids) => ids.indexOf(id) === index);
  }

  private fromMs(value: number): Date {
    return new Date(value);
  }

  private fromNullableMs(value?: number | null): Date | null {
    if (value === undefined || value === null) {
      return null;
    }

    return this.fromMs(value);
  }

  private ignored(
    event: RevenueCatWebhookEvent,
    reason: string,
    accountId?: string,
  ): RevenueCatWebhookResult {
    return {
      accountId,
      eventId: event.id,
      eventType: event.type,
      processed: false,
      reason,
    };
  }
}
