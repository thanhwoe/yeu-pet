import { SUBSCRIPTION_KEY } from "@/constants/query-keys";
import {
  addRevenueCatCustomerInfoListener,
  configureRevenueCat,
  CustomerInfo,
  getRevenueCatCustomerInfo,
  REVENUECAT_PREMIUM_ENTITLEMENT_ID,
} from "@/services/revenuecat";
import { getEntitlementsQuery } from "@/services/subscriptions";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

export const useSubscription = () => {
  const backendQuery = useQuery({
    queryKey: SUBSCRIPTION_KEY.entitlements(),
    queryFn: getEntitlementsQuery,
    staleTime: 60_000,
  });
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoadingCustomerInfo, setIsLoadingCustomerInfo] = useState(true);
  const [revenueCatError, setRevenueCatError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    let removeListener: (() => boolean) | undefined;

    void configureRevenueCat()
      .then(async (configured) => {
        if (!configured || !active) {
          return;
        }

        const listener = (nextCustomerInfo: CustomerInfo) => {
          if (active) {
            setCustomerInfo(nextCustomerInfo);
          }
        };
        removeListener = addRevenueCatCustomerInfoListener(listener);
        const nextCustomerInfo = await getRevenueCatCustomerInfo();
        if (active) {
          setCustomerInfo(nextCustomerInfo);
        }
      })
      .catch((error: Error) => {
        if (active) {
          setRevenueCatError(error);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingCustomerInfo(false);
        }
      });

    return () => {
      active = false;
      removeListener?.();
    };
  }, []);

  const refresh = useCallback(async () => {
    setRevenueCatError(null);
    const [nextCustomerInfo, backendResult] = await Promise.all([
      getRevenueCatCustomerInfo().catch((error: Error) => {
        setRevenueCatError(error);
        return null;
      }),
      backendQuery.refetch(),
    ]);
    setCustomerInfo(nextCustomerInfo);
    return backendResult.data;
  }, [backendQuery]);

  return {
    ...backendQuery,
    customerInfo,
    entitlements: backendQuery.data,
    expiresAt: backendQuery.data?.expiresAt ?? null,
    isLoading: backendQuery.isLoading || isLoadingCustomerInfo,
    isPremium: backendQuery.data?.tier === "premium",
    isStorePremium: Boolean(
      customerInfo?.entitlements.active[REVENUECAT_PREMIUM_ENTITLEMENT_ID],
    ),
    refresh,
    revenueCatError,
  };
};
