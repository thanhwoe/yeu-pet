import { Skeleton } from "@/components/Skeleton";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { IOrderSummaryResponse } from "@/interfaces";
import { calculateDiscountPercentage } from "@/utils";
import { FlatList, ListRenderItem, View } from "react-native";

interface IProps {
  data: IOrderSummaryResponse["data"]["products"];
}

export const ListItemSection = ({ data }: IProps) => {
  const renderItem: ListRenderItem<(typeof data)[number]> = ({ item }) => (
    <View className="flex-row p-2 gap-2">
      <Image
        source={
          item?.thumbnail_url
            ? { uri: item.thumbnail_url }
            : require("@/assets/images/fallback-product.png")
        }
        className="size-20 rounded-xl"
        contentFit="cover"
      />
      <View className="flex-1">
        <Text numberOfLines={1}>{item?.name}</Text>
        <Text className="font-bold text-text-link">{item?.sale_price}</Text>
        <View className="flex-row gap-2">
          <Text variant="body2" className="line-through text-text-secondary">
            {item?.original_price}
          </Text>
          <View className="p-1 items-center rounded-md justify-center bg-background-primary">
            <Text
              variant="caption2"
              className="font-semibold text-text-primary-inverse"
            >
              {calculateDiscountPercentage(
                item?.original_price,
                item?.sale_price
              )}
            </Text>
          </View>
        </View>
      </View>
      <Text className="text-text-secondary self-end" variant="body2">
        {item?.quantity}x
      </Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(i) => i.id}
      scrollEnabled={false}
      ListEmptyComponent={() => <Skeleton className="h-24" />}
      ItemSeparatorComponent={() => (
        <View className="h-1 bg-background-screen" />
      )}
      className="border rounded-xl border-line-tertiary bg-background-card-info"
    />
  );
};
