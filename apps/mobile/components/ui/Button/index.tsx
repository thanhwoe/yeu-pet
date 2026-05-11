import * as React from "react";
import { Pressable, PressableProps, View, ViewStyle } from "react-native";

import { cn } from "@/utils";
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
  loading,
  wrapperClassName,
  ...props
}: ButtonProps) => {
  return (
    <Pressable
      style={style}
      disabled={disabled || loading}
      className={wrapperClassName}
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
