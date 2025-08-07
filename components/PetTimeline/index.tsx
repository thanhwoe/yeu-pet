import { IPet } from "@/interfaces";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";
import { FlatList, View } from "react-native";
import { Text } from "../ui/Text";
import { TimelineList } from "./TimelineList";

interface IProps {
  selectedPet: IPet | null;
  data: IPet[];
  isLoading: boolean;
}
const itemWidth = SCREEN_WIDTH - 24;

export const PetTimeline = ({ data, isLoading, selectedPet }: IProps) => {
  const listRef = useRef<FlatList<IPet>>(null);

  const renderItem = ({ item }: { item: IPet }) => {
    return <TimelineList pet={item} />;
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
  if (isLoading) {
    return (
      <View>
        <Text variant="caption2">loading</Text>
      </View>
    );
  }
  return (
    <FlatList
      ref={listRef}
      horizontal
      data={data}
      keyExtractor={keyExtractor}
      snapToAlignment="center"
      decelerationRate="fast"
      contentContainerClassName="gap-4"
      renderItem={renderItem}
      snapToInterval={SCREEN_WIDTH - 28}
      getItemLayout={getItemLayout}
      onScrollToIndexFailed={handleScrollToIndexFailed}
    />
  );
};
