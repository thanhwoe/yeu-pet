// Reexport the native module. On web, it will be resolved to VnpayModule.web.ts

import { VNPayPaymentParams } from "./src/Vnpay.types";
import VnpayModule from "./src/VnpayModule";

// and on native platforms to VnpayModule.ts
export * from "./src/Vnpay.types";
export { default } from "./src/VnpayModule";

export function openVNPayPayment(params: VNPayPaymentParams): void {
  const _params: VNPayPaymentParams = Object.assign(
    {
      isSandbox: true,
      paymentUrl: "https://sandbox.vnpayment.vn/tryitnow/Home/CreateOrder",
      tmnCode: "FAHASA02",
      backAlert: "Bạn có chắc chắn trở lại ko?",
      title: "Thanh toán",
      iconBackName: "ion_back",
      beginColor: "#F06744", //6 ký tự.
      endColor: "#E26F2C", //6 ký tự.
      titleColor: "#E26F2C", //6 ký tự.
    },
    params
  );

  _params.titleColor = _params.titleColor?.replace(/#/g, ""); //6 ký tự.
  _params.beginColor = _params.beginColor?.replace(/#/g, ""); //6 ký tự.
  _params.endColor = _params.endColor?.replace(/#/g, ""); //6 ký tự.

  VnpayModule.show(_params);
}
