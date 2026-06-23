import { PrismaService } from '@app/database/prisma/prisma.service';
import {
  accounts,
  subscription_provider,
  subscription_status,
  subscription_tier,
  user_subscriptions,
} from '@app/generated/prisma/client';
import { Injectable } from '@nestjs/common';

export interface RevenueCatSubscriptionTarget {
  account: accounts;
  subscription: user_subscriptions | null;
}

export interface RevenueCatSubscriptionMutation {
  accountExpiresAt?: Date | null;
  accountId: string;
  accountTier: subscription_tier;
  cancelledAt?: Date | null;
  capUsageCounters?: Record<string, number>;
  expiresAt?: Date | null;
  lastRcEventAt?: bigint;
  lastRcEventId?: string;
  planCode?: string;
  providerCustomerId?: string | null;
  providerOriginalId?: string | null;
  startedAt?: Date | null;
  status: subscription_status;
  subscriptionId?: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRevenueCatTarget(
    userIds: string[],
  ): Promise<RevenueCatSubscriptionTarget | null> {
    const targets = await this.findRevenueCatTargets(userIds);
    return targets[0] ?? null;
  }

  async findRevenueCatTargets(
    userIds: string[],
  ): Promise<RevenueCatSubscriptionTarget[]> {
    const uniqueIds = [...new Set(userIds.filter(Boolean))];

    if (uniqueIds.length === 0) {
      return [];
    }

    const subscriptions = await this.prisma.user_subscriptions.findMany({
      where: {
        provider: subscription_provider.revenuecat,
        OR: [
          { provider_customer_id: { in: uniqueIds } },
          { provider_original_id: { in: uniqueIds } },
        ],
      },
      include: { accounts: true },
      orderBy: { updated_at: 'desc' },
    });

    const targetsByAccount = new Map<string, RevenueCatSubscriptionTarget>();

    for (const subscription of subscriptions) {
      if (!targetsByAccount.has(subscription.account_id)) {
        targetsByAccount.set(subscription.account_id, {
          account: subscription.accounts,
          subscription,
        });
      }
    }

    const accountIds = uniqueIds.filter((id) => UUID_PATTERN.test(id));
    const missingAccountIds = accountIds.filter(
      (accountId) => !targetsByAccount.has(accountId),
    );

    if (missingAccountIds.length > 0) {
      const accounts = await this.prisma.accounts.findMany({
        where: { id: { in: missingAccountIds } },
      });

      for (const account of accounts) {
        const subscription = await this.prisma.user_subscriptions.findFirst({
          where: {
            account_id: account.id,
            provider: subscription_provider.revenuecat,
          },
          orderBy: { updated_at: 'desc' },
        });

        targetsByAccount.set(account.id, { account, subscription });
      }
    }

    return [...targetsByAccount.values()];
  }

  async findRevenueCatTargetForAccount(
    accountId: string,
  ): Promise<RevenueCatSubscriptionTarget | null> {
    const account = await this.findAccountById(accountId);

    if (!account) {
      return null;
    }

    const subscription = await this.prisma.user_subscriptions.findFirst({
      where: {
        account_id: accountId,
        provider: subscription_provider.revenuecat,
      },
      orderBy: { updated_at: 'desc' },
    });

    return { account, subscription };
  }

  async findActivePlanCode(productId?: string | null): Promise<string | null> {
    if (!productId) {
      return null;
    }

    const plan = await this.prisma.subscription_plans.findFirst({
      where: { code: productId, is_active: true },
      select: { code: true },
    });

    return plan?.code ?? null;
  }

