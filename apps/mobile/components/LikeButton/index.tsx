import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { HeartIcon as Heart } from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Text } from "../ui/Text";

const HeartIcon = withIconClassName(Heart);

interface HeartExplosionButtonProps {
  size?: number;
  color?: string;
  explosionHearts?: number;
  onPress?: () => void;
  className?: string;
  label?: string;
  active?: boolean;
  disabled?: boolean;
}

interface ExplosionIconProps {
  size: number;
  color: string;
  angle: number;
  delay: number;
  distance: number;
  trigger: boolean;
  onComplete?: () => void;
}

// Individual explosion heart component with multi-stage animation
const ExplosionIcon: React.FC<ExplosionIconProps> = ({
  size,
  color,
  angle,
  delay,
  distance,
  trigger,
  onComplete,
}) => {
  const scale = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      const rotationDirection = Math.random() > 0.5 ? 1 : -1;

      // Multi-stage animation similar to your web example
      // Stage 1: Appear and scale up while moving 30% of distance
      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(1.2, {
            duration: 450, // 30% of 1500ms
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
          // Stage 2: Scale to normal while moving to 80% of distance
          withTiming(1, {
            duration: 750, // 50% of 1500ms
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
          // Stage 3: Scale down to 0 while completing movement
          withTiming(
            0,
            {
              duration: 300, // 20% of 1500ms
              easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            },
            () => {
              onComplete && runOnJS(onComplete)();
            }
          )
        )
      );

      // X movement with keyframe-like progression
      translateX.value = withDelay(
        delay,
        withSequence(
          withTiming(endX * 0.3, {
            duration: 450,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
          withTiming(endX * 0.8, {
            duration: 750,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
          withTiming(endX, {
            duration: 300,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          })
        )
      );

      // Y movement with same progression
      translateY.value = withDelay(
        delay,
        withSequence(
          withTiming(endY * 0.3, {
            duration: 450,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
          withTiming(endY * 0.8, {
            duration: 750,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
          withTiming(endY, {
            duration: 300,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          })
        )
      );

      // Opacity with staged fade
      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, {
            duration: 450,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
          withTiming(1, {
            duration: 750,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
          withTiming(0, {
            duration: 300,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          })
        )
      );

      // Smooth rotation
      rotation.value = withDelay(
        delay,
        withTiming(360 * rotationDirection, {
          duration: 1500,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        })
      );
    } else {
      // Reset all values
      scale.value = 0;
      translateX.value = 0;
      translateY.value = 0;
      opacity.value = 0;
      rotation.value = 0;
    }
  }, [
    angle,
    delay,
    distance,
    onComplete,
    opacity,
    rotation,
    scale,
    translateX,
    translateY,
    trigger,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
    >
      <HeartIcon size={size} color={color} />
    </Animated.View>
  );
};

export const LikeButton: React.FC<HeartExplosionButtonProps> = ({
  size = 60,
  color = "#FF3838",
  explosionHearts = 8,
  onPress,
  className,
  label,
  active,
  disabled,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [animatingHearts, setAnimatingHearts] = useState(false);
  const completedAnimations = useRef(0);
  const scale = useSharedValue(1);

  // Generate explosion parameters with fixed angles like your example
  const explosionParams = useMemo(() => {
    const baseAngles = [];
    for (let i = 0; i < explosionHearts; i++) {
      baseAngles.push((i / explosionHearts) * Math.PI * 2);
    }

    return baseAngles.map((angle, index) => ({
      angle,
      delay: index * 50, // Staggered delays
      distance: 120 + (index % 2) * 40, // Varying distances like your example
    }));
  }, [explosionHearts]);

  const handleHeartAnimationComplete = useCallback(() => {
    completedAnimations.current++;
    if (completedAnimations.current >= explosionHearts) {
      setAnimatingHearts(false);
      setIsPressed(false);
      completedAnimations.current = 0;
    }
  }, [explosionHearts]);

  const handlePress = useCallback(() => {
    if (isPressed) return;

    setIsPressed(true);
    completedAnimations.current = 0;
    onPress?.();

    // Button press animation - scale down then up then normal
    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1.1, { duration: 200 }),
      withTiming(1, { duration: 100 })
    );

    // Start heart explosion after button animation
    setTimeout(() => {
      setAnimatingHearts(true);
    }, 200);
  }, [isPressed, onPress, scale]);

  const mainHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      className={cn("items-center justify-center ", className)}
      style={{ width: size * 4, height: size * 4 }}
    >
      {explosionParams.map((params, index) => (
        <ExplosionIcon
          key={index}
          size={size * 0.5}
          color={color}
          angle={params.angle}
          delay={params.delay}
          distance={params.distance}
          trigger={animatingHearts}
          onComplete={handleHeartAnimationComplete}
        />
      ))}

      <TouchableOpacity
        onPress={handlePress}
        disabled={isPressed || disabled}
        activeOpacity={0.9}
        className="items-center justify-center rounded-full"
      >
        <Animated.View style={mainHeartStyle}>
          <HeartIcon
            size={size * 0.6}
            color={color}
            weight={active ? "fill" : "regular"}
          />
        </Animated.View>
      </TouchableOpacity>
      <Text className="text-text-primary-inverse">{label}</Text>
    </View>
  );
};
