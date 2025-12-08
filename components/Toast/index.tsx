import { withIconClassName } from "@/hocs/withIconClassName";
import { X } from "phosphor-react-native";
import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
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

const XIcon = withIconClassName(X);

const TOAST_INIT_POSITION = -200;

type ToastRootProps = {
  ref: (ref: ToastRef | null) => void;
};

export const ToastRoot = ({ ref }: ToastRootProps) => {
  const toastTopAnimation = useSharedValue(TOAST_INIT_POSITION);
  const context = useSharedValue(0);
  const [showing, setShowing] = useState(false);
  const [toastType, setToastType] = useState<ToastVariants>(
    ToastVariants.DEFAULT
  );
  const [toastText, setToastText] = useState("");
  const [toastTitle, setToastTitle] = useState("");
  const [toastDuration, setToastDuration] = useState(0);

  const show = useCallback(
    ({ type, text, title, duration = 2000 }: ToastProps) => {
      setShowing(true);
      setToastType(type);
      setToastText(text);
      setToastDuration(duration);
      title && setToastTitle(title);

      toastTopAnimation.value = withSequence(
        withTiming(60),
        withDelay(
          duration,
          withTiming(TOAST_INIT_POSITION, undefined, (finish) => {
            if (finish) {
              runOnJS(setShowing)(false);
            }
          })
        )
      );
    },
    [toastTopAnimation]
  );

  const hide = useCallback(() => {
    toastTopAnimation.value = withTiming(
      TOAST_INIT_POSITION,
      undefined,
      (finish) => {
        if (finish) {
          runOnJS(setShowing)(false);
          runOnJS(setToastTitle)("");
        }
      }
    );
  }, [toastTopAnimation]);

  useImperativeHandle(
    ref,
    useCallback(
      () => ({
        show,
      }),
      [show]
    )
  );

  const animatedTopStyles = useAnimatedStyle(() => {
    return {
      top: toastTopAnimation.value,
    };
  });

  const pan = Gesture.Pan()
    .onBegin(() => {
      context.value = toastTopAnimation.value;
    })
    .onUpdate((event) => {
      if (event.translationY < 100) {
        toastTopAnimation.value = withSpring(
          context.value + event.translationY,
          {
            damping: 600,
            stiffness: 100,
          }
        );
      }
    })
    .onEnd((event) => {
      if (event.translationY < 0) {
        toastTopAnimation.value = withTiming(
          TOAST_INIT_POSITION,
          undefined,
          (finish) => {
            if (finish) {
              runOnJS(setShowing)(false);
              runOnJS(setToastTitle)("");
            }
          }
        );
      } else if (event.translationY > 0) {
        toastTopAnimation.value = withSequence(
          withTiming(60),
          withDelay(
            toastDuration,
            withTiming(TOAST_INIT_POSITION, undefined, (finish) => {
              if (finish) {
                runOnJS(setShowing)(false);
                runOnJS(setToastTitle)("");
              }
            })
          )
        );
      }
    });
  return (
    <>
      {showing && (
        <GestureDetector gesture={pan}>
          <Animated.View
            className="absolute left-0 right-0 top-0"
            style={animatedTopStyles}
          >
            <Background variant={toastType}>
              <ToastIcon variant={toastType} />
              <View className="flex-1">
                {toastTitle && (
                  <Text
                    variant="body2"
                    numberOfLines={1}
                    className="text-text-primary-inverse font-semibold"
                  >
                    {toastTitle}
                  </Text>
                )}
                <Text
                  variant={toastTitle ? "caption1" : "body2"}
                  className="text-text-primary-inverse"
                  numberOfLines={2}
                >
                  {toastText}
                </Text>
              </View>
              <Close onPress={hide} />
            </Background>
          </Animated.View>
        </GestureDetector>
      )}
    </>
  );
};

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
  getRef()?.show({ ...params, type: ToastVariants.ERROR });
};

Toast.show = (params: ToastParams) => {
  getRef()?.show({ ...params, type: ToastVariants.DEFAULT });
};

Toast.success = (params: ToastParams) => {
  getRef()?.show({ ...params, type: ToastVariants.SUCCESS });
};

Toast.warn = (params: ToastParams) => {
  getRef()?.show({ ...params, type: ToastVariants.WARNING });
};
