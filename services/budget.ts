import { API_ROUTES } from "@/constants/api-routes";
import { IBudget, IChartPoints } from "@/interfaces";
import { APIs } from "./api-helper";

export const getBudgetQuery = () =>
  APIs.get<{ data: IBudget }>(API_ROUTES.BUDGET);

export const updateBudgetMutation = (params: { monthly_budget: number }) =>
  APIs.patch<{ data: IBudget }>(API_ROUTES.UPDATE_BUDGET, { data: params });

export const getDailySpentChartQuery = () =>
  APIs.get<{ data: IChartPoints }>(API_ROUTES.DAILY_SPENT_CHART);

export const getMonthlySpentChartQuery = () =>
  APIs.get<{ data: IChartPoints }>(API_ROUTES.MONTHLY_SPENT_CHART);
