import { PrismaService } from '@app/database/prisma/prisma.service';
import {
  accounts,
  subscription_provider,
  subscription_status,
  subscription_tier,
  user_subscriptions,
} from '@app/generated/prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAccountByRevenueCatUserIds(userIds: string[]): Promise<accounts | null> {
    return this.prisma.accounts.findFirst({
      where: {
        id: {
          in: userIds,
        },
      },
    });
  }

  updateSubscription(
    accountId: string,
    data: {
      subscription: subscription_tier;
      subscription_expires_at: Date | null;
    },
  ): Promise<accounts> {
    const status =
      data.subscription === subscription_tier.premium
        ? subscription_status.active
        : subscription_status.expired;

    return this.prisma.$transaction(async (tx) => {
      await tx.user_subscriptions.create({
        data: {
          account_id: accountId,
          plan_code:
            data.subscription === subscription_tier.premium
              ? 'premium_monthly'
              : 'free',
          provider: subscription_provider.revenuecat,
          status,
          started_at:
            data.subscription === subscription_tier.premium ? new Date() : null,
          expires_at: data.subscription_expires_at,
        },
      });

      return tx.accounts.update({
        where: { id: accountId },
        data: {
          ...data,
          updated_at: new Date(),
        },
      });
    });
  }

  findLatestUserSubscription(
    accountId: string,
  ): Promise<user_subscriptions | null> {
    return this.prisma.user_subscriptions.findFirst({
      where: { account_id: accountId },
      orderBy: { created_at: 'desc' },
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
