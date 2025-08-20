import { IPet } from "@/interfaces";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef } from "react";
import { FlatList, View } from "react-native";
import { PetProfileCard } from "../PetProfileCard";
import { Skeleton } from "../Skeleton";
import { Image } from "../ui/Image";
import { Text } from "../ui/Text";

interface IProps {
  selectedPet: IPet | null;
  data: IPet[];
  isLoading: boolean;
}

const itemWidth = SCREEN_WIDTH - 24;

export const PetInfoCardList = ({ selectedPet, data, isLoading }: IProps) => {
  const listRef = useRef<FlatList<IPet>>(null);

  const renderItem = ({ item }: { item: IPet }) => {
    return <PetProfileCard data={item} />;
  };

  useEffect(() => {
    if (selectedPet && data.length > 0) {
      const targetIndex = data.findIndex(
        (pet) => pet.pet_id === selectedPet.pet_id
      );

      if (targetIndex !== -1) {
        listRef.current?.scrollToIndex({
          index: targetIndex,
          animated: true,
        });
      }
    }
  }, [selectedPet, data]);

  const getItemLayout = (_data: any, index: number) => ({
    length: itemWidth,
    offset: itemWidth * index,
    index,
  });

  const handleScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 500));
    wait.then(() => {
      listRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    });
  };

  const keyExtractor = (item: IPet) => item.pet_id;

  const listEmptyComponent = useMemo(
    () => (
      <View
        style={{
          width: SCREEN_WIDTH - 38,
          height: 250,
        }}
      >
        <View className="items-center overflow-hidden gap-2 justify-center flex-1 bg-background-white rounded-2xl">
          <View className="absolute bottom-0 right-0">
            <Image
              contentFit="contain"
              className="size-56"
              source={require("@/assets/images/funny-cat.png")}
            />
          </View>
          <Text>Add your pet to get started</Text>
        </View>
      </View>
    ),
    []
  );

  if (isLoading) {
    return <Skeleton className="h-[300px] rounded-2xl" />;
  }

  return (
    <FlatList
      ref={listRef}
      horizontal
      data={data}
      keyExtractor={keyExtractor}
      snapToAlignment="center"
      snapToInterval={SCREEN_WIDTH - 28}
      decelerationRate="fast"
      ListEmptyComponent={listEmptyComponent}
      contentContainerClassName="gap-4"
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      onScrollToIndexFailed={handleScrollToIndexFailed}
    />
  );
};
