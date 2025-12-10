import { Text } from "@/components/ui/Text";
import { View } from "react-native";

export const PaymentSection = () => {
  return (
    <View className="border border-line-tertiary py-2 px-3 bg-background-card-info rounded-xl">
      <Text className="font-semibold">Payment Method</Text>
    </View>
  );
};
