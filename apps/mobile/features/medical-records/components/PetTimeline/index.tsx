import { SCREEN_WIDTH } from "@/constants/common";
import { IPet } from "@/interfaces";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { TimelineList } from "./TimelineList";

interface IProps {
  selectedPet: IPet | null;
  data: IPet[];
  isLoading: boolean;
}
const itemWidth = SCREEN_WIDTH - 24;

export const PetTimeline = ({ data, isLoading, selectedPet }: IProps) => {
  const { t } = useTranslation();
  const listRef = useRef<FlatList<IPet>>(null);
  const router = useRouter();

  const renderItem = useCallback(({ item }: { item: IPet }) => {
    return <TimelineList pet={item} />;
  }, []);

  useEffect(() => {
    if (selectedPet && data.length > 0) {
      const targetIndex = data.findIndex(
        (pet) => pet.id === selectedPet.id,
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
    const wait = new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
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
          <Text>{t("medicalRecords.timeline.emptyReminder")}</Text>
          <Button
            variant="secondary"
            onPress={() => router.push("/(tabs)/(reminder)")}
          >
            {t("medicalRecords.timeline.addReminder")}
          </Button>
        </View>
      </View>
    ),
    [router, t],
  );

  const keyExtractor = (item: IPet) => item.id;
  if (isLoading) {
    return (
      <View>
        <Text variant="caption2">{t("medicalRecords.timeline.loading")}</Text>
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
