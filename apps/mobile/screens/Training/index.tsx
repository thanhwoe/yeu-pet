import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { getTrainingData } from "./mock";

export const TrainingScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const trainingData = useMemo(() => getTrainingData(t), [t]);

  return (
    <ScreenContainer scrollEnabled contentContainerClassName="!pt-2">
      <View className="gap-2">
        {trainingData.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-background-white py-4 px-4 rounded-2xl"
            onPress={() =>
              router.push({
                pathname: "/training/[level]",
                params: { level: String(item.level) },
              })
            }
          >
            <Text>
              {t("training.levelCard", {
                level: item.level,
                title: item.title,
              })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
};
