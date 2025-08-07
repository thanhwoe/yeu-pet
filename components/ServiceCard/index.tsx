import { cn } from "@/utils";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { Icon as IconType, PawPrintIcon } from "phosphor-react-native";
import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { Text } from "../ui/Text";

import { withIconClassName } from "@/hocs/withIconClassName";

const PawPrint = withIconClassName(PawPrintIcon);
const CARD_SIZE = (SCREEN_WIDTH - 20 * 2 - 16) / 2;

interface IProps extends TouchableOpacityProps {
  title: string;
  subTitle?: string;
  icon: IconType;
  iconColor?: string;
  decoratorColor?: string;
}

export const ServiceCard = ({
  icon,
  title,
  subTitle,
  iconColor,
  decoratorColor,
  ...props
}: IProps) => {
  const Icon = withIconClassName(icon);

  return (
    <TouchableOpacity
      className={cn(
        "border border-line-tertiary bg-white rounded-2xl p-4 gap-2"
      )}
      style={{ width: CARD_SIZE, height: CARD_SIZE }}
      {...props}
    >
      <View className={cn("rounded-full p-2 bg-red-15 self-start", iconColor)}>
        <Icon size={24} className="text-text-primary" />
      </View>
      <Text variant="body2" className="text-text-secondary">
        {title}
      </Text>
      {subTitle && <Text>{subTitle}</Text>}
      <View
        className="absolute bottom-4 right-4 opacity-50"
        style={{ transform: [{ rotate: "45deg" }], zIndex: -1 }}
      >
        <PawPrint
          size={60}
          weight="fill"
          className={cn("text-orange-400", decoratorColor)}
        />
      </View>
      <View
        className="absolute top-4 right-4 opacity-50"
        style={{ transform: [{ rotate: "-45deg" }], zIndex: -1 }}
      >
        <PawPrint
          size={30}
          weight="fill"
          className={cn("text-orange-400", decoratorColor)}
        />
      </View>
    </TouchableOpacity>
  );
};
