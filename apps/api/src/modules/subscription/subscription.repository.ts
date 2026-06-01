import { PrismaService } from '@app/database/prisma/prisma.service';
import { accounts, subscription_tier } from '@app/generated/prisma/client';
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
    return this.prisma.accounts.update({
      where: { id: accountId },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }
}
