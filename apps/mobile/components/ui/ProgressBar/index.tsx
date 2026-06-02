import { hexToRgba } from "@/utils";
import React, { memo, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface ProgressBarProps {
  /** Value between 0 and 100. Pass undefined while loading to prevent jerk. */
  progress?: number;
  /** Height of the track in pixels */
  height?: number;
  /** Animation duration in ms */
  duration?: number;
  /** Whether the bar shows an animated shimmer while in progress */
  shimmer?: boolean;
  color?: string;
}

export const ProgressBar = memo(
  ({
    progress,
    height = 8,
    duration = 600,
    shimmer = true,
    color,
  }: ProgressBarProps) => {
    const clamped =
      progress === undefined ? undefined : Math.min(100, Math.max(0, progress));

    // -1 = not yet initialized (loading state)
    const widthProgress = useSharedValue<number>(-1);
    const shimmerX = useSharedValue(-80);
    const isShimmering = useSharedValue(false);

    // Width — snap on first value, animate on subsequent changes
    useEffect(() => {
      if (clamped === undefined) return;

      if (widthProgress.value === -1) {
        // First real value: snap with no animation to avoid jerk
        widthProgress.value = clamped;
      } else {
        widthProgress.value = withTiming(clamped, {
          duration,
          easing: Easing.out(Easing.cubic),
        });
      }
    }, [clamped, duration, widthProgress]);

    // Shimmer loop
    useEffect(() => {
      const shouldShimmer =
        shimmer && clamped !== undefined && clamped > 0 && clamped < 100;

      if (shouldShimmer && !isShimmering.value) {
        isShimmering.value = true;
        shimmerX.value = -80;
        shimmerX.value = withRepeat(
          withSequence(
            withTiming(300, {
              duration: 1600,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(-80, { duration: 0 }), // instant reset
          ),
          -1, // infinite
          false,
        );
      } else if (!shouldShimmer) {
        isShimmering.value = false;
        cancelAnimation(shimmerX);
        shimmerX.value = -80;
      }

      return () => cancelAnimation(shimmerX);
    }, [clamped, isShimmering, shimmer, shimmerX]);

    const fillStyle = useAnimatedStyle(() => {
      // Invisible until first real data arrives
      if (widthProgress.value === -1) {
        return { width: "0%", opacity: 0 };
      }
      return {
        width: `${widthProgress.value}%`,
        opacity: 1,
      };
    });

    const shimmerStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: shimmerX.value }, { skewX: "-20deg" }],
    }));

    return (
      <View className="flex-1">
        {/* Track */}
        <Animated.View
          className="w-full overflow-hidden bg-background-secondary"
          style={[
            { height, borderRadius: height / 2 },
            color ? { backgroundColor: hexToRgba(color, 0.3) } : undefined,
          ]}
        >
          {/* Fill */}
          <Animated.View
            className="overflow-hidden bg-background-secondary-highlight"
            style={[
              { height, borderRadius: height / 2 },
              color ? { backgroundColor: color } : undefined,
              fillStyle,
            ]}
          >
            {/* Shimmer overlay */}
            {shimmer && (
              <Animated.View
                className="absolute top-0 bottom-0 w-60 rounded-full"
                style={[
                  { backgroundColor: "rgba(255,255,255,0.28)" },
                  shimmerStyle,
                ]}
              />
            )}
          </Animated.View>
        </Animated.View>
      </View>
    );
  },
);

ProgressBar.displayName = "ProgressBar";
