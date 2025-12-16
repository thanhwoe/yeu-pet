import { API_ROUTES } from "@/constants/api-routes";
import { IShippingAddressForm } from "@/constants/validation";
import { IShippingAddress } from "@/interfaces";
import { APIs } from "./api-helper";

export const createShippingAddressMutation = (params: IShippingAddressForm) =>
  APIs.post(API_ROUTES.CREATE_SHIPPING_ADDRESS, { data: params });

export const getShippingAddressesQuery = () =>
  APIs.get<{ data: IShippingAddress[] }>(API_ROUTES.LIST_SHIPPING_ADDRESS);

export const deleteShippingAddressMutation = (id: string) =>
  APIs.delete<{ data: IShippingAddress }>(
    API_ROUTES.DELETE_SHIPPING_ADDRESS(id)
  );
