import { PET_KEY } from "@/constants/query-keys";
import { IPetInfoForm } from "@/constants/validation";
import { withIconClassName } from "@/hocs/withIconClassName";
import { createPetMutation } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "phosphor-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { PetInfoForm } from "../PetInfoForm";
import { Toast } from "../Toast";
import { BottomSheet } from "../ui/BottomSheet";
import { Body } from "../ui/Typography";
import { CARD_HEIGHT, CARD_WIDTH, SCALE_CENTER, SCALE_SIDE } from "./utils";

const Plus = withIconClassName(PlusIcon);
const CardWrapper = Animated.createAnimatedComponent(TouchableOpacity);

export const AddCard = ({
  index,
  scrollX,
}: {
  index: number;
  scrollX: SharedValue<number>;
}) => {
  const [showForm, setShowForm] = useState(false);

  const zoomStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [SCALE_SIDE, SCALE_CENTER, SCALE_SIDE],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.65, 1, 0.65],
      Extrapolation.CLAMP,
    );
    return { transform: [{ scale }], opacity };
  });

  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createPetMutation,
    onError(e) {
      Toast.error({ text: e.message });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: PET_KEY.list() });
      setShowForm(false);
    },
  });

  const handleSubmit = async (data: IPetInfoForm) => {
    mutateAsync(data);
  };

  return (
    <>
      <CardWrapper
        onPress={() => setShowForm(true)}
        className="relative bg-background-card rounded-28 justify-center items-center border-2 border-dashed border-line-secondary overflow-hidden"
        style={[{ width: CARD_WIDTH, height: CARD_HEIGHT }, zoomStyle]}
      >
        <View className="size-68 rounded-full bg-background-card border-2 border-line-secondary border-dashed justify-center items-center mb-14">
          <Plus size={30} className="text-line-secondary" />
        </View>
        <Body weight="bold">Add New Pet</Body>
        <Body variant="body2" className="text-text-tertiary-inverse opacity-80">
          Tap to register your furry friend
        </Body>
        {/* Decorative paws */}
        <Text
          style={[
            {
              top: 20,
              right: 24,
              opacity: 0.15,
              fontSize: 40,
              position: "absolute",
            },
          ]}
        >
          🐾
        </Text>
        <Text
          style={[
            {
              bottom: 30,
              left: 18,
              opacity: 0.1,
              fontSize: 28,
              position: "absolute",
            },
          ]}
        >
          🐾
        </Text>
      </CardWrapper>
      <BottomSheet
        stackBehavior="push"
        visible={showForm}
        onDismiss={() => setShowForm(false)}
        titleElement={<Text className="font-medium">Add your pet</Text>}
      >
        <PetInfoForm onSubmit={handleSubmit} isSubmitting={isPending} />
      </BottomSheet>
    </>
  );
};
