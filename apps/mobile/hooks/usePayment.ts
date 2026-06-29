import { Toast } from "@/components/Toast";
// import VnpayModule from "@/modules/vnpay";
import { createVNPayUrlMutation } from "@/services/payments";
import { useMutation } from "@tanstack/react-query";
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

  const { mutate: createVNPayUrl } = useMutation({
    mutationFn: createVNPayUrlMutation,
    onError: (error) => {
      console.log({ error });
    },
    onSuccess: () => {
      // VnpayModule.show({
      //   isSandbox: data.isSandbox,
      //   scheme: "petcare",
      //   title: "Thanh toán VNPAY",
      //   titleColor: "#333333",
      //   beginColor: "#ffffff",
      //   endColor: "#ffffff",
      //   iconBackName: "ic_back",
      //   tmnCode: data.tmnCode,
      //   backAlert: "Quay lai",
      //   paymentUrl: data.paymentUrl,
      // });
    },
  });

  const handlePayWithVNPay = (amount: number) => {
    createVNPayUrl({ amount });
  };

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

  const handleVNPayResponse = useCallback((data: string) => {
    // https://sandbox.vnpayment.vn/apis/files/VNPAY%20Payment%20Gateway_Techspec%20Post%20method%202.1.0-VN.pdf
    // https://sandbox.vnpayment.vn/apis/docs/thanh-toan-token/token.html
    switch (data) {
      case "00":
        Toast.success({
          title: t("commerce.payment.completeTitle"),
          text: t("commerce.payment.completeText"),
        });
        break;
      case "24":
        Toast.warn({
          title: t("commerce.payment.cancelledTitle"),
          text: t("commerce.payment.cancelledText"),
        });
        break;
      case "99":
        Toast.error({
          title: t("commerce.payment.serviceErrorTitle"),
          text: t("commerce.payment.serviceErrorText"),
        });
        break;
      case "08":
        Toast.error({
          title: t("commerce.payment.bankUnavailableTitle"),
          text: t("commerce.payment.bankUnavailableText"),
        });
        break;
      case "79":
        Toast.error({
          title: t("commerce.payment.bankUnavailableTitle"),
          text: t("commerce.payment.bankUnavailableText"),
        });
        break;
      case "02":
        Toast.error({
          title: t("commerce.payment.declinedTitle"),
          text: t("commerce.payment.declinedText"),
        });
        break;
      default:
        Toast.error({
          title: t("commerce.payment.failedTitle"),
          text: t("commerce.payment.failedText"),
        });
        break;
    }
  }, [t]);

  const handleDeepLink = useCallback(
    ({ url }: Linking.EventType) => {
      const deepLink = new URL(url);
      const params = deepLink.searchParams;
      const responseCode = params.get("vnp_ResponseCode");
      if (responseCode && paymentMethod === PaymentMethod.VNPAY) {
        handleVNPayResponse(responseCode);
      }
    },
    [handleVNPayResponse, paymentMethod],
  );

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
