import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import { BlurView } from "expo-blur";
import { PropsWithChildren } from "react";
import { View } from "react-native";
import { ToastVariants } from "./utils";

const styles = cva("rounded-full overflow-hidden mx-5", {
  variants: {
    variant: {
      [ToastVariants.DEFAULT]: "bg-[#3287ea]/50",
      [ToastVariants.ERROR]: "bg-[#941d03]/50",
      [ToastVariants.SUCCESS]: "bg-[#02956a]/50",
      [ToastVariants.WARNING]: "bg-[#945701]/50",
    },
  },
  defaultVariants: {
    variant: ToastVariants.DEFAULT,
  },
});

type variants = VariantProps<typeof styles>;

export const Background = ({
  variant,
  children,
}: PropsWithChildren<variants>) => {
  return (
    <View className={cn(styles({ variant }))}>
      <BlurView className="flex-row p-3 items-center gap-3">
        {children}
      </BlurView>
    </View>
  );
};
