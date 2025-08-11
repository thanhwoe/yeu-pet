import { date } from "@/utils";
import { View } from "react-native";
import { Text } from "../ui/Text";

export const AgendaDate = (props: any) => {
  return (
    <View className="bg-background-screen">
      <Text className="text-orange-800 mb-2">{date(props).format("LL")}</Text>
    </View>
  );
};
