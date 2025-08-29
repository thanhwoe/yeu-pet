import {
  DashPathEffect,
  LinearGradient,
  useFont,
  vec,
} from "@shopify/react-native-skia";
import React, { useState } from "react";
import { View } from "react-native";
import { Bar, CartesianChart } from "victory-native";

const DATA = (length: number = 10) =>
  Array.from({ length }, (_, index) => ({
    month: index + 1,
    listenCount: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
  }));

export const BarChart = () => {
  const font = useFont(require("@/assets/fonts/SpaceMono-Regular.ttf"), 12);
  const [data] = useState(DATA(12));

  return (
    <View style={{ height: 300 }}>
      <CartesianChart
        xKey="month"
        yKeys={["listenCount"]}
        padding={{
          bottom: 10,
        }}
        domainPadding={{ left: 20, right: 20, top: 30 }}
        domain={{ y: [0, 100] }}
        xAxis={{
          font,
          tickCount: 12,
          labelColor: "#71717a",
          lineWidth: 0,
          formatXLabel: (value) => {
            const date = new Date(2023, value - 1);
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
              points={points.listenCount}
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
