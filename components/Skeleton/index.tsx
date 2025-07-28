import { LinearGradient, LinearGradientProps } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { useEffect } from "react";
import { ViewStyle } from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonProps extends Omit<LinearGradientProps, "colors"> {
  className: string;
  startColorClassName?: string;
  endColorClassName?: string;
  style?: ViewStyle;
}
const AnimatedLinearGradient = cssInterop(
  Animated.createAnimatedComponent(LinearGradient),
  {
    className: {
      target: "style",
    },
  }
);

export const Skeleton = ({ style, ...props }: SkeletonProps) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.5, {
        duration: 1000,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
      }),
      -1,
      true
    );
  }, [opacity]);

  return (
    <AnimatedLinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      colors={["#FED16A", "#FFDE63", "#FFF4A4"]}
      style={[{ opacity: opacity }, style]}
      {...props}
    />
  );
};
