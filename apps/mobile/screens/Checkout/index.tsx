import { Skeleton } from "@/components/Skeleton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ORDER_KEY } from "@/constants/query-keys";
import { usePayment } from "@/hooks/usePayment";
import { getOrderSummaryQuery } from "@/services/order";
import { useShopStore } from "@/stores/shop-store";
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
  const shippingAddress = useShopStore.use.shippingAddress();

  const { paymentMethod, setPaymentMethod, handlePayment } = usePayment();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ORDER_KEY.list({
      productId,
      quantity,
      shippingAddressId: shippingAddress?.id,
    }),
    queryFn: () =>
      getOrderSummaryQuery({
        productId: String(productId),
        quantity: Number(quantity),
        shippingAddressId: String(shippingAddress?.id),
      }),
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
        <AddressSection data={data?.data.shippingAddress} />
        <ListItemSection data={data?.data.products ?? []} />
        <SummarySection data={data?.data.summary} />
        <PaymentSection
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />
      </ScreenContainer>
      <BottomActions
        onPlaceOrder={handlePayment}
        disabled={!paymentMethod}
        data={data?.data.summary}
        loading={isFetching}
      />
    </View>
  );
};
