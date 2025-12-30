/**
 * Event payload từ VNPay payment
 */
export type VNPayPaymentResultPayload = {
  /**
   * Mã kết quả thanh toán:
   * - -1: User nhấn back (AppBackAction)
   * - 10: Mở app ngân hàng/ví (CallMobileBankingApp)
   * - 99: User hủy thanh toán (WebBackAction)
   * - 98: Thanh toán thất bại (FaildBackAction)
   * - 97: Thanh toán thành công (SuccessBackAction)
   */
  resultCode: number;

  /**
   * Action string từ VNPay SDK
   * Giá trị có thể: "AppBackAction", "CallMobileBankingApp",
   * "WebBackAction", "FaildBackAction", "SuccessBackAction"
   */
  action: string;
};

/**
 * Events mà VNPay module emit
 */
export type VNPayModuleEvents = {
  /**
   * Event được fire khi có kết quả thanh toán từ VNPay
   */
  onPaymentResult: (payload: VNPayPaymentResultPayload) => void;
};

/**
 * Tham số để mở VNPay payment
 */
export interface VNPayPaymentParams {
  /**
   * URL thanh toán từ backend merchant tạo
   * Tham khảo: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html#tao-url-thanh-toan
   */
  paymentUrl: string;

  /**
   * Scheme của app để VNPay redirect về (ví dụ: "myapp")
   * Phải khớp với scheme đã config trong app.json
   */
  scheme: string;

  /**
   * Mã merchant do VNPay cung cấp
   */
  tmnCode: string;

  /**
   * true = môi trường sandbox/test
   * false = môi trường production
   */
  isSandbox: boolean;

  /**
   * Alert message khi user back (optional)
   */
  backAlert?: string;

  /**
   * Tiêu đề màn hình payment (optional)
   */
  title?: string;

  /**
   * Màu của tiêu đề dạng hex (optional, vd: "#FF0000")
   */
  titleColor?: string;

  /**
   * Màu gradient bắt đầu (optional, vd: "#FF0000")
   */
  beginColor?: string;

  /**
   * Màu gradient kết thúc (optional, vd: "#00FF00")
   */
  endColor?: string;

  /**
   * Tên icon back (optional)
   */
  iconBackName?: string;
}

/**
 * Constants cho result code
 */
export const VNPayResultCode = {
  /** User nhấn back */
  USER_BACK: -1,
  /** Mở app ngân hàng/ví - cần lưu txnRef để check sau */
  CALL_MOBILE_APP: 10,
  /** User hủy thanh toán */
  USER_CANCEL: 99,
  /** Thanh toán thất bại */
  PAYMENT_FAILED: 98,
  /** Thanh toán thành công */
  PAYMENT_SUCCESS: 97,
} as const;

/**
 * Type cho result code values
 */
export type VNPayResultCodeValue =
  (typeof VNPayResultCode)[keyof typeof VNPayResultCode];
