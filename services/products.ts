import { API_ROUTES } from "@/constants/api-routes";
import { IPagination, IProduct, IProductDetail } from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

interface IProductsQuery {
  limit: number;
  page: number;
  category?: string;
  query?: string;
}
export const getListProductsQuery = ({
  limit,
  page,
  category,
  query,
}: IProductsQuery) =>
  APIs.get<{ data: IProduct[]; metadata: IPagination }>(
    API_ROUTES.LIST_PRODUCTS,
    {
      params: { limit, page, category, query },
      paramsSerializer: parseQueryParams,
    }
  );

export const getProductDetailQuery = ({ id }: { id: string }) =>
  APIs.get<IProductDetail>(API_ROUTES.PRODUCT_DETAIL(id));
