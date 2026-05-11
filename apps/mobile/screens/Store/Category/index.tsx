import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import {
  BeltIcon,
  BoneIcon,
  CoatHangerIcon,
  FirstAidKitIcon,
  HairDryerIcon,
  PinwheelIcon,
} from "phosphor-react-native";
import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";

interface ICategoryProps extends TouchableOpacityProps {
  data: (typeof CATEGORIES)[number];
  selected?: boolean;
}
export const Category = ({ data, selected, ...props }: ICategoryProps) => {
  return (
    <TouchableOpacity
      className={cn(
        "bg-white border border-transparent self-start px-1 w-[100px] py-2 items-center rounded-xl",
        {
          "border-line-selected": selected,
        }
      )}
      {...props}
    >
      <View className={cn("bg-red-10 rounded-full p-2", data.color)}>
        {data.icon}
      </View>
      <Text variant="footnote">{data.name}</Text>
    </TouchableOpacity>
  );
};

const FoodIcon = withIconClassName(BoneIcon);
const ToyIcon = withIconClassName(PinwheelIcon);
const AccessoryIcon = withIconClassName(BeltIcon);
const ClothesIcon = withIconClassName(CoatHangerIcon);
const GroomingIcon = withIconClassName(HairDryerIcon);
const MedicineIcon = withIconClassName(FirstAidKitIcon);

const IconSize = 20;

export const CATEGORIES = [
  {
    icon: <FoodIcon size={IconSize} weight="fill" className="text-orange-40" />,
    name: "Food",
    value: "food",
    color: "bg-orange-10",
  },
  {
    icon: <ToyIcon size={IconSize} weight="fill" className="text-blue-40" />,
    name: "Toys",
    value: "toy",
    color: "bg-blue-10",
  },
  {
    icon: (
      <AccessoryIcon size={IconSize} weight="fill" className="text-yellow-60" />
    ),
    name: "Accessories",
    value: "accessory",
    color: "bg-yellow-10",
  },
  {
    icon: (
      <ClothesIcon size={IconSize} weight="fill" className="text-pink-40" />
    ),
    name: "Clothes",
    value: "clothes",
    color: "bg-pink-10",
  },
  {
    icon: (
      <GroomingIcon size={IconSize} weight="fill" className="text-green-40" />
    ),
    name: "Grooming",
    value: "grooming",
    color: "bg-green-10",
  },
  {
    icon: (
      <MedicineIcon size={IconSize} weight="fill" className="text-purple-40" />
    ),
    name: "Medicine",
    value: "medicine",
    color: "bg-purple-10",
  },
];
