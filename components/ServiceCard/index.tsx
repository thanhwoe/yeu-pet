import { cn } from "@/utils";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { Icon as IconType, PawPrintIcon } from "phosphor-react-native";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

import { withIconClassName } from "@/hocs/withIconClassName";
import { cssInterop } from "nativewind";
import { Body } from "../ui/Typography";

const PawPrint = withIconClassName(PawPrintIcon);
const CARD_SIZE = (SCREEN_WIDTH - 20 * 2 - 16) / 2;

interface IProps extends TouchableOpacityProps {
  title: string;
  subTitle?: string;
  icon: IconType;
  themeColor?: string;
}

const ServiceCardBase = ({
  icon,
  title,
  subTitle,
  themeColor,
  ...props
}: IProps) => {
  const Icon = withIconClassName(icon);

  return (
    <TouchableOpacity
      className={cn(
        "border border-line-primary bg-background-card rounded-16 p-16 gap-8",
      )}
      style={{ width: CARD_SIZE, height: CARD_SIZE }}
      {...props}
    >
      <View className={cn("rounded-full p-8 self-start overflow-hidden")}>
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: themeColor,
              zIndex: -1,
              opacity: 0.8,
            },
          ]}
        />
        <Icon size={24} className="text-icon-primary" weight="bold" />
      </View>
      <Body weight="semiBold">{title}</Body>
      {subTitle && <Body variant="body2">{subTitle}</Body>}
      <View
        className="absolute bottom-4 right-4 opacity-50"
        style={{ transform: [{ rotate: "45deg" }], zIndex: -1 }}
      >
        <PawPrint size={60} weight="fill" color={themeColor} />
      </View>
      <View
        className="absolute top-4 right-4 opacity-50"
        style={{ transform: [{ rotate: "-45deg" }], zIndex: -1 }}
      >
        <PawPrint size={30} weight="fill" color={themeColor} />
      </View>
    </TouchableOpacity>
  );
};

export const ServiceCard = cssInterop(ServiceCardBase, {
  themeClassName: {
    target: false,
    nativeStyleToProp: {
      color: "themeColor",
    },
  },
});
