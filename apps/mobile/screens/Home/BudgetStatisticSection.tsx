import { Skeleton } from "@/components/Skeleton";
import { BUDGET_STATISTIC_KEY } from "@/constants/query-keys";
import { BudgetCategoryStatistic } from "@/features/budget/components/BudgetCategoryStatistic";
import { withIconClassName } from "@/hocs/withIconClassName";
import { getBudgetMonthlyStatisticsQuery } from "@/services";
import { formatCurrency } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ReceiptIcon,
  WalletIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { memo } from "react";
import { View } from "react-native";
import {
  DashboardAction,
  DashboardCard,
  DashboardState,
} from "./DashboardCard";
import {
  HOME_BUDGET_MONTHLY_KEY,
  HOME_BUDGET_MONTHLY_PARAMS,
} from "./homeQueries";

const Wallet = withIconClassName(WalletIcon);
const Receipt = withIconClassName(ReceiptIcon);
const WarningCircle = withIconClassName(WarningCircleIcon);

const formatSpending = (value: number) => formatCurrency(value, "₫", "vi-VN");

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
  const openBudget = () => router.push("/budget");

  return (
    <DashboardCard
      title="Budget Summary"
      subtitle="This month's care spending"
      icon={
        <View className="size-40 items-center justify-center rounded-14 bg-feature-budget-surface">
          <Wallet
            size={21}
            weight="duotone"
            className="text-feature-budget-accent"
          />
        </View>
      }
    >
      {isLoading ? (
        <View
          accessibilityRole="progressbar"
          accessibilityLabel="Loading budget summary"
          className="gap-10"
        >
          <Skeleton
            className="h-52 rounded-16"
            backgroundClassName="bg-background-surface-muted"
          />
          <Skeleton
            className="h-44 rounded-16"
            backgroundClassName="bg-background-surface-muted"
          />
        </View>
      ) : isError ? (
        <DashboardState
          icon={
            <View className="size-44 items-center justify-center rounded-full bg-status-danger-surface">
              <WarningCircle
                size={24}
                weight="duotone"
                className="text-status-danger-icon"
              />
            </View>
          }
          title="Spending could not load"
          description="Try again to refresh this month's care spending."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : spendingByCategory.length === 0 ? (
        <DashboardState
          icon={
            <View className="size-44 items-center justify-center rounded-full bg-feature-budget-surface">
              <Receipt
                size={24}
                weight="duotone"
                className="text-feature-budget-accent"
              />
            </View>
          }
          title="No spending recorded this month"
          description="Track food, clinic visits, medication and grooming costs."
          actionLabel="Open Budget"
          onAction={openBudget}
        />
      ) : (
        <View>
          <BudgetCategoryStatistic data={spendingByCategory} />

          <DashboardAction
            label="Open Budget"
            accessibilityLabel="Open budget"
            onPress={openBudget}
          />
        </View>
      )}
    </DashboardCard>
  );
});

BudgetStatisticSection.displayName = "BudgetStatisticSection";
