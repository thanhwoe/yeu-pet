import { cva, type VariantProps } from "class-variance-authority";

export const wrapperStyles = cva("gap-2 my-1 items-center rounded-xl", {
  variants: {
    checked: {
      true: "bg-background-default-highlight border-line-card-highlight",
      false: null,
    },
    pressed: {
      true: "bg-background-default-pressed",
      false: null,
    },
    reverse: {
      true: "flex-row-reverse",
      false: "flex-row",
    },
  },
  defaultVariants: {
    reverse: false,
  },
});

export const checkboxStyles = cva(
  "border-line-secondary items-center justify-center",
  {
    variants: {
      size: {
        small: "w-4 h-4 rounded-xl border",
        medium: "w-5 h-5 rounded-xl border-[1.5px]",
      },
      checked: {
        true: "border-0 bg-background-primary",
        false: null,
      },
      disabled: {
        true: "opacity-50",
        false: null,
      },
      reverse: {
        true: null,
        false: null,
      },
    },
    defaultVariants: {
      size: "medium",
    },
  }
);

export const labelStyles = cva("flex-1", {
  variants: {
    disabled: {
      true: "",
      false: null,
    },
    checked: {
      true: "",
      false: null,
    },
  },
  compoundVariants: [
    {
      checked: true,
      disabled: true,
      className: "",
    },
  ],
});

export type CheckboxVariant = VariantProps<typeof checkboxStyles>;
