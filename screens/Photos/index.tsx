import { Tabs } from "@/components/Tabs";
import { useTakePhoto } from "@/hooks/useTakePhoto";
import { TouchableOpacity, View } from "react-native";
import { SocialPhotos } from "./SocialPhotos";
import { TakePhotoSheet } from "./TakePhotoSheet";

export const PhotosScreen = () => {
  const { handleTakePhoto, image, clearImage } = useTakePhoto();

  const tabs = [
    {
      title: "Social Photos",
      content: () => <SocialPhotos />,
    },
    {
      title: "My Photos",
      content: () => <></>,
    },
  ];

  return (
    <View className="flex-1 px-5 bg-background-screen pt-2">
      <Tabs tabs={tabs} />

      <TouchableOpacity
        onPress={handleTakePhoto}
        className="absolute bottom-10 size-12 bg-background-primary p-1 rounded-full self-center items-end"
      >
        <View className="w-full h-full bg-background-white p-[2px] rounded-full">
          <View className="w-full h-full bg-background-secondary rounded-full" />
        </View>
      </TouchableOpacity>

      <TakePhotoSheet visible={!!image} image={image} onDismiss={clearImage} />
    </View>
  );
};
