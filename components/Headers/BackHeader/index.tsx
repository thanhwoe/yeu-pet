import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { ArrowLeftIcon as ArrowLeft } from "phosphor-react-native";
import { useState } from "react";
import { TouchableOpacity, View, ViewStyle } from "react-native";

const ArrowLeftIcon = withIconClassName(ArrowLeft);

export const BackHeader = ({ options, navigation }: NativeStackHeaderProps) => {
  const [rightButtonWidth, setRightButtonWidth] = useState(27);

  const HeaderRight = options.headerRight;
  const HeaderTitle = options.headerTitle;
  const HeaderLeft = options.headerLeft;
  const MAX_TITLE_WIDTH = Math.max(27, rightButtonWidth);

  return (
    <View
      className={cn(
        "flex-row items-center gap-2 px-4 pb-2 pt-safe-offset-2 bg-background",
      )}
      style={options.headerStyle as ViewStyle}
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
              className="text-icon-primary-foreground"
            />
          </TouchableOpacity>
        )
      )}
      {HeaderTitle ? (
        <View className="flex-1 justify-center items-center">
          <HeaderTitle>{options.title ?? ""}</HeaderTitle>
        </View>
      ) : (
        <Text className="flex-1 text-center font-medium" numberOfLines={1}>
          {options.title ?? ""}
        </Text>
      )}
      {HeaderRight ? (
        <View
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            setRightButtonWidth(width);
          }}
        >
          <HeaderRight />
        </View>
      ) : (
        <View className="w-[27px]" />
      )}
    </View>
  );
};
