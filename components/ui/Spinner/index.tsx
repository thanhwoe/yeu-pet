import { CircleNotchIcon as CircleNotch } from "phosphor-react-native";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const Spinner = ({ size = 24, color = "#007AFF", duration = 1000 }) => {
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
        <CircleNotch size={size} color={color} weight="bold" />
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
