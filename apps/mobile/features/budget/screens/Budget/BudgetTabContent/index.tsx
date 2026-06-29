import { BudgetCategoryStatistic } from "@/features/budget/components/BudgetCategoryStatistic";
import { BarChart, LineChart } from "@/features/budget/components/chart";
import { Body, Heading } from "@/components/ui/Typography";
import { withLoading } from "@/hocs/withLoading";
import { formatBudgetCurrency } from "@/utils/budget";
import {
  IBudget,
  IBudgetSpendingByCategory,
  IBudgetStatisticSummary,
  IChartPoints,
} from "@/interfaces";
import { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BudgetSection } from "../BudgetSection";

export const TABS = [
  { titleKey: "budget.tabs.month", value: 1 },
  { titleKey: "budget.tabs.year", value: 2 },
];

const LoadableBody = withLoading(Body);

export type TabValue = (typeof TABS)[number]["value"];

interface IProps {
  active: TabValue;
  month: {
    budgetData?: IBudget;
    loadingBudget: boolean;
    chartData: IChartPoints;
    loading: boolean;
    categoryData: IBudgetSpendingByCategory[];
  };
  year: {
    chartData: IChartPoints;
    summary?: IBudgetStatisticSummary;
    loading: boolean;
    categoryData: IBudgetSpendingByCategory[];
  };
}

// Separated so each tab is its own component — cleaner and memo-able
const MonthContent = memo(
  ({
    chartData,
    loading,
    categoryData,
    budgetData,
    loadingBudget,
  }: IProps["month"]) => (
    <MonthContentInner
      budgetData={budgetData}
      categoryData={categoryData}
      chartData={chartData}
      loading={loading}
      loadingBudget={loadingBudget}
    />
  ),
);

const MonthContentInner = ({
  chartData,
  loading,
  categoryData,
  budgetData,
  loadingBudget,
}: IProps["month"]) => {
  const { t } = useTranslation();

  return (
    <View className="gap-20">
      <BudgetSection data={budgetData} loading={loadingBudget} />
      <View className="flex-row items-center justify-between mt-20">
        <Heading variant="h5" weight="bold">
          {t("budget.screen.spendingTrends")}
        </Heading>
        <View className="px-12 py-4 rounded-16 bg-background-secondary">
          <Body variant="body3">{t("budget.screen.daily")}</Body>
        </View>
      </View>
      <LineChart data={chartData} isLoading={loading} />
      <BudgetCategoryStatistic
        data={categoryData}
        title={t("budget.screen.byCategory")}
        allowManage
      />
    </View>
  );
};

const YearContent = memo(
  ({ chartData, loading, categoryData, summary }: IProps["year"]) => (
    <YearContentInner
      categoryData={categoryData}
      chartData={chartData}
      loading={loading}
      summary={summary}
    />
  ),
);

const YearContentInner = ({
  chartData,
  loading,
  categoryData,
  summary,
}: IProps["year"]) => {
  const { t } = useTranslation();

  return (
    <View className="gap-20">
      <View className="rounded-16 bg-background-card-highlight py-16 px-24 gap-8">
        <Heading variant="h5" weight="semiBold" className="mb-12">
          {t("budget.screen.yearlySummary")}
        </Heading>
        <View className="justify-between flex-row gap-8">
          <Heading variant="h6" weight="light">
            {t("budget.screen.totalSpent")}
          </Heading>
          <View className="flex-1">
            <LoadableBody
              weight="bold"
              loading={loading}
              loadingSize="w-120 h-20"
              className="self-end"
            >
              {formatBudgetCurrency(summary?.totalSpent)}
            </LoadableBody>
          </View>
        </View>
        <View className="justify-between flex-row">
          <Heading variant="h6" weight="light">
            {t("budget.screen.totalTransaction")}
          </Heading>
          <View className="flex-1">
            <LoadableBody
              weight="bold"
              loading={loading}
              loadingSize="w-120 h-20"
              className="self-end"
            >
              {summary?.transactionCount}
            </LoadableBody>
          </View>
        </View>
      </View>
      <View className="flex-row items-center justify-between mt-20">
        <Heading variant="h5" weight="bold">
          {t("budget.screen.spendingTrends")}
        </Heading>
        <View className="px-12 py-4 rounded-16 bg-background-secondary">
          <Body variant="body3">{t("budget.screen.monthly")}</Body>
        </View>
      </View>
      <BarChart data={chartData} isLoading={loading} />
      <BudgetCategoryStatistic
        data={categoryData}
        title={t("budget.screen.byCategory")}
        allowManage
      />
    </View>
  );
};

MonthContent.displayName = "MonthContent";
YearContent.displayName = "YearContent";

export const BudgetTabContent = memo<IProps>((props) => {
  const opacity = useSharedValue(1);

  // Fade out → swap content → fade in on tab change
  useEffect(() => {
    opacity.value = withTiming(
      0,
      { duration: 120, easing: Easing.out(Easing.ease) },
      () => {
        opacity.value = withTiming(1, {
          duration: 500,
          easing: Easing.in(Easing.ease),
        });
      },
    );
  }, [props.active]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animStyle}>
      {props.active === 1 ? (
        <MonthContent {...props.month} />
      ) : (
        <YearContent {...props.year} />
      )}
    </Animated.View>
  );
});

BudgetTabContent.displayName = "BudgetTabContent";
