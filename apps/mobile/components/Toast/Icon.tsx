import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon as Warning,
  XCircleIcon,
} from "phosphor-react-native";
import { View } from "react-native";
import { ToastVariants } from "./utils";

const DefaultIcon = withIconClassName(InfoIcon);
const ErrorIcon = withIconClassName(XCircleIcon);
const SuccessIcon = withIconClassName(CheckCircleIcon);
const WarningIcon = withIconClassName(Warning);

const iconMapping = {
  [ToastVariants.DEFAULT]: DefaultIcon,
  [ToastVariants.ERROR]: ErrorIcon,
  [ToastVariants.SUCCESS]: SuccessIcon,
  [ToastVariants.WARNING]: WarningIcon,
};

const styles = cva("rounded-full p-2", {
  variants: {
    variant: {
      [ToastVariants.DEFAULT]: "bg-[#3287ea]",
      [ToastVariants.ERROR]: "bg-[#941d03]",
      [ToastVariants.SUCCESS]: "bg-[#02956a]",
      [ToastVariants.WARNING]: "bg-[#945701]",
    },
  },
  defaultVariants: {
    variant: ToastVariants.DEFAULT,
  },
});

type Variants = VariantProps<typeof styles>;

export const ToastIcon = ({ variant }: Variants) => {
  const Icon = iconMapping[variant ?? ToastVariants.DEFAULT];
  return (
    <View className={cn(styles({ variant }))}>
      <Icon className="text-icon-foreground" />
    </View>
  );
};
