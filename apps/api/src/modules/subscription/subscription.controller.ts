import { Public } from '@app/decorators/public.decorator';
import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@app/decorators/current-user.decorator';
import type { accounts } from '@app/generated/prisma/client';
import { RevenueCatWebhookAck } from './revenuecat-webhook.interface';
import type { RevenueCatWebhookPayload } from './revenuecat-webhook.interface';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscription')
@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('subscriptions/me')
  @HttpCode(HttpStatus.OK)
  findMine(@CurrentUser() user: accounts) {
    return this.subscriptionService.getEntitlements(user.id);
  }

  @Get('subscriptions/entitlements')
  @HttpCode(HttpStatus.OK)
  getEntitlements(@CurrentUser() user: accounts) {
    return this.subscriptionService.getEntitlements(user.id);
  }

  @Post('subscriptions/mock-upgrade')
  @HttpCode(HttpStatus.OK)
  mockUpgrade(@CurrentUser() user: accounts) {
    return this.subscriptionService.mockUpgrade(user.id);
  }

  @Post('subscriptions/mock-downgrade')
  @HttpCode(HttpStatus.OK)
  mockDowngrade(@CurrentUser() user: accounts) {
    return this.subscriptionService.mockDowngrade(user.id);
  }

  @Post('subscriptions/sync')
  @HttpCode(HttpStatus.OK)
  sync(@CurrentUser() user: accounts) {
    return this.subscriptionService.syncRevenueCatSubscription(user.id);
  }

  @Public()
  @Post([
    'subscription/webhook',
    'subscriptions/webhook',
    'subscriptions/webhooks/revenuecat',
  ])
  @HttpCode(HttpStatus.OK)
  handleRevenueCatWebhook(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Body() payload: RevenueCatWebhookPayload,
  ): Promise<RevenueCatWebhookAck> {
    return this.subscriptionService.enqueueRevenueCatWebhook(
      payload,
      authorizationHeader,
    );
  }
}
