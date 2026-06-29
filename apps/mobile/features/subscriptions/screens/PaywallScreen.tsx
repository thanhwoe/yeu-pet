import { Toast } from "@/components/Toast";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { usePremiumPaywall } from "@/features/subscriptions/usePremiumPaywall";
import { configureRevenueCat } from "@/services/revenuecat";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import RevenueCatUI from "react-native-purchases-ui";

type PaywallScreenProps = {
  onDismiss: () => void;
  onSuccess: () => void;
};

export function PaywallScreen({ onDismiss, onSuccess }: PaywallScreenProps) {
  const { t } = useTranslation();
  const { syncBackend } = usePremiumPaywall();
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void configureRevenueCat().then((result) => {
      if (active) {
        setConfigured(result);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const handleSuccess = async () => {
    try {
      await syncBackend();
      Toast.success({
        title: t("subscription.toast.premiumUnlockedTitle"),
        text: t("subscription.toast.premiumUnlockedText"),
      });
      onSuccess();
    } catch {
      Toast.warn({
        title: t("subscription.toast.syncingTitle"),
        text: t("subscription.toast.syncingAfterPurchaseText"),
      });
      onSuccess();
    }
  };

  if (configured === null) {
    return (
      <ScreenContainer>
        <StateView
          variant="loading"
          title={t("subscription.paywall.loadingTitle")}
          description={t("subscription.paywall.loadingDescription")}
          className="flex-1"
        />
      </ScreenContainer>
    );
  }

  if (!configured) {
    return (
      <ScreenContainer>
        <StateView
          variant="error"
          title={t("subscription.paywall.unavailableTitle")}
          description={t("subscription.paywall.unavailableDescription")}
          actionLabel={t("subscription.actions.close")}
          onAction={onDismiss}
          className="flex-1"
        />
      </ScreenContainer>
    );
  }

  return (
    <RevenueCatUI.Paywall
      style={{ flex: 1 }}
      options={{ displayCloseButton: true }}
      onDismiss={onDismiss}
      onPurchaseCompleted={() => void handleSuccess()}
      onPurchaseError={() =>
        Toast.error({
          title: t("subscription.paywall.purchaseErrorTitle"),
          text: t("subscription.paywall.purchaseErrorText"),
        })
      }
      onRestoreCompleted={() => void handleSuccess()}
      onRestoreError={() =>
        Toast.error({
          title: t("subscription.paywall.restoreErrorTitle"),
          text: t("subscription.paywall.restoreErrorText"),
        })
      }
    />
  );
}
