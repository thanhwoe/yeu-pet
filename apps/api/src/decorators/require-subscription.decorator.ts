import { subscription_tier } from '@app/generated/prisma/client';
import { SetMetadata } from '@nestjs/common';

export const REQUIRED_SUBSCRIPTION_KEY = 'required-subscription';

export const RequireSubscription = (
  tier: subscription_tier = subscription_tier.premium,
) => SetMetadata(REQUIRED_SUBSCRIPTION_KEY, tier);
