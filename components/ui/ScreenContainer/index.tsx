import { cn } from "@/utils";
import { ScrollView, ScrollViewProps, View, ViewProps } from "react-native";

interface IScreenContainerProps extends ScrollViewProps, ViewProps {}

export const ScreenContainer = ({
  children,
  contentContainerClassName,
  className,
  scrollEnabled,
  ...props
}: IScreenContainerProps) => {
  if (scrollEnabled) {
    return (
      <ScrollView
        className={cn("flex-1 bg-background-screen", className)}
        contentContainerClassName={cn(
          "pt-safe-or-4 px-5",
          contentContainerClassName
        )}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <View
      className={cn("flex-1 px-5 bg-background-screen pt-safe-or-4", className)}
      {...props}
    >
      {children}
    </View>
  );
};
