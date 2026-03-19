import { Toast } from "@/components/Toast";
// import VnpayModule from "@/modules/vnpay";
import { createVNPayUrlMutation } from "@/services/payments";
import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";

export enum PaymentMethod {
  VNPAY = "vnpay",
  ZALOPAY = "zalopay",
}

export const usePayment = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
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
  }, []);

  const handleDeepLink = ({ url }: Linking.EventType) => {
    const deepLink = new URL(url);
    const params = deepLink.searchParams;
    const responseCode = params.get("vnp_ResponseCode");
    if (responseCode && paymentMethod === PaymentMethod.VNPAY) {
      handleVNPayResponse(responseCode);
    }
  };

  const { mutate: createVNPayUrl } = useMutation({
    mutationFn: createVNPayUrlMutation,
    onError: (error) => {
      console.log({ error });
    },
    onSuccess: (data) => {
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
        Toast.error({ text: "Unknown payment method" });
        break;
    }
  };

  const handleVNPayResponse = (data: string) => {
    // https://sandbox.vnpayment.vn/apis/files/VNPAY%20Payment%20Gateway_Techspec%20Post%20method%202.1.0-VN.pdf
    // https://sandbox.vnpayment.vn/apis/docs/thanh-toan-token/token.html
    switch (data) {
      case "00":
        Toast.success({ text: "Payment successful" });
        break;
      case "24":
        Toast.error({ text: "Payment cancelled" });
        break;
      case "99":
        Toast.error({ text: "VNPAY error" });
        break;
      case "08":
        Toast.error({ text: "Bank maintenance" });
        break;
      case "79":
        Toast.error({ text: "Bank maintenance" });
        break;
      case "02":
        Toast.error({ text: "Transaction failed" });
        break;
      default:
        Toast.error({ text: "Payment failed" });
        break;
    }
  };

  return {
    setPaymentMethod,
    paymentMethod,
    handlePayment,
  };
};
