import { IChartPoints } from "@/interfaces";
import {
  DashPathEffect,
  LinearGradient,
  useFont,
  vec,
} from "@shopify/react-native-skia";
import React from "react";
import { View } from "react-native";
import { Bar, CartesianChart } from "victory-native";
import { Skeleton } from "../Skeleton";

interface BarChartProps {
  data: IChartPoints;
  isLoading?: boolean;
}

export const BarChart = ({ data, isLoading }: BarChartProps) => {
  const font = useFont(require("@/assets/fonts/SpaceMono-Regular.ttf"), 12);

  if (isLoading && !data) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <View style={{ height: 300 }}>
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
          labelColor: "#71717a",
          lineWidth: 0,
          formatXLabel: (value) => {
            const date = new Date(2023, Number(value) - 1);
            return date.toLocaleString("default", { month: "short" });
          },
        }}
        frame={{
          lineWidth: 0,
        }}
        yAxis={[
          {
            tickCount: 5,
            linePathEffect: <DashPathEffect intervals={[4, 4]} />,
          },
        ]}
        data={data}
      >
        {({ points, chartBounds }) => {
          return (
            <Bar
              points={points.value}
              chartBounds={chartBounds}
              animate={{ type: "timing", duration: 300 }}
              innerPadding={0.33}
              roundedCorners={{
                topLeft: 5,
                topRight: 5,
              }}
              labels={{ font, color: "#262626", position: "top" }}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, 400)}
                colors={["#fb923c", "#fb923c50"]}
              />
            </Bar>
          );
        }}
      </CartesianChart>
    </View>
  );
};
