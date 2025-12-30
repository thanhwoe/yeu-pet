import { API_ROUTES } from "@/constants/api-routes";
import { APIs } from "./api-helper";

interface VNPayParams {
  amount: number;
  scheme?: string;
}

interface VNPayResponse {
  paymentUrl: string;
  tmnCode: string;
  isSandbox: boolean;
}

export const createVNPayUrlMutation = (params: VNPayParams) =>
  APIs.post<VNPayResponse>(API_ROUTES.PAYMENT_VNPAY, {
    data: {
      amount: params.amount,
      scheme: params.scheme ?? "petcare",
    },
  });
