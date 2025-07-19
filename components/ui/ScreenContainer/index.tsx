import { ScrollView } from "react-native";

export const ScreenContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ScrollView
      className="flex-1 bg-orange-50"
      contentContainerClassName=" pt-safe-or-4 px-5 pb-safe-or-2"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};
