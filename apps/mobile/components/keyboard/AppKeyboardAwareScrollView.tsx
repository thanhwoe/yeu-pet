import { cssInterop } from "nativewind";
import {
  forwardRef,
  type ForwardRefExoticComponent,
  type PropsWithChildren,
  type RefAttributes,
} from "react";
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
  type KeyboardAwareScrollViewRef,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type AppKeyboardAwareScrollViewProps = PropsWithChildren<
  KeyboardAwareScrollViewProps & {
    className?: string;
    contentContainerClassName?: string;
  }
>;

type StyledKeyboardAwareScrollViewProps = AppKeyboardAwareScrollViewProps &
  RefAttributes<KeyboardAwareScrollViewRef>;

const StyledKeyboardAwareScrollView = cssInterop(KeyboardAwareScrollView, {
  className: {
    target: "style",
  },
  contentContainerClassName: {
    target: "contentContainerStyle",
  },
}) as ForwardRefExoticComponent<StyledKeyboardAwareScrollViewProps>;

export const AppKeyboardAwareScrollView = forwardRef<
  KeyboardAwareScrollViewRef,
  AppKeyboardAwareScrollViewProps
>(function AppKeyboardAwareScrollView(
  { bottomOffset, keyboardShouldPersistTaps = "handled", ...props },
  ref,
) {
  const insets = useSafeAreaInsets();

  return (
    <StyledKeyboardAwareScrollView
      ref={ref}
      bottomOffset={bottomOffset ?? Math.max(insets.bottom, 16)}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...props}
    />
  );
});
