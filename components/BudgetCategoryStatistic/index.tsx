import { IBudgetSpendingByCategory } from "@/interfaces";
import { hexToRgba } from "@/utils";
import { Link } from "expo-router";
import { memo, useMemo } from "react";
import { View } from "react-native";
import { DonutChart } from "../chart/DonutChart";
import { ProgressBar } from "../ui/ProgressBar";
import { Body, Heading } from "../ui/Typography";

interface IProps {
  data: IBudgetSpendingByCategory[];
  title: string;
  allowManage?: boolean;
}

export const BudgetCategoryStatistic = memo<IProps>(
  ({ data, title, allowManage = false }) => {
    const chartDate = useMemo(() => {
      return data.map((i) => ({
        label: i.category.id,
        value: i.total,
        color: i.category.color,
      }));
    }, [data]);

    if (data.length <= 0) {
      return null;
    }

    return (
      <View className="p-20 bg-background-card-highlight rounded-24 gap-24">
        <View className="flex-row justify-between items-center">
          <Heading variant="h4" weight="bold">
            {title}
          </Heading>
          {allowManage && (
            <Link href="/budget/categories">
              <Body className="text-text-link">Manage</Body>
            </Link>
          )}
        </View>
        <DonutChart data={chartDate} />
        <View className="gap-16">
          {data.map((i) => (
            <View key={i.category.id} className="flex-row gap-12">
              <View
                className="items-center justify-center rounded-8 size-40"
                style={{
                  backgroundColor: hexToRgba(i.category.color, 0.5),
                }}
              >
                <Body>{i.category.emoji}</Body>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Body>{i.category.name}</Body>
                  <Body weight="bold">{i.total.toLocaleString()}</Body>
                </View>
                <ProgressBar
                  shimmer={false}
                  height={8}
                  progress={i.percentage}
                  color={i.category.color}
                />
              </View>
              <Body className="text-text-primary-disabled self-end">
                {i.percentage}%
              </Body>
            </View>
          ))}
        </View>
      </View>
    );
  },
);
BudgetCategoryStatistic.displayName = "BudgetCategoryStatistic";
