import * as React from "react";
import { Pressable, PressableProps, View, ViewStyle } from "react-native";

import { cn, triggerHaptic, type HapticFeedback } from "@/utils";
import { Spinner } from "../Spinner";
import { Text } from "../Text";
import {
  buttonStyles,
  ButtonVariants,
  spinnerStyles,
  textStyles,
} from "./styles";

// Add as class when possible: https://github.com/marklawlor/nativewind/issues/522
const BORDER_CURVE: ViewStyle = {
  borderCurve: "continuous",
};

type ButtonProps = Omit<PressableProps, "children"> &
  ButtonVariants &
  React.PropsWithChildren & {
    hapticFeedback?: HapticFeedback | false;
    loading?: boolean;
    wrapperClassName?: string;
  };

export const Button = ({
  className,
  variant = "primary",
  size,
  style = BORDER_CURVE,
  children,
  disabled,
  hapticFeedback,
  loading,
  onPress,
  wrapperClassName,
  ...props
}: ButtonProps) => {
  const resolvedHapticFeedback =
    hapticFeedback ?? (variant === "destructive" ? "warning" : undefined);
  const handlePress: PressableProps["onPress"] = (event) => {
    if (resolvedHapticFeedback) {
      triggerHaptic(resolvedHapticFeedback);
    }

    onPress?.(event);
  };

  return (
    <Pressable
      style={style}
      disabled={disabled || loading}
      className={wrapperClassName}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      onPress={handlePress}
      {...props}
    >
      {({ pressed }) => (
        <View
          className={cn(
            buttonStyles({
              variant,
              size,
              className,
              loading,
              disabled,
              pressed,
            }),
          )}
        >
          {loading && (
            <Spinner size={20} className={spinnerStyles({ variant })} />
          )}
          <Text className={textStyles({ variant, size })}>{children}</Text>
        </View>
      )}
    </Pressable>
  );
};

Button.displayName = "Button";
