import { cva, type VariantProps } from "class-variance-authority";

export const avatarStyles = cva("self-start overflow-hidden", {
  variants: {
    variant: {
      simple: "rounded-full",
      line: "rounded-full border-[1.5px] p-4 border-line-primary",
      square: "bg-white rounded-xl",
    },
    size: {
      small: "",
      medium: "",
      large: "",
      huge: "",
    },
  },

  defaultVariants: {
    variant: "simple",
    size: "medium",
  },
});

export const imageStyles = cva("overflow-hidden", {
  variants: {
    variant: {
      simple: "rounded-full",
      line: "rounded-full",
      square: "rounded-xl",
    },
    size: {
      small: "size-32",
      medium: "size-40",
      large: "size-56",
      huge: "size-80",
    },
  },
  defaultVariants: {
    variant: "simple",

    size: "medium",
  },
});

export type AvatarVariants = VariantProps<typeof avatarStyles>;
