import { BottomActionWrapper } from "@/components/BottomActionWrapper";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { withLoading } from "@/hocs/withLoading";
import { IOrderSummaryResponse } from "@/interfaces";
import { View } from "react-native";

interface IProps {
  data?: IOrderSummaryResponse["data"]["summary"];
  loading?: boolean;
}

const EnhancedText = withLoading(Text);

export const BottomActions = ({ data, loading }: IProps) => {
  return (
    <BottomActionWrapper>
      <View className="flex-row justify-between">
        <Text className="font-semibold">Total</Text>
        <EnhancedText
          loadingClassName="h-5 w-20"
          isLoading={loading}
          className="text-text-link font-semibold"
        >
          {data?.total}
        </EnhancedText>
      </View>
      <Button className="flex-1" loading={loading}>
        Place Order
      </Button>
    </BottomActionWrapper>
  );
};
