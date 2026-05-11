import { cn } from "@/utils";
import { forwardRef, type FC } from "react";
import { Text, type TextProps } from "react-native";
import {
  bodyStyles,
  headingStyles,
  type BodyVariants,
  type HeadingVariants,
} from "./styles";

export type BodyProps = TextProps & BodyVariants;

const bodyMaxFontSizeMultiplierMapping: Record<
  NonNullable<BodyVariants["variant"]>,
  number
> = {
  body1: 24 / 18,
  body2: 24 / 16,
  body3: 24 / 15,
  body4: 24 / 13,
  body5: 24 / 12,
};

const headingMaxFontSizeMultiplierMapping: Record<
  NonNullable<HeadingVariants["variant"]>,
  number
> = {
  h1: 1, // 46px
  h2: 1, // 38px
  h3: 1, // 34px
  h4: 1, // 28px
  h5: 1, // 24px
  h6: 24 / 20,
};

export const Body = forwardRef<Text, BodyProps>(
  ({ variant, weight, caps, className, center, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn(bodyStyles({ variant, weight, caps, className, center }))}
      maxFontSizeMultiplier={
        bodyMaxFontSizeMultiplierMapping[variant || "body1"]
      }
      {...props}
    />
  ),
);

Body.displayName = "Body";

type HeadingProps = TextProps & HeadingVariants;

export const Heading: FC<HeadingProps> = ({
  variant,
  weight,
  caps,
  className,
  center,
  ...props
}) => (
  <Text
    className={cn(headingStyles({ variant, weight, caps, className, center }))}
    maxFontSizeMultiplier={headingMaxFontSizeMultiplierMapping[variant || "h1"]}
    {...props}
  />
);
