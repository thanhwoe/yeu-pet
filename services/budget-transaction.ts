import { API_ROUTES } from "@/constants/api-routes";
import { IBudgetTransactionForm } from "@/constants/validation";

import { IBudgetTransaction, IPagination } from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

export const createBudgetTransactionMutation = (
  params: IBudgetTransactionForm
) =>
  APIs.post<{ data: IBudgetTransaction }>(
    API_ROUTES.CREATE_BUDGET_TRANSACTION,
    {
      data: params,
    }
  );

export const getListBudgetTransactionQuery = ({
  limit,
  page,
}: {
  limit: number;
  page: number;
}) =>
  APIs.get<{ data: IBudgetTransaction[]; metadata: IPagination }>(
    API_ROUTES.LIST_BUDGET_TRANSACTION,
    {
      params: { limit, page },
      paramsSerializer: parseQueryParams,
    }
  );

export const updateBudgetTransactionMutation = ({
  id,
  ...params
}: IBudgetTransactionForm & { id: string }) =>
  APIs.patch<{ data: IBudgetTransaction }>(API_ROUTES.UPDATE_BUDGET_TRANSACTION(id), { data: params });

export const deleteBudgetTransactionMutation = (id: string) =>
  APIs.delete<{ data: IBudgetTransaction }>(API_ROUTES.DELETE_BUDGET_TRANSACTION(id));