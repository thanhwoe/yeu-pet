import { cva, type VariantProps } from "class-variance-authority";

export const buttonStyles = cva(
  "flex-row gap-8 justify-center rounded-16 items-center",
  {
    variants: {
      variant: {
        primary: "bg-background-primary",
        secondary: "bg-background-secondary",
        outline: "border border-line-secondary",
        ghost: "bg-transparent",
        destructive: "bg-background-negative",
      },
      pressed: {
        true: null,
        false: null,
      },
      disabled: {
        true: "opacity-50",
        false: null,
      },
      loading: {
        true: "opacity-50",
        false: null,
      },
      size: {
        sm: "h-42 px-16",
        md: "h-46 px-24",
        lg: "h-50 px-24",
      },
    },
    compoundVariants: [
      // pressed
      {
        variant: "primary",
        pressed: true,
        class: "bg-background-primary-pressed",
      },
      {
        variant: "secondary",
        pressed: true,
        class: "bg-background-secondary-pressed",
      },
      {
        variant: "outline",
        pressed: true,
        class: "border-[1.5px] bg-background-secondary",
      },
      {
        variant: "ghost",
        pressed: true,
        class: "bg-background-secondary",
      },
      {
        variant: "destructive",
        pressed: true,
        class: "bg-background-negative-pressed",
      },
      // loading
      {
        variant: "primary",
        loading: true,
        class: "bg-background-primary-pressed/80",
      },
      {
        variant: "secondary",
        loading: true,
        class: "bg-background-secondary-pressed",
      },
      {
        variant: "outline",
        loading: true,
        class: "border-line-secondary",
      },
    ],
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  },
);

export const textStyles = cva("text-center font-medium", {
  variants: {
    variant: {
      primary: "text-text-primary-inverse",
      secondary: "text-text-secondary",
      outline: "text-text-secondary",
      ghost: "text-text-secondary",
      destructive: "text-text-primary-inverse",
    },
    size: {
      sm: "text-body3",
      md: "text-body1",
      lg: "text-heading6",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "lg",
  },
});

export const spinnerStyles = cva("", {
  variants: {
    variant: {
      primary: "text-text-primary-inverse",
      secondary: "text-text-secondary",
      outline: "text-text-secondary",
      ghost: "text-text-secondary",
      destructive: "text-text-primary-inverse",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export type ButtonVariants = VariantProps<typeof buttonStyles>;
