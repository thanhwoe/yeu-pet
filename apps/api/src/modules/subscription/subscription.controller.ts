import { Public } from '@app/decorators/public.decorator';
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RevenueCatWebhookResult } from './revenuecat-webhook.interface';
import type { RevenueCatWebhookPayload } from './revenuecat-webhook.interface';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleRevenueCatWebhook(
    @Headers('authorization') authorizationHeader: string | undefined,
    @Body() payload: RevenueCatWebhookPayload,
  ): Promise<RevenueCatWebhookResult> {
    return this.subscriptionService.handleRevenueCatWebhook(
      payload,
      authorizationHeader,
    );
  }
}
