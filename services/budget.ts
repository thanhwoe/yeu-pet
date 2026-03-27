import { API_ROUTES } from "@/constants/api-routes";
import {
  IBudgetCategoryForm,
  IBudgetTransactionForm,
} from "@/constants/validation";
import {
  IBudget,
  IBudgetCategory,
  IBudgetStatisticMonthly,
  IBudgetStatisticYearly,
  IBudgetTransaction,
  IPagination,
} from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

interface IBudgetQuery {
  month?: number;
  year?: number;
}
export const getBudgetQuery = (params?: IBudgetQuery) =>
  APIs.get<IBudget>(API_ROUTES.BUDGETS, {
    params,
    paramsSerializer: parseQueryParams,
  });

interface IBudgetParams {
  amount: number;
  month: number;
  year: number;
}

export const updateBudgetMutation = (params: IBudgetParams) =>
  APIs.patch(API_ROUTES.BUDGETS, { data: params });

interface IBudgetStatisticYearlyParams {
  year?: number;
}
export const getBudgetYearlyStatisticsQuery = (
  params: IBudgetStatisticYearlyParams,
) =>
  APIs.get<IBudgetStatisticYearly>(API_ROUTES.BUDGET_STATISTIC_YEARLY, {
    params,
    paramsSerializer: parseQueryParams,
  });

interface IBudgetStatisticMonthlyParams {
  year?: number;
  month?: number;
}
export const getBudgetMonthlyStatisticsQuery = (
  params: IBudgetStatisticMonthlyParams,
) =>
  APIs.get<IBudgetStatisticMonthly>(API_ROUTES.BUDGET_STATISTIC_MONTHLY, {
    params,
    paramsSerializer: parseQueryParams,
  });

export const createBudgetCategoryMutation = (params: IBudgetCategoryForm) =>
  APIs.post<IBudgetCategory>(API_ROUTES.BUDGET_CATEGORIES, { data: params });

interface IBudgetCategoryQuery {
  limit?: number;
  page?: number;
}
export const getBudgetCategoryQuery = (params: IBudgetCategoryQuery) =>
  APIs.get<IPagination<IBudgetCategory>>(API_ROUTES.BUDGET_CATEGORIES, {
    params,
    paramsSerializer: parseQueryParams,
  });

export const createBudgetTransactionMutation = (
  params: IBudgetTransactionForm,
) =>
  APIs.post<IBudgetTransaction>(API_ROUTES.BUDGET_TRANSACTIONS, {
    data: params,
  });

interface IBudgetTransactionQuery {
  limit?: number;
  page?: number;
  month?: number;
  year?: number;
}
export const getBudgetTransactionQuery = (params: IBudgetTransactionQuery) =>
  APIs.get<IPagination<IBudgetTransaction>>(API_ROUTES.BUDGET_TRANSACTIONS, {
    params,
    paramsSerializer: parseQueryParams,
  });
