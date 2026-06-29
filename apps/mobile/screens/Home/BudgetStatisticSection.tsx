import { Skeleton } from "@/components/Skeleton";
import { BUDGET_STATISTIC_KEY } from "@/constants/query-keys";
import { BudgetCategoryStatistic } from "@/features/budget/components/BudgetCategoryStatistic";
import { withIconClassName } from "@/hocs/withIconClassName";
import { getBudgetMonthlyStatisticsQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  ReceiptIcon,
  WalletIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { memo } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
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

export const BudgetStatisticSection = memo(() => {
  const { t } = useTranslation();
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
      title={t("home.budget.title")}
      subtitle={t("home.budget.subtitle")}
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
          accessibilityLabel={t("home.budget.loadingAccessibility")}
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
          title={t("home.budget.errorTitle")}
          description={t("home.budget.errorDescription")}
          actionLabel={t("common.retry")}
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
          title={t("home.budget.emptyTitle")}
          description={t("home.budget.emptyDescription")}
          actionLabel={t("home.budget.action")}
          onAction={openBudget}
        />
      ) : (
        <View>
          <BudgetCategoryStatistic data={spendingByCategory} />

          <DashboardAction
            label={t("home.budget.action")}
            accessibilityLabel={t("home.budget.actionAccessibility")}
            onPress={openBudget}
          />
        </View>
      )}
    </DashboardCard>
  );
});

BudgetStatisticSection.displayName = "BudgetStatisticSection";
