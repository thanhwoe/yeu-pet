import { withIconClassName } from "@/hocs/withIconClassName";
import type { NotificationCategory } from "@/interfaces";
import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import {
  CheckCircleIcon,
  BellRingingIcon,
  ChatCircleDotsIcon,
  InfoIcon,
  PawPrintIcon,
  SparkleIcon,
  WarningIcon as Warning,
  XCircleIcon,
} from "phosphor-react-native";
import { View } from "react-native";
import { ToastVariants } from "./utils";

const DefaultIcon = withIconClassName(InfoIcon);
const ErrorIcon = withIconClassName(XCircleIcon);
const SuccessIcon = withIconClassName(CheckCircleIcon);
const WarningIcon = withIconClassName(Warning);
const NotificationIcon = {
  reminder: withIconClassName(BellRingingIcon),
  booking: withIconClassName(ChatCircleDotsIcon),
  social: withIconClassName(PawPrintIcon),
  ai: withIconClassName(SparkleIcon),
  system: withIconClassName(BellRingingIcon),
} satisfies Record<NotificationCategory, ReturnType<typeof withIconClassName>>;

const iconMapping = {
  [ToastVariants.DEFAULT]: DefaultIcon,
  [ToastVariants.ERROR]: ErrorIcon,
  [ToastVariants.NOTIFICATION]: DefaultIcon,
  [ToastVariants.SUCCESS]: SuccessIcon,
  [ToastVariants.WARNING]: WarningIcon,
};

const containerStyles = cva(
  "mt-1 h-36 w-36 items-center justify-center rounded-full bg-background-surface-muted",
  {
    variants: {
      notificationType: {
        reminder: "bg-feature-reminder-surface",
        booking: "bg-feature-sitter-surface",
        social: "bg-feature-photos-surface",
        ai: "bg-feature-ai-surface",
        system: "bg-feature-pet-surface",
      },
    },
  },
);

const iconStyles = cva("", {
  variants: {
    variant: {
      [ToastVariants.DEFAULT]: "text-status-info-icon",
      [ToastVariants.ERROR]: "text-status-danger-icon",
      [ToastVariants.NOTIFICATION]: "text-icon-primary-highlight",
      [ToastVariants.SUCCESS]: "text-status-success-icon",
      [ToastVariants.WARNING]: "text-status-warning-icon",
    },
  },
  defaultVariants: {
    variant: ToastVariants.DEFAULT,
  },
});

type Variants = VariantProps<typeof iconStyles>;

const notificationIconStyles: Record<NotificationCategory, string> = {
  reminder: "text-feature-reminder-accent",
  booking: "text-feature-sitter-accent",
  social: "text-feature-photos-accent",
  ai: "text-feature-ai-accent",
  system: "text-feature-pet-accent",
};

export const ToastIcon = ({
  variant,
  notificationType = "system",
}: Variants & { notificationType?: NotificationCategory }) => {
  const resolvedVariant = variant ?? ToastVariants.DEFAULT;
  const Icon =
    resolvedVariant === ToastVariants.NOTIFICATION
      ? NotificationIcon[notificationType]
      : iconMapping[resolvedVariant];
  return (
    <View
      className={cn(
        containerStyles({
          notificationType:
            resolvedVariant === ToastVariants.NOTIFICATION
              ? notificationType
              : undefined,
        }),
      )}
    >
      <Icon
        size={20}
        weight="fill"
        className={cn(
          resolvedVariant === ToastVariants.NOTIFICATION
            ? notificationIconStyles[notificationType]
            : iconStyles({ variant: resolvedVariant }),
        )}
      />
    </View>
  );
};
