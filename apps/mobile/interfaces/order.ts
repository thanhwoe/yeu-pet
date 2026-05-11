import { IProductDetail } from "./products";
import { IShippingAddress } from "./shipping-address";

type Product = Pick<
  IProductDetail,
  | "id"
  | "name"
  | "thumbnail_url"
  | "slug"
  | "original_price"
  | "sale_price"
  | "stock_quantity"
  | "is_active"
> & { quantity: number };
export interface IOrderSummaryResponse {
  data: {
    products: Product[];
    shippingAddress: IShippingAddress;
    summary: {
      sale_total: number;
      original_total: number;
      discount_total: number;
      shipping_fee: number;
      total: number;
    };
  };
}
