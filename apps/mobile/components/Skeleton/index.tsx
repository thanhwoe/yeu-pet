import { hexToRgba } from "@/utils";
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
  backgroundColor?: string;
}
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export const SkeletonBase = ({
  style,
  backgroundColor = "#FF9947",
  ...props
}: SkeletonProps) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.5, {
        duration: 1000,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
      }),
      -1,
      true,
    );
  }, [opacity]);

  return (
    <AnimatedLinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      colors={[
        hexToRgba(backgroundColor, 1),
        hexToRgba(backgroundColor, 0.5),
        hexToRgba(backgroundColor, 0.2),
      ]}
      style={[{ opacity: opacity }, style]}
      {...props}
    />
  );
};

export const Skeleton = cssInterop(SkeletonBase, {
  backgroundClassName: {
    target: false,
    nativeStyleToProp: {
      backgroundColor: "backgroundColor",
    },
  },
  className: {
    target: "style",
  },
});
