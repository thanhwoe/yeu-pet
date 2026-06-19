import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/constants/common";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo } from "react";
import { Pressable, Modal as RNModal, StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
  presentation?: "zoom" | "fullscreen";
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
  presentation = "zoom",
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

  const animationFrame = useMemo(() => {
    const targetWidth =
      presentation === "fullscreen"
        ? SCREEN_WIDTH
        : Math.min(SCREEN_WIDTH * 0.9, SCREEN_HEIGHT * 0.8);
    const targetHeight =
      presentation === "fullscreen"
        ? SCREEN_HEIGHT
        : Math.min(SCREEN_WIDTH * 0.9, SCREEN_HEIGHT * 0.8);
    const centerX = SCREEN_WIDTH / 2;
    const centerY = SCREEN_HEIGHT / 2;

    return {
      targetWidth,
      targetHeight,
      initialScale: thumbnailFrame.width / targetWidth,
      initialTranslateX:
        thumbnailFrame.x + thumbnailFrame.width / 2 - centerX,
      initialTranslateY:
        thumbnailFrame.y + thumbnailFrame.height / 2 - centerY,
    };
  }, [presentation, thumbnailFrame]);

  useEffect(() => {
    if (visible) {
      // Set initial values
      scale.value = animationFrame.initialScale;
      translateX.value = animationFrame.initialTranslateX;
      translateY.value = animationFrame.initialTranslateY;
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
  }, [animationFrame, backdropOpacity, opacity, scale, translateX, translateY, visible]);

  const handleClose = useCallback(() => {
    // Animate back to thumbnail size and position
    scale.value = withSpring(animationFrame.initialScale, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });

    translateX.value = withSpring(animationFrame.initialTranslateX, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });

    translateY.value = withSpring(animationFrame.initialTranslateY, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });

    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onClose)();
    });

    backdropOpacity.value = withTiming(0, { duration: 200 });
  }, [animationFrame, backdropOpacity, onClose, opacity, scale, translateX, translateY]);

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
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles.modalRoot}>
        <BottomSheetModalProvider>
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
                    width: animationFrame.targetWidth,
                    height: animationFrame.targetHeight,
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
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </RNModal>
  );
};

const styles = {
  modalRoot: {
    flex: 1,
  },
};
