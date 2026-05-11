import { cn } from "@/utils";
import { VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { Text as RNText } from "react-native";

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      largeTitle: "text-4xl",
      title1: "text-2xl",
      title2: "text-[22px] leading-7",
      title3: "text-xl",
      heading: "text-[17px] leading-6 font-semibold",
      body: "text-[17px] leading-6",
      body2: "text-[14px] leading-6",
      callout: "text-base",
      subhead: "text-[15px] leading-6",
      footnote: "text-[13px] leading-5",
      caption1: "text-xs",
      caption2: "text-[10px] leading-3",
    },
    color: {
      primary: "text-text-primary",
      secondary: "text-text-secondary",
      tertiary: "text-muted-foreground/90",
      quarternary: "text-muted-foreground/50",
    },
    disabled: {
      true: "opacity-50",
      false: "",
    },
  },
  defaultVariants: {
    variant: "body",
    color: "primary",
  },
});

function Text({
  className,
  variant,
  color,
  disabled,
  ...props
}: React.ComponentPropsWithoutRef<typeof RNText> &
  VariantProps<typeof textVariants>) {
  return (
    <RNText
      className={cn(textVariants({ variant, color, disabled }), className)}
      {...props}
    />
  );
}

export { Text, textVariants };
