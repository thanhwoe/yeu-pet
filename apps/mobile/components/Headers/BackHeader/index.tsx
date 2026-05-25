import { Body } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { ArrowLeftIcon as ArrowLeft } from "phosphor-react-native";
import { ReactNode, useState } from "react";
import { StyleProp, TouchableOpacity, View, ViewStyle } from "react-native";

const ArrowLeftIcon = withIconClassName(ArrowLeft);

type HeaderRenderer = (props: any) => ReactNode;

interface BackHeaderProps {
  navigation: {
    canGoBack: () => boolean;
    goBack: () => void;
  };
  options: {
    title?: string;
    headerStyle?: StyleProp<ViewStyle>;
    headerLeft?: HeaderRenderer;
    headerRight?: HeaderRenderer;
    headerTitle?: HeaderRenderer | string;
  };
}

export const BackHeader = ({ options, navigation }: BackHeaderProps) => {
  const [rightButtonWidth, setRightButtonWidth] = useState(27);

  const HeaderRight = options.headerRight;
  const HeaderTitle = options.headerTitle;
  const HeaderLeft = options.headerLeft;
  const MAX_TITLE_WIDTH = Math.max(27, rightButtonWidth);

  return (
    <View
      className={cn(
        "flex-row items-center px-16 pb-12 pt-safe-offset-8 bg-background",
      )}
      style={options.headerStyle}
    >
      {HeaderLeft ? (
        <HeaderLeft canGoBack={navigation.canGoBack()} />
      ) : (
        navigation.canGoBack() && (
          <TouchableOpacity
            onPress={navigation.goBack}
            style={{ width: MAX_TITLE_WIDTH, height: 27 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeftIcon
              size={27}
              weight="bold"
              className="text-icon-primary"
            />
          </TouchableOpacity>
        )
      )}
      {typeof HeaderTitle === "function" ? (
        <View className="flex-1 justify-center items-center">
          {HeaderTitle({ children: options.title ?? "" })}
        </View>
      ) : (
        <Body className="flex-1" center weight="semiBold" numberOfLines={1}>
          {HeaderTitle ?? options.title ?? ""}
        </Body>
      )}
      {HeaderRight ? (
        <View
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setRightButtonWidth(width);
          }}
        >
          {HeaderRight({})}
        </View>
      ) : (
        <View className="w-[27px]" />
      )}
    </View>
  );
};
