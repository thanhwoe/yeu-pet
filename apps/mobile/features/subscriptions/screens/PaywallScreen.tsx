import { Toast } from "@/components/Toast";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { usePremiumPaywall } from "@/features/subscriptions/usePremiumPaywall";
import { configureRevenueCat } from "@/services/revenuecat";
import { useEffect, useState } from "react";
import RevenueCatUI from "react-native-purchases-ui";

type PaywallScreenProps = {
  onDismiss: () => void;
  onSuccess: () => void;
};

export function PaywallScreen({ onDismiss, onSuccess }: PaywallScreenProps) {
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
        title: "Premium unlocked",
        text: "Your Premium care tools are ready to use.",
      });
      onSuccess();
    } catch {
      Toast.warn({
        title: "Plan still syncing",
        text: "Your store purchase succeeded. YeuPet is still refreshing your plan.",
      });
      onSuccess();
    }
  };

  if (configured === null) {
    return (
      <ScreenContainer>
        <StateView
          variant="loading"
          title="Loading Premium options"
          description="Checking the secure store connection."
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
          title="Premium options unavailable"
          description="Please try again later. Your current plan is unchanged."
          actionLabel="Close"
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
          title: "Purchase failed",
          text: "Premium was not activated. Please try again.",
        })
      }
      onRestoreCompleted={() => void handleSuccess()}
      onRestoreError={() =>
        Toast.error({
          title: "Restore failed",
          text: "We could not restore your purchases. Please try again.",
        })
      }
    />
  );
}
