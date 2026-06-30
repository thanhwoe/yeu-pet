import { cssInterop } from "nativewind";
import {
  forwardRef,
  type ForwardRefExoticComponent,
  type PropsWithChildren,
  type RefAttributes,
} from "react";
import { Platform, type View } from "react-native";
import {
  KeyboardAvoidingView,
  type KeyboardAvoidingViewProps,
} from "react-native-keyboard-controller";

export type AppKeyboardAvoidingViewProps = PropsWithChildren<
  KeyboardAvoidingViewProps & {
    className?: string;
  }
>;

type StyledKeyboardAvoidingViewProps = AppKeyboardAvoidingViewProps &
  RefAttributes<View>;

const StyledKeyboardAvoidingView = cssInterop(KeyboardAvoidingView, {
  className: {
    target: "style",
  },
}) as ForwardRefExoticComponent<StyledKeyboardAvoidingViewProps>;

export const AppKeyboardAvoidingView = forwardRef<
  View,
  AppKeyboardAvoidingViewProps
>(function AppKeyboardAvoidingView(
  {
    automaticOffset = true,
    behavior = Platform.OS === "ios" ? "padding" : "height",
    ...props
  },
  ref,
) {
  return (
    <StyledKeyboardAvoidingView
      ref={ref}
      automaticOffset={automaticOffset}
      behavior={behavior}
      {...props}
    />
  );
});
