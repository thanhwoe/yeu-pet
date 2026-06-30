import {
  forwardRef,
  type ElementRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import type { ScrollViewProps } from "react-native";
import {
  KeyboardChatScrollView,
  type KeyboardChatScrollViewProps,
} from "react-native-keyboard-controller";

export type AppKeyboardChatScrollViewProps = ScrollViewProps &
  KeyboardChatScrollViewProps;

type StyledKeyboardChatScrollViewProps = AppKeyboardChatScrollViewProps &
  RefAttributes<ElementRef<typeof KeyboardChatScrollView>>;

const StyledKeyboardChatScrollView =
  KeyboardChatScrollView as ForwardRefExoticComponent<StyledKeyboardChatScrollViewProps>;

export const AppKeyboardChatScrollView = forwardRef<
  ElementRef<typeof KeyboardChatScrollView>,
  AppKeyboardChatScrollViewProps
>(function AppKeyboardChatScrollView(
  {
    automaticallyAdjustContentInsets = false,
    contentInsetAdjustmentBehavior = "never",
    keyboardLiftBehavior = "whenAtEnd",
    ...props
  },
  ref,
) {
  return (
    <StyledKeyboardChatScrollView
      ref={ref}
      automaticallyAdjustContentInsets={automaticallyAdjustContentInsets}
      contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
      keyboardLiftBehavior={keyboardLiftBehavior}
      {...props}
    />
  );
});
