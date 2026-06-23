import { RequireSubscription } from '@app/decorators/require-subscription.decorator';
import { subscription_tier } from '@app/generated/prisma/client';
import { SubscriptionService } from '@app/modules/subscription/subscription.service';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionGuard } from './subscription.guard';

const accountId = '123e4567-e89b-42d3-a456-426614174000';

const getHandler = (controller: object): (() => void) =>
  Object.getOwnPropertyDescriptor(controller, 'handler')?.value as () => void;

const createContext = (handler: () => void): ExecutionContext =>
  ({
    getClass: () => class TestController {},
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: accountId } }),
    }),
  }) as unknown as ExecutionContext;

describe('SubscriptionGuard', () => {
  it('allows an account with the required subscription tier', async () => {
    class TestController {
      @RequireSubscription(subscription_tier.premium)
      handler() {}
    }
    const getCurrentPlan = jest.fn().mockResolvedValue({
      tier: subscription_tier.premium,
    });
    const guard = new SubscriptionGuard(new Reflector(), {
      getCurrentPlan,
    } as unknown as SubscriptionService);

    await expect(
      guard.canActivate(createContext(getHandler(TestController.prototype))),
    ).resolves.toBe(true);
  });

  it('returns a clear 403 for an account without Premium access', async () => {
    class TestController {
      @RequireSubscription()
      handler() {}
    }
    const guard = new SubscriptionGuard(new Reflector(), {
      getCurrentPlan: jest.fn().mockResolvedValue({
        tier: subscription_tier.free,
      }),
    } as unknown as SubscriptionService);

    await expect(
      guard.canActivate(createContext(getHandler(TestController.prototype))),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
