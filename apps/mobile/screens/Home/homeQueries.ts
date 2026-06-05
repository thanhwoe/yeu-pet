import {
  CURRENT_MONTH,
  CURRENT_YEAR,
} from "@/components/MonthYearPicker/utils";

export const HOME_REMINDER_PARAMS = {
  limit: 3,
} as const;

export const HOME_BUDGET_MONTHLY_PARAMS = {
  month: CURRENT_MONTH + 1,
  year: CURRENT_YEAR,
} as const;

export const HOME_BUDGET_MONTHLY_KEY =
  `monthly ${HOME_BUDGET_MONTHLY_PARAMS.month} ${HOME_BUDGET_MONTHLY_PARAMS.year}`;
