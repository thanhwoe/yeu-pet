import { useColorScheme } from "@/hooks/useColorScheme";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import Svg, { Line } from "react-native-svg";
import { ChartPressState } from "victory-native";

interface ActiveIndicatorProps {
  height: number;
  pressState?: ChartPressState<{
    x: any;
    y: any;
  }>;
}

export const ActiveIndicator = ({
  height,
  pressState,
}: ActiveIndicatorProps) => {
  const { colorScheme } = useColorScheme();

  const animateX = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: pressState?.isActive.value
            ? pressState?.x?.position?.value ?? 0
            : -100,
        },
      ],
    };
  }, [pressState]);

  const lineColor = colorScheme === "light" ? "#1E1E1E" : "#F5F7F6";
  return (
    <Animated.View
      style={[animateX, { position: "absolute", width: 1, height }]}
    >
      <Svg>
        <Line
          x1={0}
          x2={0}
          y1={0}
          y2={height}
          strokeWidth={1}
          strokeDasharray="2"
          stroke={lineColor}
        />
      </Svg>
    </Animated.View>
  );
};
