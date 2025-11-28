import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IProduct } from "@/interfaces";
import { cn } from "@/utils";
import { useRouter } from "expo-router";
import { StarIcon } from "phosphor-react-native";
import { Pressable, View } from "react-native";

const RateIcon = withIconClassName(StarIcon);

interface IProductCardProps {
  index: number;
  data: IProduct;
}

export const ProductCard = ({ index, data }: IProductCardProps) => {
  const router = useRouter();
  const handlePress = () => {
    router.push({
      pathname: "/products/[productId]",
      params: {
        productId: data.id,
      },
    });
  };
  return (
    <Pressable
      onPress={handlePress}
      className={cn("flex-1 mb-4 rounded-xl bg-background-card-info", {
        "mr-2 ml-4": index % 2 === 0,
        "ml-2 mr-4": index % 2 === 1,
      })}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <Image
        source={{
          uri: data.thumbnail_url,
        }}
        className="h-36 rounded-t-xl"
      />
      <View className="px-2 py-2 justify-between">
        <Text numberOfLines={2} className="text-text-highlight-swarthy">
          {data.name}
        </Text>
        <View className="flex-row gap-2 items-center">
          <Text variant="subhead" className="font-bold text-text-link">
            {data.sale_price}đ
          </Text>
          <Text variant="footnote" className="line-through text-text-secondary">
            {data.original_price}đ
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-[2px]">
            <RateIcon size={10} weight="fill" className="text-yellow-40" />
            <Text variant="caption2" className="font-semibold">
              {data.rating_average}
            </Text>
          </View>
          {/* TODO: If have sold number then show bellow content */}
          <Text variant="caption2" className="text-text-secondary">
            |
          </Text>
          <Text variant="caption2" className="text-text-secondary">
            Sold {data.sold_count}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
