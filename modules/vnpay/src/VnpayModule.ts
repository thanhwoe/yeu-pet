import { NativeModule, requireNativeModule } from "expo";

import { VNPayModuleEvents, VNPayPaymentParams } from "./Vnpay.types";

/**
 * Native module declaration cho VNPay Payment
 */
declare class VNPayModule extends NativeModule<VNPayModuleEvents> {
  /**
   * Mở VNPay payment screen
   *
   * @param scheme - App scheme để redirect về (vd: "myapp")
   * @param isSandbox - true = sandbox, false = production
   * @param paymentUrl - URL thanh toán từ backend
   * @param tmnCode - Mã merchant VNPay cung cấp
   * @param backAlert - Alert message khi back (optional)
   * @param title - Tiêu đề màn hình (optional)
   * @param titleColor - Màu tiêu đề (optional)
   * @param beginColor - Màu gradient bắt đầu (optional)
   * @param endColor - Màu gradient kết thúc (optional)
   * @param iconBackName - Tên icon back (optional)
   */
  show(params: VNPayPaymentParams): Promise<void>;
}

export default requireNativeModule<VNPayModule>("Vnpay");
