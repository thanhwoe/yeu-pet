import { cva, type VariantProps } from "class-variance-authority";

export const bodyStyles = cva("font-regular text-text-primary", {
  variants: {
    variant: {
      body1: "text-body1 md:text-body1-md",
      body2: "text-body2 md:text-body2-md",
      body3: "text-body3 md:text-body3-md",
      body4: "text-body4 md:text-body4-md",
      body5: "text-body5 md:text-body5-md",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semiBold: "font-semiBold",
      bold: "font-bold",
    },
    center: {
      true: "text-center",
      false: null,
    },
    caps: {
      true: "uppercase",
      false: null,
    },
  },
  defaultVariants: {
    variant: "body1",
    caps: false,
    center: false,
    weight: "normal",
  },
});

export const headingStyles = cva("font-regular text-text-primary", {
  variants: {
    variant: {
      h1: "text-heading1 md:text-heading1-md",
      h2: "text-heading2 md:text-heading2-md",
      h3: "text-heading3 md:text-heading3-md",
      h4: "text-heading4 md:text-heading4-md",
      h5: "text-heading5 md:text-heading5-md",
      h6: "text-heading6 md:text-heading6-md",
    },
    weight: {
      light: "font-light",
      normal: "font-normal",
      medium: "font-medium",
      semiBold: "font-semiBold",
      bold: "font-bold",
    },
    center: {
      true: "text-center",
      false: null,
    },
    caps: {
      true: "uppercase",
      false: null,
    },
  },
  defaultVariants: {
    variant: "h1",
    caps: false,
    center: false,
    weight: "normal",
  },
});

export type BodyVariants = VariantProps<typeof bodyStyles>;
export type HeadingVariants = VariantProps<typeof headingStyles>;
