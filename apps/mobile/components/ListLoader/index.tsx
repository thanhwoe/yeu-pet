import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const ListLoader = ({ size = 12, spacing = 8 }) => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animationConfig = {
      duration: 600,
      easing: Easing.inOut(Easing.ease),
    };

    dot1.value = withRepeat(withTiming(1, animationConfig), -1, true);

    dot2.value = withRepeat(
      withDelay(200, withTiming(1, animationConfig)),
      -1,
      true
    );

    dot3.value = withRepeat(
      withDelay(400, withTiming(1, animationConfig)),
      -1,
      true
    );
  }, [dot1, dot2, dot3]);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: 0.3 + dot1.value * 0.7,
    transform: [
      {
        translateY: -dot1.value * 10,
      },
      {
        scale: 0.8 + dot1.value * 0.4,
      },
    ],
  }));
  const dot2Style = useAnimatedStyle(() => ({
    opacity: 0.3 + dot2.value * 0.7,
    transform: [
      {
        translateY: -dot2.value * 10,
      },
      {
        scale: 0.8 + dot2.value * 0.4,
      },
    ],
  }));
  const dot3Style = useAnimatedStyle(() => ({
    opacity: 0.3 + dot3.value * 0.7,
    transform: [
      {
        translateY: -dot3.value * 10,
      },
      {
        scale: 0.8 + dot3.value * 0.4,
      },
    ],
  }));

  return (
    <View
      className="flex-row items-center justify-center py-2"
      style={{ gap: spacing }}
    >
      <Animated.View
        className="rounded-full bg-background-secondary"
        style={[{ width: size, height: size }, dot1Style]}
      />
      <Animated.View
        className="rounded-full bg-background-secondary"
        style={[{ width: size, height: size }, dot2Style]}
      />
      <Animated.View
        className="rounded-full bg-background-secondary"
        style={[{ width: size, height: size }, dot3Style]}
      />
    </View>
  );
};
