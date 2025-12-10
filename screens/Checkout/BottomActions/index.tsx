import { BottomActionWrapper } from "@/components/BottomActionWrapper";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { IOrderSummaryResponse } from "@/interfaces";
import { View } from "react-native";

interface IProps {
  data?: IOrderSummaryResponse["data"]["summary"];
}

export const BottomActions = ({ data }: IProps) => {
  return (
    <BottomActionWrapper>
      <View className="flex-row justify-between">
        <Text className="font-semibold">Total</Text>
        <Text className="text-text-link font-semibold">{data?.total}</Text>
      </View>
      <Button className="flex-1">Place Order</Button>
    </BottomActionWrapper>
  );
};
