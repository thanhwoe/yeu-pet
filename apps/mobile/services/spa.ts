import { API_ROUTES } from "@/constants/api-routes";
import { IClinic, IPagination } from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

type LegacyPagination<T> = IPagination<T> & {
  nextPage?: number | null;
};

interface IClinicQuery {
  limit: number;
  page: number;
  city?: string;
  query?: string;
}
export const getListSpaQuery = ({ limit, page, city, query }: IClinicQuery) =>
  APIs.get<{ data: IClinic[]; metadata: LegacyPagination<IClinic> }>(
    API_ROUTES.LIST_SPA,
    {
      params: { limit, page, city, query },
      paramsSerializer: parseQueryParams,
    },
  );
