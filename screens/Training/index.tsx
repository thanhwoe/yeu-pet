import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { mockTrainingData } from "./mock";

export const TrainingScreen = () => {
  const router = useRouter();
  return (
    <ScreenContainer>
      <View className="gap-2">
        {mockTrainingData.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-orange-10 py-2 px-4 rounded-2xl"
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
