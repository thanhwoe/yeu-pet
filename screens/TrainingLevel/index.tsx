import { BottomSheet } from "@/components/ui/BottomSheet";
import { Image } from "@/components/ui/Image";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useLocalSearchParams } from "expo-router";
import { BarbellIcon, SealCheckIcon } from "phosphor-react-native";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { mockTrainingData } from "../Training/mock";

const Barbell = withIconClassName(BarbellIcon);
const SealCheck = withIconClassName(SealCheckIcon);

export const TrainingLevelScreen = () => {
  const [selectedItem, setSelectedItem] =
    useState<(typeof mockTrainingData)[0]["exercises"][0]>();

  const { level } = useLocalSearchParams();
  const trainingData = mockTrainingData.find((i) => i.level === Number(level));
  return (
    <ScreenContainer contentContainerClassName="pt-2 px-5 pb-safe-or-2">
      <View className="gap-2">
        {trainingData?.exercises.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelectedItem(item)}
            className="flex-row p-2 bg-white rounded-2xl items-center gap-3"
          >
            <Image style={{ width: 50, height: 50 }} source={item.image_url} />
            <Text>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <BottomSheet
        visible={!!selectedItem}
        onDismiss={() => setSelectedItem(undefined)}
        titleElement={<Text className="font-bold">{selectedItem?.title}</Text>}
      >
        <View className="px-6">
          <Image
            cachePolicy="disk"
            contentFit="cover"
            transition={300}
            style={{ width: 200, height: 200, alignSelf: "center" }}
            source={selectedItem?.image_url}
          />
          <View className="bg-background-secondary gap-2 p-4 rounded-2xl">
            <View className="flex-row gap-1">
              <Barbell />
              <Text className="font-bold">Steps:</Text>
            </View>
            {selectedItem?.steps.map((item, index) => (
              <Text key={index}>
                {index + 1}. {item}
              </Text>
            ))}
          </View>
          <View className="bg-background-secondary mt-4 gap-2 p-4 rounded-2xl">
            <View className="flex-row gap-1">
              <SealCheck />
              <Text className="font-bold">Tricks:</Text>
            </View>
            {selectedItem?.tricks.map((item, index) => (
              <Text key={index}>• {item}</Text>
            ))}
          </View>
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
};
