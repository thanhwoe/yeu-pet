import { SUBSCRIPTION_KEY } from "@/constants/query-keys";
import { SubscriptionEntitlements } from "@/interfaces";
import { identifyRevenueCatUser } from "@/services/revenuecat";
import { syncSubscriptionMutation } from "@/services/subscriptions";
import { useUserInfoStore } from "@/stores/user-info";
import { QueryClient } from "@tanstack/react-query";

const inFlightUserSyncs = new Map<string, Promise<SubscriptionEntitlements>>();

export const setSubscriptionCache = (
  queryClient: QueryClient,
  subscription: SubscriptionEntitlements,
) => {
  queryClient.setQueryData(SUBSCRIPTION_KEY.detail(), subscription);
  queryClient.setQueryData(SUBSCRIPTION_KEY.entitlements(), subscription);
};

export const syncRevenueCatForUser = async (
  queryClient: QueryClient,
  userId: string,
) => {
  const currentSync = inFlightUserSyncs.get(userId);
  if (currentSync) {
    return currentSync;
  }

  const nextSync = (async () => {
    await identifyRevenueCatUser(userId);
    const subscription = await syncSubscriptionMutation();
    if (useUserInfoStore.getState().user?.id === userId) {
      setSubscriptionCache(queryClient, subscription);
    }
    return subscription;
  })();
  inFlightUserSyncs.set(userId, nextSync);

  try {
    return await nextSync;
  } finally {
    if (inFlightUserSyncs.get(userId) === nextSync) {
      inFlightUserSyncs.delete(userId);
    }
  }
};
