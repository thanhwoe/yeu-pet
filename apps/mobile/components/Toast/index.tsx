import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import type { NotificationCategory } from "@/interfaces";
import { triggerHaptic } from "@/utils";
import { Text } from "../ui/Text";
import { Background } from "./Background";
import { Close } from "./Close";
import { ToastIcon } from "./Icon";
import {
  addNewRef,
  getRef,
  removeOldRef,
  ToastParams,
  ToastProps,
  ToastRef,
  ToastVariants,
} from "./utils";

const TOAST_HIDDEN_TRANSLATE_Y = -160;
const TOAST_VISIBLE_OFFSET = 8;
const TOAST_SPRING_CONFIG = {
  damping: 18,
  stiffness: 180,
};
const TOAST_DISMISS_DURATION = 180;

type ToastRootProps = {
  ref: (ref: ToastRef | null) => void;
};

export const ToastRoot = ({ ref }: ToastRootProps) => {
  const insets = useSafeAreaInsets();
  const { isDarkColorScheme } = useColorScheme();
  const toastTranslateY = useSharedValue(TOAST_HIDDEN_TRANSLATE_Y);
  const context = useSharedValue(0);
  const [showing, setShowing] = useState(false);
  const [toastType, setToastType] = useState<ToastVariants>(
    ToastVariants.DEFAULT,
  );
  const [toastText, setToastText] = useState("");
  const [toastTitle, setToastTitle] = useState("");
  const [toastDuration, setToastDuration] = useState(0);
  const [toastNotificationType, setToastNotificationType] =
    useState<NotificationCategory>("system");
  const [toastInteractive, setToastInteractive] = useState(false);
  const [toastAccessibilityLabel, setToastAccessibilityLabel] = useState("");
  const [toastAccessibilityHint, setToastAccessibilityHint] = useState("");
  const toastOnPressRef = useRef<(() => void) | undefined>(undefined);

  const handleHidden = useCallback(() => {
    setShowing(false);
    setToastTitle("");
    setToastText("");
    setToastInteractive(false);
    setToastAccessibilityLabel("");
    setToastAccessibilityHint("");
    toastOnPressRef.current = undefined;
  }, []);

  const animateInAndScheduleHide = useCallback(
    (duration: number) => {
      toastTranslateY.value = withSequence(
        withSpring(0, TOAST_SPRING_CONFIG),
        withDelay(
          duration,
          withTiming(
            TOAST_HIDDEN_TRANSLATE_Y,
            { duration: TOAST_DISMISS_DURATION },
            (finish) => {
              if (finish) {
                runOnJS(handleHidden)();
              }
            },
          ),
        ),
      );
    },
    [handleHidden, toastTranslateY],
  );

  const show = useCallback(
    ({
      type,
      text,
      title,
      duration = 2000,
      notificationType = "system",
      onPress,
      accessibilityLabel,
      accessibilityHint,
    }: ToastProps) => {
      cancelAnimation(toastTranslateY);
      setShowing(true);
      setToastType(type);
      setToastText(text);
      setToastDuration(duration);
      setToastTitle(title ?? "");
      setToastNotificationType(notificationType);
      setToastInteractive(Boolean(onPress));
      setToastAccessibilityLabel(accessibilityLabel ?? "");
      setToastAccessibilityHint(accessibilityHint ?? "");
      toastOnPressRef.current = onPress;
      toastTranslateY.value = TOAST_HIDDEN_TRANSLATE_Y;
      animateInAndScheduleHide(duration);
    },
    [animateInAndScheduleHide, toastTranslateY],
  );

  const hide = useCallback(() => {
    cancelAnimation(toastTranslateY);
    toastTranslateY.value = withTiming(
      TOAST_HIDDEN_TRANSLATE_Y,
      { duration: TOAST_DISMISS_DURATION },
      (finish) => {
        if (finish) {
          runOnJS(handleHidden)();
        }
      },
    );
  }, [handleHidden, toastTranslateY]);

  const handleToastPress = useCallback(() => {
    const onPress = toastOnPressRef.current;
    hide();
    onPress?.();
  }, [hide]);

  useImperativeHandle(
    ref,
    useCallback(
      () => ({
        show,
      }),
      [show],
    ),
  );

  const animatedToastStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: toastTranslateY.value }],
    };
  });

  const pan = Gesture.Pan()
    .onBegin(() => {
      cancelAnimation(toastTranslateY);
      context.value = toastTranslateY.value;
    })
    .onUpdate((event) => {
      const nextValue = context.value + event.translationY;
      toastTranslateY.value = Math.min(
        20,
        Math.max(TOAST_HIDDEN_TRANSLATE_Y, nextValue),
      );
    })
    .onEnd((event) => {
      if (event.translationY < -20 || event.velocityY < -450) {
        toastTranslateY.value = withTiming(
          TOAST_HIDDEN_TRANSLATE_Y,
          { duration: TOAST_DISMISS_DURATION },
          (finish) => {
            if (finish) {
              runOnJS(handleHidden)();
            }
          },
        );
      } else {
        toastTranslateY.value = withSequence(
          withSpring(0, TOAST_SPRING_CONFIG),
          withDelay(
            toastDuration,
            withTiming(
              TOAST_HIDDEN_TRANSLATE_Y,
              { duration: TOAST_DISMISS_DURATION },
              (finish) => {
                if (finish) {
                  runOnJS(handleHidden)();
                }
              },
            ),
          ),
        );
      }
    });
  if (!showing) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.overlayRoot}>
      <GestureDetector gesture={pan}>
        <Animated.View
          accessibilityLiveRegion="polite"
          accessibilityRole={toastInteractive ? undefined : "alert"}
          className="absolute left-0 right-0"
          pointerEvents="box-none"
          style={[
            styles.toastContainer,
            { top: insets.top + TOAST_VISIBLE_OFFSET },
            animatedToastStyles,
          ]}
        >
          <Background
            tone={isDarkColorScheme ? "dark" : "light"}
            variant={toastType}
          >
            <Pressable
              accessibilityRole={toastInteractive ? "button" : undefined}
              accessibilityLabel={
                toastInteractive
                  ? toastAccessibilityLabel ||
                    [toastTitle, toastText].filter(Boolean).join(". ")
                  : undefined
              }
              accessibilityHint={
                toastInteractive
                  ? toastAccessibilityHint || "Opens this notification"
                  : undefined
              }
              className="min-h-44 flex-1 flex-row items-start gap-10"
              disabled={!toastInteractive}
              onPress={handleToastPress}
            >
              {({ pressed }) => (
                <>
                  <ToastIcon
                    variant={toastType}
                    notificationType={toastNotificationType}
                  />
                  <View
                    className="flex-1 gap-2 py-1"
                    style={{ opacity: pressed ? 0.7 : 1 }}
                  >
                    {toastTitle && (
                      <Text
                        variant="footnote"
                        numberOfLines={1}
                        className="font-semibold text-text-primary"
                      >
                        {toastTitle}
                      </Text>
                    )}
                    <Text
                      variant={toastTitle ? "caption1" : "footnote"}
                      className="text-text-secondary"
                      numberOfLines={2}
                    >
                      {toastText}
                    </Text>
                  </View>
                </>
              )}
            </Pressable>
            <Close onPress={hide} />
          </Background>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFill,
    elevation: 9999,
    zIndex: 9999,
  },
  toastContainer: {
    elevation: 9999,
    zIndex: 9999,
  },
});

