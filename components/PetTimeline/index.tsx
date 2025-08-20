import { IPet } from "@/interfaces";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { FlatList, View } from "react-native";
import { Button } from "../ui/Button";
import { Image } from "../ui/Image";
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
  const router = useRouter();

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
          <Text>Don&apos;t forget to add a reminder</Text>
          <Button variant="secondary" onPress={() => router.push("/calendar")}>
            Add reminder
          </Button>
        </View>
      </View>
    ),
    []
  );

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
      ListEmptyComponent={listEmptyComponent}
      renderItem={renderItem}
      snapToInterval={SCREEN_WIDTH - 28}
      getItemLayout={getItemLayout}
      onScrollToIndexFailed={handleScrollToIndexFailed}
    />
  );
};
