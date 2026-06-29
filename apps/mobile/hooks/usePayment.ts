import { Toast } from "@/components/Toast";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export enum PaymentMethod {
  VNPAY = "vnpay",
  ZALOPAY = "zalopay",
}

export const usePayment = () => {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );

  const handlePayWithVNPay = (amount: number) => {};

  const handlePayWithZaloPay = () => {};

  const handlePayment = (amount: number) => {
    if (!paymentMethod) return;

    switch (paymentMethod) {
      case PaymentMethod.VNPAY:
        handlePayWithVNPay(amount);
        break;
      case PaymentMethod.ZALOPAY:
        handlePayWithZaloPay();
        break;
      default:
        Toast.error({
          title: t("commerce.payment.unavailableTitle"),
          text: t("commerce.payment.unavailableText"),
        });
        break;
    }
  };

  const handleDeepLink = useCallback(({ url }: Linking.EventType) => {
    const deepLink = new URL(url);
    const params = deepLink.searchParams;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          handleDeepLink({ url: initialUrl });
        }
      } catch (error) {
        console.log({ error });
      }
    })();

    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => subscription.remove();
  }, [handleDeepLink]);

  return {
    setPaymentMethod,
    paymentMethod,
    handlePayment,
  };
};