export function Toast() {
  const toastRef = useRef<ToastRef | null>(null);

  const setRef = useCallback((ref: ToastRef | null) => {
    // Since we know there's a ref, we'll update `refs` to use it.
    if (ref) {
      // store the ref in this toast instance to be able to remove it from the array later when the ref becomes null.
      toastRef.current = ref;
      addNewRef(ref);
    } else {
      // remove the this toast's ref, wherever it is in the array.
      removeOldRef(toastRef.current);
    }
  }, []);

  return <ToastRoot ref={setRef} />;
}

Toast.error = (params: ToastParams) => {
  triggerHaptic("error");
  getRef()?.show({ ...params, type: ToastVariants.ERROR });
};

Toast.show = (params: ToastParams) => {
  getRef()?.show({ ...params, type: ToastVariants.DEFAULT });
};

Toast.notification = (params: ToastParams) => {
  getRef()?.show({
    ...params,
    duration: params.duration ?? 5000,
    type: ToastVariants.NOTIFICATION,
  });
};

Toast.success = (params: ToastParams) => {
  triggerHaptic("success");
  getRef()?.show({ ...params, type: ToastVariants.SUCCESS });
};

Toast.warn = (params: ToastParams) => {
  triggerHaptic("warning");
  getRef()?.show({ ...params, type: ToastVariants.WARNING });
};
