import { API_ROUTES } from "@/constants/api-routes";
import { IClinic, IPagination } from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

export const getListSuggestClinicQuery = (city: string) =>
  APIs.get<{ data: IClinic[] }>(API_ROUTES.SUGGEST_CLINIC(city));

interface IClinicQuery {
  limit: number;
  page: number;
  city?: string;
  query?: string;
}

export const getListClinicQuery = ({
  limit,
  page,
  city,
  query,
}: IClinicQuery) =>
  APIs.get<{ data: IClinic[]; metadata: IPagination }>(API_ROUTES.LIST_CLINIC, {
    params: { limit, page, city, query },
    paramsSerializer: parseQueryParams,
  });
