import { withIconClassName } from "@/hocs/withIconClassName";
import {
  ReminderStatus,
  ReminderType,
  VisibleReminderStatus,
} from "@/interfaces";
import { cn } from "@/utils";
import { REMINDER_STATUS_LABELS } from "@/utils/reminder";
import {
  BoneIcon as Bone,
  CheckCircleIcon,
  ClockIcon,
  IconProps,
  PillIcon as Pill,
  ScissorsIcon as Scissors,
  SyringeIcon as Syringe,
  XCircleIcon,
} from "phosphor-react-native";
import { ComponentType } from "react";
import { View } from "react-native";
import { Body } from "@/components/ui/Typography";

const BoneIcon = withIconClassName(Bone);
const SyringeIcon = withIconClassName(Syringe);
const ScissorsIcon = withIconClassName(Scissors);
const PillIcon = withIconClassName(Pill);

const SentIcon = withIconClassName(CheckCircleIcon);
const CancelIcon = withIconClassName(XCircleIcon);
const PendingIcon = withIconClassName(ClockIcon);

const typeIconMapping: Record<
  ReminderType,
  ComponentType<
    IconProps & {
      readonly className?: string | undefined;
    }
  >
> = {
  feeding: BoneIcon,
  vaccination: SyringeIcon,
  grooming: ScissorsIcon,
  medication: PillIcon,
};

const typeColorMapping: Record<ReminderType, string> = {
  feeding: "text-feature-pet-accent",
  vaccination: "text-feature-medical-accent",
  grooming: "text-feature-sitter-accent",
  medication: "text-status-danger-icon",
};
const typeBackgroundMapping: Record<ReminderType, string> = {
  feeding: "bg-feature-pet-surface",
  vaccination: "bg-feature-medical-surface",
  grooming: "bg-feature-sitter-surface",
  medication: "bg-status-danger-surface",
};

interface ReminderTypeProps extends IconProps {
  type: ReminderType;
  circle?: boolean;
  containerClassName?: string;
}

export const ReminderTypeIcon = ({
  type,
  circle,
  containerClassName,
  ...props
}: ReminderTypeProps) => {
  const Icon = typeIconMapping[type];
  const color = typeColorMapping[type];
  const bg = typeBackgroundMapping[type];
  if (circle) {
    return (
      <View
        className={cn(
          "size-48 items-center justify-center rounded-12",
          bg,
          containerClassName,
        )}
      >
        <Icon size={20} weight="fill" className={color} {...props} />
      </View>
    );
  }
  return <Icon size={20} weight="fill" className={color} {...props} />;
};

export const ReminderIcons = ReminderTypeIcon;

const statusIconMapping: Record<
  VisibleReminderStatus,
  ComponentType<
    IconProps & {
      readonly className?: string | undefined;
    }
  >
> = {
  sent: SentIcon,
  cancelled: CancelIcon,
  pending: PendingIcon,
};

const statusColorMapping: Record<VisibleReminderStatus, string> = {
  sent: "text-status-success-text",
  cancelled: "text-status-danger-text",
  pending: "text-status-warning-text",
};

const statusBackgroundMapping: Record<VisibleReminderStatus, string> = {
  sent: "bg-status-success-surface",
  cancelled: "bg-status-danger-surface",
  pending: "bg-status-warning-surface",
};

const isVisibleStatus = (
  status: ReminderStatus,
): status is VisibleReminderStatus =>
  status !== "completed" && status !== "skipped";
interface ReminderStatusProps extends IconProps {
  status: ReminderStatus;
}

export const ReminderStatusChip = ({
  status,
  ...props
}: ReminderStatusProps) => {
  if (!isVisibleStatus(status)) return null;

  const Icon = statusIconMapping[status];
  const color = statusColorMapping[status];
  const bg = statusBackgroundMapping[status];
  return (
    <View
      className={cn(
        "flex-row rounded-12 pl-4 pr-8 py-2 items-center gap-4",
        bg,
      )}
    >
      <Icon size={20} weight="fill" className={color} {...props} />
      <Body
        variant="body2"
        className={cn("capitalize", color)}
        weight="semiBold"
      >
        {REMINDER_STATUS_LABELS[status]}
      </Body>
    </View>
  );
};
