import { BudgetCategoryStatistic } from "@/components/BudgetCategoryStatistic";
import {
  CURRENT_MONTH,
  CURRENT_YEAR,
} from "@/components/MonthYearPicker/utils";
import { BUDGET_STATISTIC_KEY } from "@/constants/query-keys";
import { getBudgetMonthlyStatisticsQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { View } from "react-native";

export const BudgetStatisticSection = memo(() => {
  const { data: statisticMonthly } = useQuery({
    queryKey: BUDGET_STATISTIC_KEY.detail(
      `monthly ${CURRENT_MONTH + 1} ${CURRENT_YEAR}`,
    ),
    queryFn: () =>
      getBudgetMonthlyStatisticsQuery({
        month: CURRENT_MONTH + 1,
        year: CURRENT_YEAR,
      }),
  });
  return (
    <View className="px-20 mt-20">
      <BudgetCategoryStatistic
        data={statisticMonthly?.spendingByCategory ?? []}
        title="Monthly Spending"
      />
    </View>
  );
});

BudgetStatisticSection.displayName = "BudgetStatisticSection";
