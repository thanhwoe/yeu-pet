import { cn } from "@/utils";
import {
  Keyboard,
  ScrollView,
  ScrollViewProps,
  View,
  ViewProps,
} from "react-native";

interface IScreenContainerProps extends ScrollViewProps, ViewProps {}

export const ScreenContainer = ({
  children,
  className,
  scrollEnabled,
  ...props
}: IScreenContainerProps) => {
  if (scrollEnabled) {
    return (
      <ScrollView
        className={cn("flex-1 bg-background", className)}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        {...props}
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <View
      onStartShouldSetResponder={() => {
        Keyboard.dismiss();
        return false;
      }}
      className={cn("flex-1 px-20 bg-background pt-safe", className)}
      {...props}
    >
      {children}
    </View>
  );
};
