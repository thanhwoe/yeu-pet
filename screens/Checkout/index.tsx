import { Skeleton } from "@/components/Skeleton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ORDER_KEY } from "@/constants/query-keys";
import { getOrderSummaryQuery } from "@/services/order";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { AddressSection } from "./AddressSection";
import { BottomActions } from "./BottomActions";
import { ListItemSection } from "./ListItemSection";
import { PaymentSection } from "./PaymentSection";
import { SummarySection } from "./SummarySection";

export const CheckoutScreen = () => {
  const { productId, quantity } = useLocalSearchParams();

  const { data, isLoading } = useQuery({
    queryKey: ORDER_KEY.list({ productId, quantity }),
    queryFn: () =>
      getOrderSummaryQuery(
        productId && quantity
          ? {
              productId: String(productId),
              quantity: Number(quantity),
            }
          : undefined
      ),
  });

  if (isLoading) {
    return (
      <ScreenContainer className="gap-3 !pt-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton className="h-40" key={index} />
        ))}
      </ScreenContainer>
    );
  }

  return (
    <View className="flex-1">
      <ScreenContainer
        scrollEnabled
        contentContainerClassName="!pt-2 gap-2 pb-40"
      >
        <AddressSection />
        <ListItemSection data={data?.data.products ?? []} />
        <SummarySection data={data?.data.summary} />
        <PaymentSection />
      </ScreenContainer>
      <BottomActions data={data?.data.summary} />
    </View>
  );
};
