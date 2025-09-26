import { BottomSheet } from "@/components/ui/BottomSheet";
import { Image } from "@/components/ui/Image";
import { RadioCheckbox } from "@/components/ui/RadioCheckbox";
import { PHOTOS_KEY } from "@/constants/query-keys";
import { uploadPhotoMutation } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePickerAsset } from "expo-image-picker";
import { useState } from "react";
import { View } from "react-native";
import { CaptionInput } from "../CaptionInput";
import { SubmitButton } from "../SubmitButton";

interface IProps {
  visible: boolean;
  image?: ImagePickerAsset;
  onDismiss: () => void;
}
export const TakePhotoSheet = ({ onDismiss, visible, image }: IProps) => {
  const [checked, setChecked] = useState<boolean>(true);
  const [caption, setCaption] = useState<string>("");
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: uploadPhotoMutation,
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: PHOTOS_KEY.lists() });
      onDismiss();
    },
    onError(error) {
      console.log({ error });
    },
  });

  const handleSubmit = async () => {
    if (image) {
      await mutateAsync({
        caption,
        isPublic: checked,
        image,
      });
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onDismiss={onDismiss}
      useScrollView={false}
      keyboardBehavior="interactive"
    >
      <View className="px-2 gap-5">
        <View>
          <Image source={{ uri: image?.uri }} className="h-72 rounded-lg" />
          <CaptionInput
            placeholder="Bạn đang nghĩ gì?"
            onChangeText={setCaption}
            containerClassName="absolute bottom-2 left-1/2 transform -translate-x-1/2 rounded-xl overflow-hidden py-1 px-2"
          />
        </View>
        <View className="px-5 items-center justify-between gap-8 flex-row ">
          <View className="w-12" />
          <SubmitButton onPress={handleSubmit} disabled={isPending} />
          <RadioCheckbox
            checked={checked}
            disabled={isPending}
            label="Public"
            onPress={() => {
              setChecked(!checked);
            }}
          />
        </View>
      </View>
    </BottomSheet>
  );
};
