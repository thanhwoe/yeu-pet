import { IChartPoints } from "@/interfaces";
import { abbreviateNumber, hexToRgba } from "@/utils";
import {
  DashPathEffect,
  LinearGradient,
  useFont,
  vec,
} from "@shopify/react-native-skia";
import { useUnstableNativeVariable } from "nativewind";
import * as React from "react";
import { View } from "react-native";
import { Area, CartesianChart, Line, useChartPressState } from "victory-native";
import { Skeleton } from "../Skeleton";
import { ActiveIndicator } from "./ActiveIndicator";
import { Tooltip } from "./Tooltip";

interface LineChartProps {
  data: IChartPoints;
  isLoading?: boolean;
}

export const LineChart = React.memo(({ data, isLoading }: LineChartProps) => {
  const font = useFont(require("@/assets/fonts/Nunito-Regular.ttf"), 12);
  const { state, isActive } = useChartPressState({
    x: "",
    y: { value: 0 },
  });

  const textColor = useUnstableNativeVariable(
    "--text-primary",
  ) as unknown as string;
  const lineColor = useUnstableNativeVariable("--line-secondary");
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
    <View style={{ height: 300 }}>
      <CartesianChart
        xKey="date"
        yKeys={["value"]}
        chartPressState={state}
        frame={{
          lineWidth: 0,
        }}
        yAxis={[
          {
            font,
            labelColor: textColor,
            tickCount: 5,
            formatYLabel: (value) => {
              return abbreviateNumber(value);
            },
            lineColor: textColor,
            linePathEffect: <DashPathEffect intervals={[4, 4]} />,
          },
        ]}
        data={[{ date: "start", value: 0 }, ...data, { date: "end", value: 0 }]}
      >
        {({ points, chartBounds }) => (
          <>
            <Line
              points={points.value}
              curveType="monotoneX"
              color={lineColor}
              strokeWidth={1}
              animate={{ type: "timing", duration: 300 }}
            />
            <Area
              points={points.value}
              y0={chartBounds.bottom}
              animate={{ type: "timing", duration: 300 }}
              curveType="monotoneX"
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, 400)}
                colors={[
                  bgColor,
                  hexToRgba(bgColor, 0.4),
                  hexToRgba(bgColor, 0.1),
                ]}
              />
            </Area>
          </>
        )}
      </CartesianChart>
      <ActiveIndicator pressState={state} height={280} />
      <Tooltip pressState={state} isPressActive={isActive} />
    </View>
  );
});

LineChart.displayName = "LineChart";
