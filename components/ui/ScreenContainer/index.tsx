import { cn } from "@/utils";
import { ScrollView, ScrollViewProps } from "react-native";

export const ScreenContainer = ({
  children,
  ...props
}: {
  children: React.ReactNode;
} & ScrollViewProps) => {
  return (
    <ScrollView
      className="flex-1 bg-background-screen"
      contentContainerClassName={cn("pt-safe-or-4 px-5 pb-safe-or-2")}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
};
