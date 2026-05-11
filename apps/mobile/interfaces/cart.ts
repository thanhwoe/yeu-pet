import { IProductDetail } from "./products";

export interface ICartItemResponse {
  id: string;
  quantity: number;
  price: number;
  is_select: boolean;
  created_at: string;
  updated_at: string;
  products: Omit<IProductDetail, "product_images" | "description">;
  status: string;
  available_quantity: number;
  item_total: number;
}

export interface ICartResponse {
  cart_id: string;
  items: ICartItemResponse[];
  summary: {
    total_items: number;
    items_count: number;
    subtotal: number;
    total: number;
    has_unavailable_items: boolean;
    has_insufficient_stock: boolean;
    selected_all: boolean;
  };
}

export interface ICartCountResponse {
  data: {
    count: number;
  };
  success: boolean;
}
