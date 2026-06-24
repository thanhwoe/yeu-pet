import { Toast } from "@/components/Toast";
import { setSubscriptionCache } from "@/features/subscriptions/cache";
import {
  configureRevenueCat,
  REVENUECAT_PREMIUM_ENTITLEMENT_ID,
} from "@/services/revenuecat";
import { syncSubscriptionMutation } from "@/services/subscriptions";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

export const usePremiumPaywall = () => {
  const queryClient = useQueryClient();
  const [isPresenting, setIsPresenting] = useState(false);
  const [isManaging, setIsManaging] = useState(false);

  const syncBackend = useCallback(async () => {
    const subscription = await syncSubscriptionMutation();
    setSubscriptionCache(queryClient, subscription);
    return subscription;
  }, [queryClient]);

  const presentPaywall = useCallback(async () => {
    if (isPresenting) {
      return null;
    }

    setIsPresenting(true);
    try {
      if (!(await configureRevenueCat())) {
        Toast.warn({
          text: "Premium options are unavailable right now. Please try again later.",
        });
        return null;
      }

      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: REVENUECAT_PREMIUM_ENTITLEMENT_ID,
        displayCloseButton: true,
      });

      if (
        result === PAYWALL_RESULT.PURCHASED ||
        result === PAYWALL_RESULT.RESTORED ||
        result === PAYWALL_RESULT.NOT_PRESENTED
      ) {
        const purchaseCompleted =
          result === PAYWALL_RESULT.PURCHASED ||
          result === PAYWALL_RESULT.RESTORED;
        try {
          const subscription = await syncBackend();
          if (
            result !== PAYWALL_RESULT.NOT_PRESENTED &&
            subscription.tier === "premium"
          ) {
            Toast.success({ text: "Premium care tools are ready." });
          }
        } catch {
          Toast.warn({
            text: purchaseCompleted
              ? "Your store purchase succeeded. YeuPet is still refreshing your plan."
              : "YeuPet is still refreshing your plan. Please check again shortly.",
          });
        }
      } else if (result === PAYWALL_RESULT.ERROR) {
        Toast.error({
          text: "Premium checkout could not open. Please try again.",
        });
      }

      return result;
    } catch (error) {
      console.warn("[RevenueCat] Could not present the paywall.", error);
      Toast.error({
        text: "Premium checkout could not open. Please try again.",
      });
      return PAYWALL_RESULT.ERROR;
    } finally {
      setIsPresenting(false);
    }
  }, [isPresenting, syncBackend]);

  const presentCustomerCenter = useCallback(async () => {
    if (isManaging) {
      return;
    }

    setIsManaging(true);
    try {
      if (!(await configureRevenueCat())) {
        Toast.warn({
          text: "Subscription management is unavailable right now.",
        });
        return;
      }

      await RevenueCatUI.presentCustomerCenter({
        callbacks: {
          onRestoreCompleted: () => {
            void syncBackend().catch((error) =>
              console.warn(
                "[RevenueCat] Post-restore subscription sync failed.",
                error,
              ),
            );
          },
          onPromotionalOfferSucceeded: () => {
            void syncBackend().catch((error) =>
              console.warn(
                "[RevenueCat] Post-offer subscription sync failed.",
                error,
              ),
            );
          },
        },
      });
      try {
        await syncBackend();
      } catch (error) {
        console.warn(
          "[RevenueCat] Post-Customer Center subscription sync failed.",
          error,
        );
        Toast.warn({
          text: "Your subscription changes are still refreshing in YeuPet.",
        });
      }
    } catch (error) {
      console.warn("[RevenueCat] Could not present Customer Center.", error);
      Toast.error({
        text: "Could not open subscription management. Please try again.",
      });
    } finally {
      setIsManaging(false);
    }
  }, [isManaging, syncBackend]);

  return {
    isManaging,
    isPresenting,
    presentCustomerCenter,
    presentPaywall,
    syncBackend,
  };
};
