import { REQUIRED_SUBSCRIPTION_KEY } from '@app/decorators/require-subscription.decorator';
import { API_ERROR_CODES } from '@app/errors/api-error-codes';
import { accounts, subscription_tier } from '@app/generated/prisma/client';
import { SubscriptionService } from '@app/modules/subscription/subscription.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.getAllAndOverride<subscription_tier>(
      REQUIRED_SUBSCRIPTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredTier) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: accounts }>();

    if (!request.user) {
      return false;
    }

    const plan = await this.subscriptionService.getCurrentPlan(request.user.id);

    if (plan.tier !== requiredTier) {
      throw new ForbiddenException({
        currentTier: plan.tier,
        errorCode: API_ERROR_CODES.SUBSCRIPTION_PREMIUM_REQUIRED,
        message: 'This feature requires a Premium subscription',
        messageKey: 'errors.subscription.premiumRequired',
        params: {
          currentTier: plan.tier,
          requiredTier,
        },
        requiredTier,
      });
    }

    return true;
  }
}
