import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { PropsWithChildren } from "react";
import { View } from "react-native";
import { ToastVariants } from "./utils";

const styles = cva(
  "mx-16 flex-row items-start gap-10 rounded-20 border px-12 py-10 shadow-card",
  {
    variants: {
      tone: {
        light: "",
        dark: "bg-background-surface-raised",
      },
      variant: {
        [ToastVariants.DEFAULT]:
          "border-status-info-border bg-status-info-surface",
        [ToastVariants.ERROR]:
          "border-status-danger-border bg-status-danger-surface",
        [ToastVariants.NOTIFICATION]:
          "border-line-subtle bg-background-surface-raised",
        [ToastVariants.SUCCESS]:
          "border-status-success-border bg-status-success-surface",
        [ToastVariants.WARNING]:
          "border-status-warning-border bg-status-warning-surface",
      },
    },
    defaultVariants: {
      tone: "light",
      variant: ToastVariants.DEFAULT,
    },
    compoundVariants: [
      {
        tone: "dark",
        variant: ToastVariants.DEFAULT,
        class: "border-status-info-border bg-background-surface-raised",
      },
      {
        tone: "dark",
        variant: ToastVariants.ERROR,
        class: "border-status-danger-border bg-background-surface-raised",
      },
      {
        tone: "dark",
        variant: ToastVariants.NOTIFICATION,
        class: "border-line-subtle bg-background-surface-raised",
      },
      {
        tone: "dark",
        variant: ToastVariants.SUCCESS,
        class: "border-status-success-border bg-background-surface-raised",
      },
      {
        tone: "dark",
        variant: ToastVariants.WARNING,
        class: "border-status-warning-border bg-background-surface-raised",
      },
    ],
  },
);

type variants = VariantProps<typeof styles>;

export const Background = ({
  variant,
  tone,
  children,
}: PropsWithChildren<variants>) => {
  return <View className={cn(styles({ tone, variant }))}>{children}</View>;
};
