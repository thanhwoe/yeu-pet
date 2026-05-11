import { IDonutChartPoints } from "@/interfaces";
import { memo } from "react";
import { View } from "react-native";
import { Pie, PolarChart } from "victory-native";

interface IProps {
  data: IDonutChartPoints;
  size?: number;
  innerRadius?: number;
}

export const DonutChart = memo<IProps>(
  ({ data, innerRadius = 50, size = 150 }) => {
    return (
      <View style={{ height: size }}>
        <PolarChart
          data={data}
          labelKey={"label"}
          valueKey={"value"}
          colorKey={"color"}
        >
          <Pie.Chart size={size} innerRadius={innerRadius} startAngle={-90}>
            {({ slice }) => {
              return <Pie.Slice />;
            }}
          </Pie.Chart>
        </PolarChart>
      </View>
    );
  },
);
DonutChart.displayName = "DonutChart";
