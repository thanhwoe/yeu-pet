export interface IProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  thumbnail_url: string;
  original_price: number;
  sale_price: number;
  rating_average: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
}

interface IProductImage {
  id: string;
  image_url: string;
  created_at: string;
  product_id: string;
  updated_at: string;
}

export interface IProductDetail extends IProduct {
  description: string;
  rating_count: number;
  stock_quantity: number;
  is_active: boolean;
  product_images: IProductImage[];
}
