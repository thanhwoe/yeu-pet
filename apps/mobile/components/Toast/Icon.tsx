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

const containerStyles = cva(
  "mt-1 h-30 w-30 items-center justify-center rounded-full bg-background-surface-muted",
);

const iconStyles = cva("", {
  variants: {
    variant: {
      [ToastVariants.DEFAULT]: "text-status-info-icon",
      [ToastVariants.ERROR]: "text-status-danger-icon",
      [ToastVariants.SUCCESS]: "text-status-success-icon",
      [ToastVariants.WARNING]: "text-status-warning-icon",
    },
  },
  defaultVariants: {
    variant: ToastVariants.DEFAULT,
  },
});

type Variants = VariantProps<typeof iconStyles>;

export const ToastIcon = ({ variant }: Variants) => {
  const Icon = iconMapping[variant ?? ToastVariants.DEFAULT];
  return (
    <View className={cn(containerStyles())}>
      <Icon size={18} weight="fill" className={cn(iconStyles({ variant }))} />
    </View>
  );
};
