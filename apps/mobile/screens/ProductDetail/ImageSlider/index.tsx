import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { SCREEN_WIDTH } from "@/constants/common";
import { IProductImage } from "@/interfaces";
import { useMemo, useRef, useState } from "react";
import { FlatList, View, ViewToken } from "react-native";

interface IProps {
  data?: IProductImage[];
}

export const ImageSlider = ({ data }: IProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<IProductImage>[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const slider = useMemo(
    () => (
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={data}
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
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
      />
    ),
    [data, onViewableItemsChanged],
  );

  return (
    <View>
      {slider}
      <View className="absolute bottom-4 right-1 bg-option-selected px-2 rounded-full">
        <Text variant="footnote">
          {currentIndex + 1}/{data?.length}
        </Text>
      </View>
    </View>
  );
};
