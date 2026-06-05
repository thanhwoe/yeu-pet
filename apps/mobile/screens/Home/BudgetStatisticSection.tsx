import { Skeleton } from "@/components/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { BUDGET_STATISTIC_KEY } from "@/constants/query-keys";
import { BudgetCategoryStatistic } from "@/features/budget/components/BudgetCategoryStatistic";
import { getBudgetMonthlyStatisticsQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { memo } from "react";
import { View } from "react-native";
import {
  HOME_BUDGET_MONTHLY_KEY,
  HOME_BUDGET_MONTHLY_PARAMS,
} from "./homeQueries";

export const BudgetStatisticSection = memo(() => {
  const router = useRouter();
  const {
    data: statisticMonthly,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: BUDGET_STATISTIC_KEY.detail(HOME_BUDGET_MONTHLY_KEY),
    queryFn: () => getBudgetMonthlyStatisticsQuery(HOME_BUDGET_MONTHLY_PARAMS),
  });

  const spendingByCategory = statisticMonthly?.spendingByCategory ?? [];

  if (isLoading) {
    return (
      <View className="px-20 mt-20">
        <View className="p-20 bg-background-card-highlight rounded-24 gap-20">
          <Skeleton
            className="h-28 w-160 rounded-12"
            backgroundClassName="bg-background-secondary-highlight"
          />
          <Skeleton
            className="self-center size-160 rounded-full"
            backgroundClassName="bg-background-secondary-highlight"
          />
          <View className="gap-14">
            <Skeleton
              className="h-52 rounded-16"
              backgroundClassName="bg-background-secondary-highlight"
            />
            <Skeleton
              className="h-52 rounded-16"
              backgroundClassName="bg-background-secondary-highlight"
            />
          </View>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="px-20 mt-20">
        <View className="bg-background-card-highlight rounded-24">
          <StateView
            variant="error"
            title="Spending could not load"
            description="Try again to refresh this month's care spending."
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        </View>
      </View>
    );
  }

  if (spendingByCategory.length <= 0) {
    return (
      <View className="px-20 mt-20">
        <View className="bg-background-card-highlight rounded-24">
          <StateView
            variant="empty"
            title="No spending yet"
            description="Track food, vet visits, and supplies to see this month's care costs."
            actionLabel="Open budget"
            onAction={() => router.push("/budget")}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="px-20 mt-20">
      <BudgetCategoryStatistic
        data={spendingByCategory}
        title="Monthly Spending"
      />
    </View>
  );
});

BudgetStatisticSection.displayName = "BudgetStatisticSection";
