import {
  DashPathEffect,
  LinearGradient,
  useFont,
  vec,
} from "@shopify/react-native-skia";
import * as React from "react";
import { useState } from "react";
import { View } from "react-native";
import { Area, CartesianChart, Line, useChartPressState } from "victory-native";
import { ActiveIndicator } from "./ActiveIndicator";
import { Tooltip } from "./Tooltip";

const randomNumber = () => Math.floor(Math.random() * (50 - 25 + 1)) + 25;

const DATA = (numberPoints = 31) =>
  Array.from({ length: numberPoints }, (_, index) => ({
    day: index + 1,
    value: randomNumber(),
  }));

export const LineChart = () => {
  const font = useFont(require("@/assets/fonts/SpaceMono-Regular.ttf"), 12);
  const [data] = useState(DATA());
  const { state, isActive } = useChartPressState({
    x: 0,
    y: { value: 0 },
  });

  return (
    <View style={{ height: 300 }}>
      <CartesianChart
        xKey="day"
        yKeys={["value"]}
        chartPressState={state}
        axisOptions={{
          font,
          labelColor: { x: "#71717a", y: "#71717a" },
          tickCount: { x: 0, y: 5 },
          formatYLabel: (value) => {
            return `${value}`;
          },
        }}
        frame={{
          lineWidth: 0,
        }}
        yAxis={[
          {
            font,
            tickCount: 5,
            linePathEffect: <DashPathEffect intervals={[4, 4]} />,
          },
        ]}
        data={data}
      >
        {({ points, chartBounds }) => (
          <>
            <Line
              points={points.value}
              curveType="basis"
              color={"#FF8000"}
              strokeWidth={1}
              animate={{ type: "timing", duration: 300 }}
            />
            <Area
              points={points.value}
              y0={chartBounds.bottom}
              animate={{ type: "timing", duration: 300 }}
              curveType="basis"
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, 400)}
                colors={["#fb923c", "#fb923c50"]}
              />
            </Area>
          </>
        )}
      </CartesianChart>
      <ActiveIndicator pressState={state} height={280} />
      <Tooltip pressState={state} isPressActive={isActive} />
    </View>
  );
};
