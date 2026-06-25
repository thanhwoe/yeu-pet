import { IChartPoints } from "./chart";

export interface IBudgetTransaction {
  id: string;
  accountId: string;
  categoryId: string;
  petId?: string | null;
  amount: string;
  description?: string | null;
  date: string;
  budgetCategories: {
    id: string;
    name?: string | null;
    emoji: string;
    color?: string | null;
  };
  pets?: {
    id: string;
    name?: string | null;
    avatarUrl?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface IBudgetCategory {
  id: string;
  accountId: string;
  name: string;
  emoji: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBudget {
  id: string;
  accountId: string;
  amount: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
  spent: number;
  remaining: number;
  usagePercent: number;
  isOverBudget: boolean;
}

export interface IBudgetSpendingByCategory {
  category: IBudgetCategory;
  total: number;
  count: number;
  percentage: number;
}

export interface IBudgetStatisticSummary {
  totalSpent: number;
  transactionCount: number;
}
export interface IBudgetStatisticMonthly {
  period: {
    month: number;
    year: number;
  };
  summary: IBudgetStatisticSummary;
  spendingByCategory: IBudgetSpendingByCategory[];
  dailyTrend: IChartPoints;
}

export interface IBudgetStatisticYearly {
  period: {
    year: number;
  };
  summary: IBudgetStatisticSummary;
  monthlyTrend: IChartPoints;
  spendingByCategory: IBudgetSpendingByCategory[];
}
