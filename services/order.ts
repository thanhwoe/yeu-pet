import { API_ROUTES } from "@/constants/api-routes";
import { IOrderSummaryResponse } from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

interface IOrderSummaryQuery {
  productId: string;
  quantity: number;
}
export const getOrderSummaryQuery = (query?: IOrderSummaryQuery) =>
  APIs.get<IOrderSummaryResponse>(API_ROUTES.ORDER_SUMMARY, {
    params: query,
    paramsSerializer: parseQueryParams,
  });
