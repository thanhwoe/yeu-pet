import { date } from "@/utils";
import { View } from "react-native";
import { Body } from "../ui/Typography";

export const AgendaDate = (props: any) => {
  return (
    <View className="bg-background py-8">
      <Body className="text-text-link mb-2">{date(props).format("LL")}</Body>
    </View>
  );
};
