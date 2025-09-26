import { withIconClassName } from "@/hocs/withIconClassName";
import { CircleNotchIcon } from "phosphor-react-native";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const Icon = withIconClassName(CircleNotchIcon);

export const Spinner = ({
  size = 24,
  className,
  duration = 1000,
}: {
  size?: number;
  className: string;
  duration?: number;
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration }),
      -1, // infinite repeats
      false // don't reverse
    );
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Icon size={size} className={className} weight="bold" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
