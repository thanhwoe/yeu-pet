import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/constants/common";
import React, { useEffect } from "react";
import { Pressable, Modal as RNModal, StatusBar, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface ZoomOutModalProps {
  visible: boolean;
  onClose: () => void;
  thumbnailFrame?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  children: React.ReactNode;
}

export const Modal: React.FC<ZoomOutModalProps> = ({
  visible,
  onClose,
  thumbnailFrame = {
    x: SCREEN_WIDTH / 2 - 50,
    y: SCREEN_HEIGHT / 2 - 50,
    width: 100,
    height: 100,
  },
  children,
}) => {
  const scale = useSharedValue(0.1);
  const opacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Calculate the center positions
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;

  // Calculate initial position offset from thumbnail to center
  const initialTranslateX =
    thumbnailFrame.x + thumbnailFrame.width / 2 - centerX;
  const initialTranslateY =
    thumbnailFrame.y + thumbnailFrame.height / 2 - centerY;

  useEffect(() => {
    if (visible) {
      // Set initial values
      scale.value =
        thumbnailFrame.width /
        Math.min(SCREEN_WIDTH * 0.9, SCREEN_HEIGHT * 0.8);
      translateX.value = initialTranslateX;
      translateY.value = initialTranslateY;
      opacity.value = 0;
      backdropOpacity.value = 0;

      // Animate to full size
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 90,
        mass: 1,
      });

      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
        mass: 1,
      });

      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
        mass: 1,
      });

      opacity.value = withTiming(1, { duration: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [visible]);

  const handleClose = () => {
    // Animate back to thumbnail size and position
    scale.value = withSpring(
      thumbnailFrame.width / Math.min(SCREEN_WIDTH * 0.9, SCREEN_HEIGHT * 0.8),
      {
        damping: 20,
        stiffness: 90,
        mass: 1,
      },
    );

    translateX.value = withSpring(initialTranslateX, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });

    translateY.value = withSpring(initialTranslateY, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });

    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onClose)();
    });

    backdropOpacity.value = withTiming(0, { duration: 200 });
  };

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) return null;

  return (
    <RNModal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
    >
      <View className="flex-1">
        <StatusBar
          backgroundColor="transparent"
          barStyle="light-content"
          translucent
        />

        {/* Animated Backdrop */}
        <Animated.View
          style={animatedBackdropStyle}
          className="absolute inset-0 bg-black/90"
        />

        {/* Pressable overlay for closing */}
        <Pressable
          className="flex-1 justify-center items-center"
          onPress={handleClose}
        >
          {/* Image Container */}
          <Animated.View
            style={[
              animatedImageStyle,
              {
                width: Math.min(SCREEN_WIDTH * 0.9, SCREEN_HEIGHT * 0.8),
                height: Math.min(SCREEN_WIDTH * 0.9, SCREEN_HEIGHT * 0.8),
              },
            ]}
            className="justify-center items-center"
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {children}
            </Pressable>
          </Animated.View>
        </Pressable>
      </View>
    </RNModal>
  );
};
