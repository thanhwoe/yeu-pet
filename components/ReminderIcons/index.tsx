import { withIconClassName } from "@/hocs/withIconClassName";
import {
  BoneIcon as Bone,
  IconProps,
  PillIcon as Pill,
  ScissorsIcon as Scissors,
  SyringeIcon as Syringe,
} from "phosphor-react-native";

const BoneIcon = withIconClassName(Bone);
const SyringeIcon = withIconClassName(Syringe);
const ScissorsIcon = withIconClassName(Scissors);
const PillIcon = withIconClassName(Pill);

const iconMapping = {
  feed: BoneIcon,
  vaccination: SyringeIcon,
  grooming: ScissorsIcon,
  medication: PillIcon,
};

const colorMapping = {
  feed: "text-orange-500",
  vaccination: "text-green-600",
  grooming: "text-cyan-600",
  medication: "text-red-500",
};

interface IProps extends IconProps {
  type: string;
}

export const ReminderIcons = ({ type, ...props }: IProps) => {
  const Icon = iconMapping[type as keyof typeof iconMapping];
  const color = colorMapping[type as keyof typeof colorMapping];
  return <Icon size={20} weight="fill" className={color} {...props} />;
};
