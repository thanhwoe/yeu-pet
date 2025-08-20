import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { mockTrainingData } from "./mock";

export const TrainingScreen = () => {
  const router = useRouter();
  return (
    <ScreenContainer contentContainerClassName="pt-2 px-5 pb-safe-or-2">
      <View className="gap-2">
        {mockTrainingData.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-background-white py-4 px-4 rounded-2xl"
            onPress={() => router.push(`/(training)/${item.level}`)}
          >
            <Text>
              Level: {item.level} - {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
};
