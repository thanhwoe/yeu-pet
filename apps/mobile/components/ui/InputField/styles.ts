import { cva, VariantProps } from "class-variance-authority";

export const inputVariants = cva(
  "min-h-44 rounded-8 bg-background-foreground flex-row items-center gap-8 border px-16",
  {
    variants: {
      variant: {
        default: null,
      },
      hasError: {
        true: "!border-line-negative",
      },
      multiline: {
        true: "h-[100px] py-16",
      },
      disabled: {
        true: "opacity-80 border-line-secondary-inverse bg-background-tertiary",
      },
      focus: {
        true: "bg-background-foreground border-line-primary",
        false: null,
      },
      typing: {
        true: "bg-background-foreground",
        false: null,
      },
    },
    compoundVariants: [
      {
        disabled: false,
        variant: "default",
        typing: false,
        focus: false,
        className: "border-line-secondary-inverse",
      },
    ],
    defaultVariants: {
      variant: "default",
      disabled: false,
    },
  },
);

export const supportTextVariants = cva("mt-8", {
  variants: {
    variant: {
      default: "text-text-tertiary",
    },
    hasError: {
      true: "text-text-negative",
    },
  },
  defaultVariants: {
    variant: "default",
    hasError: false,
  },
});

export type InputVariants = VariantProps<typeof inputVariants>;
