import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IProductDetail } from "@/interfaces";
import { calculateDiscountPercentage } from "@/utils";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import isEmpty from "lodash/isEmpty";
import { StarIcon } from "phosphor-react-native";
import { FlatList, View } from "react-native";
import { SectionSkeleton } from "./SectionSkeleton";

const RateIcon = withIconClassName(StarIcon);

interface IProps {
  data?: IProductDetail;
  loading?: boolean;
}

export const InfoSection = ({ data, loading }: IProps) => {
  if (loading && !data) return <SectionSkeleton />;
  return (
    <>
      {isEmpty(data?.product_images) ? (
        <Image
          source={require("@/assets/images/fallback-product.png")}
          className="h-96 -mx-5"
          contentFit="cover"
        />
      ) : (
        <FlatList
          showsHorizontalScrollIndicator={false}
          data={data?.product_images}
          bounces={false}
          className="-mx-5"
          horizontal
          renderItem={({ item }) => (
            <View style={{ width: SCREEN_WIDTH }}>
              <Image
                source={{
                  uri: item.image_url,
                }}
                className="h-96"
                contentFit="cover"
              />
            </View>
          )}
          keyExtractor={(item) => item.id}
          pagingEnabled
          snapToInterval={SCREEN_WIDTH}
          snapToAlignment="center"
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />
      )}

      {/* Product info -------- */}
      <View className="gap-2 py-2">
        <Text variant="title1" className="font-semibold" numberOfLines={2}>
          {data?.name}
        </Text>
        <View className="flex-row gap-2 items-center">
          <View className="p-1 items-center rounded-md justify-center bg-background-primary">
            <Text
              variant="caption2"
              className="font-semibold text-text-primary-inverse"
            >
              {calculateDiscountPercentage(
                data?.original_price,
                data?.sale_price
              )}
            </Text>
          </View>
          <Text className="font-bold text-text-link">{data?.sale_price}đ</Text>
          <Text variant="body2" className="line-through text-text-secondary">
            {data?.original_price}đ
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-[2px]">
            <RateIcon size={14} weight="fill" className="text-yellow-40" />
            <Text variant="caption1" className="font-semibold">
              {data?.rating_average}
            </Text>
            <Text variant="caption1" className="text-text-highlight">
              ({data?.rating_count})
            </Text>
          </View>
          {/* TODO: If have sold number then show bellow content */}
          <Text variant="caption1" className="text-text-secondary">
            |
          </Text>
          <Text variant="caption1" className="text-text-secondary">
            Sold {data?.sold_count}
          </Text>
        </View>
      </View>

      {/* Product detail -------- */}
      {/* TODO: render rich text */}
      <View className="gap-2 py-2">
        <Text className="font-semibold">Product detail</Text>
        <Text variant="body2">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod ducimus
          ratione quaerat dolores molestiae quidem quas minima iste, eaque
          sapiente, distinctio sed eum temporibus modi debitis officia non fugit
          reprehenderit ad minus, nulla ut! Commodi, perferendis consequuntur.
          Quae exercitationem nulla, fuga incidunt distinctio nobis ipsa vitae
          odio earum dolore esse deleniti ea maiores ex sunt? Tempora recusandae
          magni, tenetur qui eaque reprehenderit nemo autem rerum, nostrum
          architecto laborum quasi minima. Illo officia repellendus cupiditate
          nihil fuga? Modi accusamus vel ratione voluptas, rerum quisquam
          accusantium pariatur in laborum cupiditate nam explicabo inventore
          laboriosam amet quis dicta facilis tenetur natus. Quo, quis.
        </Text>
      </View>
    </>
  );
};
