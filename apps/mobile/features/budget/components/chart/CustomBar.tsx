import { abbreviateNumber, hexToRgba } from "@/utils";
import {
  Group,
  LinearGradient,
  Path,
  Skia,
  Text,
  useFont,
  vec,
} from "@shopify/react-native-skia";
import { ChartBounds, PointsArray } from "victory-native";

interface CustomBarsProps {
  points: PointsArray;
  chartBounds: ChartBounds;
  font: ReturnType<typeof useFont>;
  textColor: string;
  bgColor: string;
  innerPadding?: number;
  barRadius?: number;
}

const makeRoundedTopPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  const r = Math.min(radius, width / 2, height / 2);
  const path = Skia.Path.Make();

  path.moveTo(x, y + height); // bottom-left
  path.lineTo(x, y + r); // left side up
  path.arcToTangent(x, y, x + r, y, r); // top-left corner
  path.lineTo(x + width - r, y); // top edge
  path.arcToTangent(x + width, y, x + width, y + r, r); // top-right corner
  path.lineTo(x + width, y + height); // right side down
  path.close();

  return path;
};

export const CustomBar = ({
  points,
  chartBounds,
  font,
  textColor,
  bgColor,
  innerPadding = 0.33,
  barRadius = 5,
}: CustomBarsProps) => {
  // Calculate bar width from padding
  const totalWidth = chartBounds.right - chartBounds.left;
  const barCount = points.length;
  const barWidth = (totalWidth / barCount) * (1 - innerPadding);

  return (
    <Group>
      {points.map((point, i) => {
        if (point.y === null || point.y === undefined) return null;

        const x = (point.x ?? 0) - barWidth / 2;
        const y = point.y ?? 0;
        const barHeight = chartBounds.bottom - y;

        if (barHeight <= 0) return null;

        const rawValue = point.yValue ?? 0;
        const label = abbreviateNumber(rawValue);
        const labelWidth = font ? font.measureText(label).width : 0;
        const labelX = (point.x ?? 0) - labelWidth / 2;
        const labelY = y - 6;

        const barPath = makeRoundedTopPath(
          x,
          y,
          barWidth,
          barHeight,
          barRadius,
        );

        return (
          <Group key={i}>
            {/* Bar with proper rounded top corners */}
            <Path path={barPath} style="fill">
              <LinearGradient
                start={vec(0, y)}
                end={vec(0, chartBounds.bottom)}
                colors={[
                  bgColor,
                  hexToRgba(bgColor, 0.4),
                  hexToRgba(bgColor, 0.1),
                ]}
              />
            </Path>

            {/* Formatted label above bar */}
            {font && rawValue > 0 && (
              <Text
                x={labelX}
                y={labelY}
                text={label}
                font={font}
                color={textColor}
              />
            )}
          </Group>
        );
      })}
    </Group>
  );
};
