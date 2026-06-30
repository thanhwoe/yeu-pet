import { cssInterop } from "nativewind";
import {
  forwardRef,
  useMemo,
  type ForwardRefExoticComponent,
  type PropsWithChildren,
  type RefAttributes,
} from "react";
import type { View } from "react-native";
import {
  KeyboardStickyView,
  type KeyboardStickyViewProps,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type AppKeyboardStickyViewProps = PropsWithChildren<
  Omit<KeyboardStickyViewProps, "offset"> & {
    bottomOffset?: number;
    className?: string;
    includeBottomInset?: boolean;
    offset?: KeyboardStickyViewProps["offset"];
  }
>;

type StyledKeyboardStickyViewProps = AppKeyboardStickyViewProps &
  RefAttributes<View>;

const StyledKeyboardStickyView = cssInterop(KeyboardStickyView, {
  className: {
    target: "style",
  },
}) as ForwardRefExoticComponent<StyledKeyboardStickyViewProps>;

export const AppKeyboardStickyView = forwardRef<
  View,
  AppKeyboardStickyViewProps
>(function AppKeyboardStickyView(
  { bottomOffset, includeBottomInset = true, offset, ...props },
  ref,
) {
  const insets = useSafeAreaInsets();
  const safeBottomOffset = includeBottomInset
    ? (bottomOffset ?? insets.bottom)
    : 0;
  const resolvedOffset = useMemo(() => {
    if (!safeBottomOffset) {
      return offset;
    }

    return {
      closed: offset?.closed ?? 0,
      opened: offset?.opened ?? -safeBottomOffset,
    };
  }, [offset, safeBottomOffset]);

  return (
    <StyledKeyboardStickyView ref={ref} offset={resolvedOffset} {...props} />
  );
});
