import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable, PressableProps, ViewStyle } from "react-native";

import { cn } from "@/utils";
import { Spinner } from "../Spinner";
import { Text } from "../Text";

const buttonVariants = cva("flex-row items-center justify-center gap-2", {
  variants: {
    variant: {
      primary: "active:opacity-50 bg-background-primary",
      secondary: "border-line-inverse border",
      tonal: "bg-background-secondary",
      plain: "active:opacity-70",
    },
    size: {
      none: "",
      sm: "py-1 px-2.5 rounded-full",
      md: "ios:rounded-lg py-2 ios:py-1.5 ios:px-3.5 px-5 rounded-full",
      lg: "py-2.5 px-5 ios:py-2 rounded-xl gap-2",
      CTA: "py-3 px-5 rounded-full gap-2",
      icon: "ios:rounded-lg h-10 w-10 rounded-full",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

const buttonTextVariants = cva("font-medium", {
  variants: {
    variant: {
      primary: "text-text-primary-inverse",
      secondary: "text-text-link",
      tonal: "text-text-primary-inverse",
      plain: "text-foreground",
    },
    size: {
      none: "",
      icon: "",
      sm: "text-[15px] leading-5",
      md: "text-[17px] leading-7",
      lg: "text-[17px] leading-7",
      CTA: "text-[17px] leading-7",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

// Add as class when possible: https://github.com/marklawlor/nativewind/issues/522
const BORDER_CURVE: ViewStyle = {
  borderCurve: "continuous",
};

type ButtonVariantProps = Omit<
  VariantProps<typeof buttonVariants>,
  "variant"
> & {
  variant?: Exclude<VariantProps<typeof buttonVariants>["variant"], null>;
};

type ButtonProps = Omit<PressableProps, "children"> &
  ButtonVariantProps &
  React.PropsWithChildren & {
    loading?: boolean;
  };

export const Button = ({
  className,
  variant = "primary",
  size,
  style = BORDER_CURVE,
  children,
  loading,
  ...props
}: ButtonProps) => {
  return (
    <Pressable
      className={cn(
        props.disabled && "opacity-50",
        buttonVariants({ variant, size, className })
      )}
      style={style}
      {...props}
    >
      {loading && <Spinner size={20} color="white" />}
      <Text className={buttonTextVariants({ variant, size })}>{children}</Text>
    </Pressable>
  );
};

Button.displayName = "Button";