  async applyRevenueCatMutations(
    mutations: RevenueCatSubscriptionMutation[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const mutation of mutations) {
        const now = new Date();
        const subscriptionData = {
          provider: subscription_provider.revenuecat,
          status: mutation.status,
          updated_at: now,
          ...(mutation.planCode === undefined
            ? {}
            : { plan_code: mutation.planCode }),
          ...(mutation.providerCustomerId === undefined
            ? {}
            : { provider_customer_id: mutation.providerCustomerId }),
          ...(mutation.providerOriginalId === undefined
            ? {}
            : { provider_original_id: mutation.providerOriginalId }),
          ...(mutation.startedAt === undefined
            ? {}
            : { started_at: mutation.startedAt }),
          ...(mutation.expiresAt === undefined
            ? {}
            : { expires_at: mutation.expiresAt }),
          ...(mutation.cancelledAt === undefined
            ? {}
            : { cancelled_at: mutation.cancelledAt }),
          ...(mutation.lastRcEventId === undefined
            ? {}
            : { last_rc_event_id: mutation.lastRcEventId }),
          ...(mutation.lastRcEventAt === undefined
            ? {}
            : { last_rc_event_at: mutation.lastRcEventAt }),
        };

        if (mutation.subscriptionId) {
          if (mutation.lastRcEventAt !== undefined && mutation.lastRcEventId) {
            const update = await tx.user_subscriptions.updateMany({
              where: {
                id: mutation.subscriptionId,
                AND: [
                  {
                    OR: [
                      { last_rc_event_id: null },
                      { last_rc_event_id: { not: mutation.lastRcEventId } },
                    ],
                  },
                  {
                    OR: [
                      { last_rc_event_at: null },
                      { last_rc_event_at: { lte: mutation.lastRcEventAt } },
                    ],
                  },
                ],
              },
              data: subscriptionData,
            });

            if (update.count === 0) {
              continue;
            }
          } else {
            await tx.user_subscriptions.update({
              where: { id: mutation.subscriptionId },
              data: subscriptionData,
            });
          }
        } else {
          await tx.user_subscriptions.create({
            data: {
              account_id: mutation.accountId,
              plan_code:
                mutation.planCode ??
                (mutation.accountTier === subscription_tier.premium
                  ? 'premium_monthly'
                  : 'free'),
              ...subscriptionData,
            },
          });
        }

        await tx.accounts.update({
          where: { id: mutation.accountId },
          data: {
            subscription: mutation.accountTier,
            updated_at: now,
            ...(mutation.accountExpiresAt === undefined
              ? {}
              : { subscription_expires_at: mutation.accountExpiresAt }),
          },
        });

        if (mutation.capUsageCounters) {
          const counters = await tx.usage_counters.findMany({
            where: {
              account_id: mutation.accountId,
              feature_key: {
                in: Object.keys(mutation.capUsageCounters),
              },
            },
          });

          for (const counter of counters) {
            const limit = mutation.capUsageCounters[counter.feature_key];

            if (limit !== undefined && counter.count > limit) {
              await tx.usage_counters.update({
                where: { id: counter.id },
                data: { count: limit, updated_at: now },
              });
            }
          }
        }
      }
    });
  }

  findLatestUserSubscription(
    accountId: string,
  ): Promise<user_subscriptions | null> {
    return this.prisma.user_subscriptions.findFirst({
      where: { account_id: accountId },
      orderBy: { updated_at: 'desc' },
    });
  }

  findAccountById(accountId: string): Promise<accounts | null> {
    return this.prisma.accounts.findUnique({
      where: { id: accountId },
    });
  }

  async setManualSubscription(
    accountId: string,
    tier: subscription_tier,
  ): Promise<user_subscriptions> {
    const now = new Date();
    const planCode =
      tier === subscription_tier.premium ? 'premium_monthly' : 'free';
    const status =
      tier === subscription_tier.premium
        ? subscription_status.active
        : subscription_status.free;

    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.user_subscriptions.create({
        data: {
          account_id: accountId,
          plan_code: planCode,
          provider: subscription_provider.manual,
          status,
          started_at: tier === subscription_tier.premium ? now : null,
          expires_at: null,
          cancelled_at: tier === subscription_tier.free ? now : null,
        },
      });

      await tx.accounts.update({
        where: { id: accountId },
        data: {
          subscription: tier,
          subscription_expires_at: null,
          updated_at: now,
        },
      });

      return subscription;
    });
  }

  countPets(accountId: string): Promise<number> {
    return this.prisma.pets.count({
      where: {
        account_id: accountId,
        deleted_at: null,
      },
    });
  }

  countActiveReminders(accountId: string): Promise<number> {
    return this.prisma.reminders.count({
      where: {
        account_id: accountId,
        status: {
          in: ['pending', 'sent'],
        },
      },
    });
  }

  countMedicalRecords(accountId: string): Promise<number> {
    return this.prisma.medical_records.count({
      where: {
        deleted_at: null,
        pets: {
          account_id: accountId,
        },
      },
    });
  }

  countBudgetTransactionsThisMonth(
    accountId: string,
    start: Date,
    end: Date,
  ): Promise<number> {
    return this.prisma.budget_transactions.count({
      where: {
        account_id: accountId,
        deleted_at: null,
        date: {
          gte: start,
          lte: end,
        },
      },
    });
  }

  countPhotos(accountId: string): Promise<number> {
    return this.prisma.photos.count({
      where: {
        account_id: accountId,
        deleted_at: null,
        status: {
          not: 'failed',
        },
      },
    });
  }

  getUsageCount(
    accountId: string,
    featureKey: string,
    periodKey: string,
  ): Promise<{ count: number } | null> {
    return this.prisma.usage_counters.findUnique({
      where: {
        account_id_feature_key_period_key: {
          account_id: accountId,
          feature_key: featureKey,
          period_key: periodKey,
        },
      },
      select: {
        count: true,
      },
    });
  }

  async incrementUsage(
    accountId: string,
    featureKey: string,
    periodKey: string,
    resetAt: Date,
  ): Promise<number> {
    const usage = await this.prisma.usage_counters.upsert({
      where: {
        account_id_feature_key_period_key: {
          account_id: accountId,
          feature_key: featureKey,
          period_key: periodKey,
        },
      },
      create: {
        account_id: accountId,
        feature_key: featureKey,
        period_key: periodKey,
        reset_at: resetAt,
        count: 1,
      },
      update: {
        count: { increment: 1 },
        updated_at: new Date(),
      },
    });

    return usage.count;
  }
}
