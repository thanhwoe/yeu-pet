import { Toast } from "@/components/Toast";
import { setSubscriptionCache } from "@/features/subscriptions/cache";
import {
  configureRevenueCat,
  REVENUECAT_PREMIUM_ENTITLEMENT_ID,
} from "@/services/revenuecat";
import { syncSubscriptionMutation } from "@/services/subscriptions";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

export const usePremiumPaywall = () => {
  const { t } = useTranslation();
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
          title: t("subscription.toast.premiumUnavailableTitle"),
          text: t("subscription.toast.premiumUnavailableText"),
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
            Toast.success({
              title: t("subscription.toast.premiumUnlockedTitle"),
              text: t("subscription.toast.premiumUnlockedText"),
            });
          }
        } catch {
          Toast.warn({
            title: t("subscription.toast.syncingTitle"),
            text: purchaseCompleted
              ? t("subscription.toast.syncingAfterPurchaseText")
              : t("subscription.toast.syncingGenericText"),
          });
        }
      } else if (result === PAYWALL_RESULT.ERROR) {
        Toast.error({
          title: t("subscription.toast.checkoutUnavailableTitle"),
          text: t("subscription.toast.checkoutUnavailableText"),
        });
      }

      return result;
    } catch (error) {
      console.warn("[RevenueCat] Could not present the paywall.", error);
      Toast.error({
        title: t("subscription.toast.checkoutUnavailableTitle"),
        text: t("subscription.toast.checkoutUnavailableText"),
      });
      return PAYWALL_RESULT.ERROR;
    } finally {
      setIsPresenting(false);
    }
  }, [isPresenting, syncBackend, t]);

  const presentCustomerCenter = useCallback(async () => {
    if (isManaging) {
      return;
    }

    setIsManaging(true);
    try {
      if (!(await configureRevenueCat())) {
        Toast.warn({
          title: t("subscription.toast.managementUnavailableTitle"),
          text: t("subscription.toast.managementUnavailableText"),
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
          title: t("subscription.toast.changesSyncingTitle"),
          text: t("subscription.toast.changesSyncingText"),
        });
      }
    } catch (error) {
      console.warn("[RevenueCat] Could not present Customer Center.", error);
      Toast.error({
        title: t("subscription.toast.managementUnavailableTitle"),
        text: t("subscription.toast.managementOpenErrorText"),
      });
    } finally {
      setIsManaging(false);
    }
  }, [isManaging, syncBackend, t]);

  return {
    isManaging,
    isPresenting,
    presentCustomerCenter,
    presentPaywall,
    syncBackend,
  };
};
