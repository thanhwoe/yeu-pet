import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { PRODUCTS_KEY } from "@/constants/query-keys";
import { getProductDetailQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { BottomActions } from "./BottomActions";
import { InfoSection } from "./InfoSection";

export const ProductDetail = () => {
  const { productId } = useLocalSearchParams();
  const { data, isLoading } = useQuery({
    queryKey: PRODUCTS_KEY.detail(String(productId)),
    queryFn: () => getProductDetailQuery({ id: String(productId) }),
  });

  return (
    <View className="flex-1">
      <ScreenContainer
        scrollEnabled
        contentContainerClassName="!pt-0 pb-safe-or-4"
      >
        <InfoSection data={data} loading={isLoading} />
        {/* TODO: Review section */}
      </ScreenContainer>
      <BottomActions loading={isLoading} />
    </View>
  );
};
