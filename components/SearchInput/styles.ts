import { cva } from "class-variance-authority";

export const searchStyles = cva(
  "h-12 flex-row rounded-2xl justify-center items-center bg-white",
  {
    variants: {
      size: {
        sm: "px-2 py-1",
        md: "px-2 py-1",
        lg: "px-2 py-1",
      },
      focus: {
        true: "border-line-primary",
        false: null,
      },
      typing: {
        true: "border-line-typing",
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
  "font-normal text-[18px] flex-1 placeholder:text-text-secondary selection:text-text-link",
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
