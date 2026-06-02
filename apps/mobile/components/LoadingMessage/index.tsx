import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export const LoadingMessage = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.ease }),
        withTiming(0, { duration: 400, easing: Easing.ease })
      ),
      -1,
      false
    );

    const dot2Timer = setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.ease }),
          withTiming(0, { duration: 400, easing: Easing.ease })
        ),
        -1,
        false
      );
    }, 133);

    const dot3Timer = setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.ease }),
          withTiming(0, { duration: 400, easing: Easing.ease })
        ),
        -1,
        false
      );
    }, 266);

    return () => {
      clearTimeout(dot2Timer);
      clearTimeout(dot3Timer);
    };
  }, [dot1, dot2, dot3]);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: 0.3 + dot1.value * 0.7,
    transform: [{ translateY: -dot1.value * 4 }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: 0.3 + dot2.value * 0.7,
    transform: [{ translateY: -dot2.value * 4 }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: 0.3 + dot3.value * 0.7,
    transform: [{ translateY: -dot3.value * 4 }],
  }));

  return (
    <View className="flex-row items-center justify-start pb-2 pt-3 pr-4 pl-3 bg-background-chat-left rounded-3xl self-start max-w-[60px]">
      <Animated.View
        style={dot1Style}
        className="w-2 h-2 bg-icon-secondary rounded-full mr-1.5"
      />
      <Animated.View
        style={dot2Style}
        className="w-2 h-2 bg-icon-secondary rounded-full mr-1.5"
      />
      <Animated.View
        style={dot3Style}
        className="w-2 h-2 bg-icon-secondary rounded-full"
      />
    </View>
  );
};
