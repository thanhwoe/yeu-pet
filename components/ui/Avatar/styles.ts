import { cva, type VariantProps } from "class-variance-authority";

export const avatarStyles = cva("self-start overflow-hidden", {
  variants: {
    variant: {
      simple: "rounded-full",
      line: "rounded-full bg-white border-2 border-gray-200 p-1",
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

export const imageStyles = cva("", {
  variants: {
    size: {
      small: "size-10",
      medium: "size-12",
      large: "size-14",
      huge: "size-20",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

export type AvatarVariants = VariantProps<typeof avatarStyles>;
