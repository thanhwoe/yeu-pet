import { withIconClassName } from "@/hocs/withIconClassName";
import { ReminderStatus, ReminderType } from "@/interfaces";
import { cn } from "@/utils";
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
import { Body } from "../ui/Typography";

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
  feeding: "text-orange-40",
  vaccination: "text-green-50",
  grooming: "text-cyan-60",
  medication: "text-red-50",
};
const typeBackgroundMapping: Record<ReminderType, string> = {
  feeding: "bg-[#FF8000]/20",
  vaccination: "bg-[#3E9A63]/20",
  grooming: "bg-[#00C4CC]/20",
  medication: "bg-[#C43A41]/20",
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
  cancelled: CancelIcon,
  pending: PendingIcon,
};

const statusColorMapping: Record<ReminderStatus, string> = {
  sent: "text-green-70",
  cancelled: "text-grey-70",
  pending: "text-yellow-70",
};

const statusBackgroundMapping: Record<ReminderStatus, string> = {
  sent: "bg-background-positive-highlight",
  cancelled: "bg-background-cancel",
  pending: "bg-background-warning",
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
      <Body variant="body2" className="capitalize text-black" weight="semiBold">
        {status}
      </Body>
    </View>
  );
};
