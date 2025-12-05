import { API_ROUTES } from "@/constants/api-routes";
import { ICartResponse } from "@/interfaces";
import { APIs } from "./api-helper";

interface AddToCartParams {
  productId: string;
  quantity: number;
}

export const addToCartMutation = (params: AddToCartParams) =>
  APIs.post(API_ROUTES.ADD_TO_CART, { data: params });

export const getCartQuery = () => APIs.get<ICartResponse>(API_ROUTES.CART);

export interface UpdateCartParams {
  id: string;
  quantity: number;
  is_select: boolean;
}

export const updateCartMutation = (params: UpdateCartParams[]) =>
  APIs.patch(API_ROUTES.UPDATE_CART, { data: params });
