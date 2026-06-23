import { REQUIRED_SUBSCRIPTION_KEY } from '@app/decorators/require-subscription.decorator';
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
        message: 'This feature requires a Premium subscription',
        requiredTier,
      });
    }

    return true;
  }
}
