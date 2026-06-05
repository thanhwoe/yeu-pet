import { IChartPoints } from "@/interfaces";
import { abbreviateNumber } from "@/utils";
import { DashPathEffect, useFont } from "@shopify/react-native-skia";
import dayjs from "dayjs";
import { useUnstableNativeVariable } from "nativewind";
import React, { memo } from "react";
import { View } from "react-native";
import { CartesianChart } from "victory-native";
import { Skeleton } from "@/components/Skeleton";
import { CustomBar } from "./CustomBar";

interface BarChartProps {
  data: IChartPoints;
  isLoading?: boolean;
}

export const BarChart = memo(({ data, isLoading }: BarChartProps) => {
  const font = useFont(require("@/assets/fonts/Nunito-Regular.ttf"), 12);

  const textColor = useUnstableNativeVariable(
    "--text-primary",
  ) as unknown as string;
  const bgColor = useUnstableNativeVariable(
    "--background-primary",
  ) as unknown as string;

  if (isLoading && !data) {
    return (
      <Skeleton
        className="h-[300px] w-full"
        backgroundClassName="bg-background-primary"
      />
    );
  }

  return (
    <View style={{ height: 300 }} className="pb-16">
      <CartesianChart
        xKey="date"
        yKeys={["value"]}
        padding={{
          bottom: 10,
        }}
        domainPadding={{ left: 20, right: 20, top: 30 }}
        xAxis={{
          font,
          tickCount: 12,
          labelColor: textColor,
          lineWidth: 0,
          formatXLabel: (value) => {
            return dayjs()
              .month(Number(value) - 1)
              .format("MM");
          },
        }}
        frame={{
          lineWidth: 0,
        }}
        yAxis={[
          {
            font,
            labelColor: textColor,
            formatYLabel: (value) => {
              return abbreviateNumber(value);
            },
            lineColor: textColor,
            tickCount: 5,
            linePathEffect: <DashPathEffect intervals={[4, 4]} />,
          },
        ]}
        data={data}
      >
        {({ points, chartBounds }) => (
          <CustomBar
            points={points.value}
            chartBounds={chartBounds}
            font={font}
            textColor={textColor}
            bgColor={bgColor}
            innerPadding={0.33}
            barRadius={5}
          />
        )}
      </CartesianChart>
    </View>
  );
});

BarChart.displayName = "BarChart";
