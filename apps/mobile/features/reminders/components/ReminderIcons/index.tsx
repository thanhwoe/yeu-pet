import { withIconClassName } from "@/hocs/withIconClassName";
import { ReminderStatus, ReminderType } from "@/interfaces";
import { cn } from "@/utils";
import {
  BoneIcon as Bone,
  CheckCircleIcon,
  ClockIcon,
  ProhibitIcon,
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
const SkippedIcon = withIconClassName(ProhibitIcon);

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
}

export const ReminderTypeIcon = ({
  type,
  circle,
  ...props
}: ReminderTypeProps) => {
  const Icon = typeIconMapping[type];
  const color = typeColorMapping[type];
  const bg = typeBackgroundMapping[type];
  if (circle) {
    return (
      <View className={cn("p-10 rounded-12", bg)}>
        <Icon size={20} weight="fill" className={color} {...props} />
      </View>
    );
  }
  return <Icon size={20} weight="fill" className={color} {...props} />;
};

export const ReminderIcons = ReminderTypeIcon;

const statusIconMapping: Record<
  ReminderStatus,
  ComponentType<
    IconProps & {
      readonly className?: string | undefined;
    }
  >
> = {
  sent: SentIcon,
  completed: SentIcon,
  skipped: SkippedIcon,
  cancelled: CancelIcon,
  pending: PendingIcon,
};

const statusColorMapping: Record<ReminderStatus, string> = {
  sent: "text-status-success-text",
  completed: "text-status-success-text",
  skipped: "text-text-muted",
  cancelled: "text-text-muted",
  pending: "text-status-warning-text",
};

const statusBackgroundMapping: Record<ReminderStatus, string> = {
  sent: "bg-status-success-surface",
  completed: "bg-status-success-surface",
  skipped: "bg-background-cancel",
  cancelled: "bg-background-cancel",
  pending: "bg-status-warning-surface",
};
interface ReminderStatusProps extends IconProps {
  status: ReminderStatus;
}

export const ReminderStatusChip = ({
  status,
  ...props
}: ReminderStatusProps) => {
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
      <Body variant="body2" className={cn("capitalize", color)} weight="semiBold">
        {status}
      </Body>
    </View>
  );
};
