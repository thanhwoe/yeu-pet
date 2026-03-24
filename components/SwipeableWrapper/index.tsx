import { cn } from "@/utils";
import React, { ReactNode } from "react";
import { TouchableOpacity, View, ViewStyle } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Spinner } from "../ui/Spinner";
import { Body } from "../ui/Typography";

interface ActionButton {
  text?: string;
  icon?: ReactNode;
  onPress: () => void;
  width?: number;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

interface SwipeableWrapperProps {
  children: ReactNode;
  leftAction?: ActionButton;
  rightAction?: ActionButton;
  swipeThreshold?: number;
  style?: ViewStyle;
  actionButtonStyle?: ViewStyle;
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

export const SwipeableWrapper: React.FC<SwipeableWrapperProps> = ({
  children,
  leftAction,
  rightAction,
  swipeThreshold = 100,
  style,
  actionButtonStyle,
  springConfig = {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
}) => {
  const translateX = useSharedValue(0);
  const isActionTriggered = useSharedValue(false);

  const defaultActionWidth = 80;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only activate when horizontal movement > 10px
    .failOffsetY([-10, 10]) // Fail when vertical movement > 10px
    .simultaneousWithExternalGesture() // Allow other gestures to run simultaneously
    .onUpdate((event) => {
      const { translationX } = event;

      // Limit swipe range based on available actions
      let maxLeftSwipe = 0;
      let maxRightSwipe = 0;

      if (rightAction)
        maxLeftSwipe = -(rightAction.width || defaultActionWidth);
      if (leftAction) maxRightSwipe = leftAction.width || defaultActionWidth;

      // Apply constraints
      if (translationX > 0 && leftAction) {
        translateX.value = Math.min(translationX, maxRightSwipe * 1.2);
      } else if (translationX < 0 && rightAction) {
        translateX.value = Math.max(translationX, maxLeftSwipe * 1.2);
      } else if (!leftAction && translationX > 0) {
        translateX.value = 0;
      } else if (!rightAction && translationX < 0) {
        translateX.value = 0;
      } else {
        translateX.value = translationX;
      }

      // Check if threshold is reached
      const absTranslation = Math.abs(translateX.value);
      isActionTriggered.value = absTranslation > swipeThreshold;
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const absTranslation = Math.abs(translationX);
      const isSwipingFast = Math.abs(velocityX) > 500;

      // Determine if action should be triggered
      const shouldTriggerAction =
        absTranslation > swipeThreshold || isSwipingFast;

      if (shouldTriggerAction) {
        if (translationX > 0 && leftAction) {
          // Swipe right - show left action
          translateX.value = withSpring(
            leftAction.width || defaultActionWidth,
            springConfig,
          );
        } else if (translationX < 0 && rightAction) {
          // Swipe left - show right action
          translateX.value = withSpring(
            -(rightAction.width || defaultActionWidth),
            springConfig,
          );
        } else {
          // Reset if no action available
          translateX.value = withSpring(0, springConfig);
        }
      } else {
        // Reset to original position
        translateX.value = withSpring(0, springConfig);
      }

      isActionTriggered.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftActionStyle = useAnimatedStyle(() => {
    const width = leftAction?.width || defaultActionWidth;
    const opacity = interpolate(
      translateX.value,
      [0, width * 0.5, width],
      [0, 0.5, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [
        {
          translateX: interpolate(
            translateX.value,
            [0, width],
            [-width, 0],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const rightActionStyle = useAnimatedStyle(() => {
    const width = rightAction?.width || defaultActionWidth;
    const opacity = interpolate(
      translateX.value,
      [-width, -width * 0.5, 0],
      [1, 0.5, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [
        {
          translateX: interpolate(
            translateX.value,
            [-width, 0],
            [0, width],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const handleActionPress = (action: ActionButton) => {
    // Reset position and trigger action
    translateX.value = withSpring(0, springConfig);
    action.onPress();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[{ position: "relative" }, style]}>
        {/* Left Action Button */}
        {leftAction && (
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: leftAction.width || defaultActionWidth,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1,
              },
              actionButtonStyle,
              leftActionStyle,
            ]}
            className={cn("bg-background-positive", leftAction.className)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
              onPress={() => handleActionPress(leftAction)}
              activeOpacity={0.8}
              disabled={leftAction.disabled || leftAction.loading}
            >
              {leftAction.text && (
                <Body weight="semiBold" variant="body2">
                  {leftAction.text}
                </Body>
              )}
              {leftAction.icon && !leftAction.loading && leftAction.icon}
              {leftAction.loading && (
                <Spinner size={20} className="text-icon-primary" />
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Right Action Button */}
        {rightAction && (
          <Animated.View
            style={[
              {
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: rightAction.width || defaultActionWidth,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1,
              },
              actionButtonStyle,
              rightActionStyle,
            ]}
            className={cn("bg-background-negative", rightAction.className)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
              onPress={() => handleActionPress(rightAction)}
              activeOpacity={0.8}
              disabled={rightAction.disabled || rightAction.loading}
            >
              {rightAction.text && (
                <Body weight="semiBold" variant="body2">
                  {rightAction.text}
                </Body>
              )}
              {rightAction.icon && !rightAction.loading && rightAction.icon}
              {rightAction.loading && (
                <Spinner size={20} className="text-icon-primary" />
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Main Content */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ zIndex: 2 }, animatedStyle]}>
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};
