import {
  accounts,
  subscription_status,
  subscription_tier,
} from '@app/generated/prisma/client';
import { timingSafeEqual } from 'crypto';
import dayjs from 'dayjs';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  REVENUECAT_SUBSCRIPTION_EVENTS,
  RevenueCatWebhookEvent,
  RevenueCatWebhookPayload,
  RevenueCatWebhookResult,
} from './revenuecat-webhook.interface';
import {
  SUBSCRIPTION_FEATURE_KEYS,
  SUBSCRIPTION_LIMITS,
} from './subscription-limits';
import { SubscriptionRepository } from './subscription.repository';

interface SubscriptionUpdate {
  guardAt: Date;
  subscription: subscription_tier;
  subscription_expires_at: Date | null;
}

type ParsedRevenueCatWebhookEvent = RevenueCatWebhookEvent & {
  event_timestamp_ms: number;
  type: string;
};

export interface EntitlementUsage {
  pets: number;
  activeReminders: number;
  medicalRecords: number;
  budgetTransactionsThisMonth: number;
  photos: number;
  aiMessagesThisMonth: number;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly configService: ConfigService,
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
          message: 'Free plan pet limit reached',
          feature: 'pets',
          limit,
          usage: entitlements.usage.pets,
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
          message: 'AI monthly quota reached',
          feature: SUBSCRIPTION_FEATURE_KEYS.aiMessages,
          limit,
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

  async handleRevenueCatWebhook(
    payload: RevenueCatWebhookPayload,
    authorizationHeader?: string,
  ): Promise<RevenueCatWebhookResult> {
    this.assertAuthorized(authorizationHeader);

    const event = this.parseEvent(payload);
    const update = this.toSubscriptionUpdate(event);

    if (!update) {
      return this.ignored(event, 'event_type_ignored');
    }

    if (!this.matchesConfiguredEntitlement(event)) {
      return this.ignored(event, 'entitlement_ignored');
    }

    const accountIds = this.extractAccountIds(event);

    if (accountIds.length === 0) {
      return this.ignored(event, 'no_matching_account_id');
    }

    const account =
      await this.subscriptionRepository.findAccountByRevenueCatUserIds(
        accountIds,
      );

    if (!account) {
      return this.ignored(event, 'account_not_found');
    }

    if (!this.shouldApply(account.subscription_expires_at, update.guardAt)) {
      return this.ignored(event, 'stale_event', account.id);
    }

    await this.subscriptionRepository.updateSubscription(account.id, {
      subscription: update.subscription,
      subscription_expires_at: update.subscription_expires_at,
    });

    return {
      accountId: account.id,
      eventId: event.id,
      eventType: event.type,
      processed: true,
    };
  }

  private async getUsage(accountId: string): Promise<EntitlementUsage> {
    const now = dayjs();
    const monthStart = now.startOf('month').toDate();
    const monthEnd = now.endOf('month').toDate();
    const periodKey = now.format('YYYY-MM');

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
        subscriptionStatus === subscription_status.active &&
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
    if (!payload.event?.type || !payload.event.event_timestamp_ms) {
      throw new BadRequestException('Invalid RevenueCat webhook payload');
    }

    return payload.event as ParsedRevenueCatWebhookEvent;
  }

  private toSubscriptionUpdate(
    event: ParsedRevenueCatWebhookEvent,
  ): SubscriptionUpdate | null {
    if (event.type === REVENUECAT_SUBSCRIPTION_EVENTS.EXPIRATION) {
      const eventTimestamp = this.fromMs(event.event_timestamp_ms);

      return {
        guardAt: eventTimestamp,
        subscription: subscription_tier.free,
        subscription_expires_at:
          this.fromNullableMs(event.expiration_at_ms) ?? eventTimestamp,
      };
    }

    if (!this.isPremiumEvent(event.type)) {
      return null;
    }

    const expiresAt = this.fromNullableMs(event.expiration_at_ms);

    if (!expiresAt) {
      return null;
    }

    return {
      guardAt: expiresAt,
      subscription:
        expiresAt.getTime() > Date.now()
          ? subscription_tier.premium
          : subscription_tier.free,
      subscription_expires_at: expiresAt,
    };
  }

  private isPremiumEvent(type?: string): boolean {
    return (
      type === REVENUECAT_SUBSCRIPTION_EVENTS.INITIAL_PURCHASE ||
      type === REVENUECAT_SUBSCRIPTION_EVENTS.RENEWAL ||
      type === REVENUECAT_SUBSCRIPTION_EVENTS.PRODUCT_CHANGE ||
      type === REVENUECAT_SUBSCRIPTION_EVENTS.SUBSCRIPTION_EXTENDED ||
      type === REVENUECAT_SUBSCRIPTION_EVENTS.TEMPORARY_ENTITLEMENT_GRANT ||
      type === REVENUECAT_SUBSCRIPTION_EVENTS.UNCANCELLATION
    );
  }

  private matchesConfiguredEntitlement(event: RevenueCatWebhookEvent): boolean {
    const entitlementId = this.configService.get<string>(
      'REVENUECAT_PREMIUM_ENTITLEMENT_ID',
    );

    if (!entitlementId) {
      return true;
    }

    const hasDeprecatedEntitlement = event.entitlement_id === entitlementId;
    const hasEntitlement = event.entitlement_ids?.includes(entitlementId);

    return Boolean(hasDeprecatedEntitlement || hasEntitlement);
  }

  private extractAccountIds(event: RevenueCatWebhookEvent): string[] {
    return [
      event.app_user_id,
      event.original_app_user_id,
      ...(event.aliases ?? []),
    ]
      .filter((id): id is string => Boolean(id))
      .filter((id, index, ids) => ids.indexOf(id) === index)
      .filter((id) => UUID_PATTERN.test(id));
  }

  private shouldApply(
    currentExpiresAt: Date | null,
    incomingGuardAt: Date,
  ): boolean {
    if (!currentExpiresAt) {
      return true;
    }

    return incomingGuardAt.getTime() > currentExpiresAt.getTime();
  }

  private fromMs(value: number): Date {
    return new Date(value);
  }

  private fromNullableMs(value?: number | null): Date | null {
    if (!value) {
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
