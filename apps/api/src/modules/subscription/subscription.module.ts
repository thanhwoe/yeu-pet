import { Module } from '@nestjs/common';
import { RevenueCatWebhookProcessor } from './revenuecat-webhook.processor';
import { RevenueCatClient } from './revenuecat.client';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionService } from './subscription.service';

@Module({
  controllers: [SubscriptionController],
  providers: [
    RevenueCatClient,
    RevenueCatWebhookProcessor,
    SubscriptionRepository,
    SubscriptionService,
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
