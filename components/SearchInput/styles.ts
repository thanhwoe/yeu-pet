import { cva } from "class-variance-authority";

export const searchStyles = cva(
  "flex-row rounded-2xl justify-center items-center border border-gray-400",
  {
    variants: {
      size: {
        sm: "px-2 py-1",
        md: "px-2 py-1",
        lg: "px-2 py-1",
      },
      focus: {
        true: "border-gray-500",
        false: null,
      },
      typing: {
        true: "border-gray-500",
        false: null,
      },
      disabled: {
        true: "opacity-[0.38]",
        false: null,
      },
      error: {
        true: "border-red-500 border",
        false: null,
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export const inputStyles = cva(
  "font-normal text-[18px] flex-1 selection:text-gray-500",
  {
    variants: {
      size: {
        sm: "h-[22px]",
        md: "h-[22px]",
        lg: "h-[27px]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);
