import { Tabs } from "@/components/Tabs";
import { useTakePhoto } from "@/hooks/useTakePhoto";
import { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { SocialPhotos } from "./SocialPhotos";
import { TakePhotoSheet } from "./TakePhotoSheet";
import { UserPhotos } from "./UserPhotos";

const PHOTO_TABS = [
  {
    title: "Social Photos",
    value: 0,
  },
  {
    title: "My Photos",
    value: 1,
  },
];

export const PhotosScreen = () => {
  const { handleTakePhoto, image, clearImage } = useTakePhoto();
  const [activeTab, setActiveTab] = useState(PHOTO_TABS[0].value);

  const activeContent = useMemo(() => {
    switch (activeTab) {
      case 1:
        return <UserPhotos />;
      case 0:
      default:
        return <SocialPhotos />;
    }
  }, [activeTab]);

  return (
    <View className="flex-1 px-5 bg-background-screen pt-2">
      <Tabs
        tabs={PHOTO_TABS}
        active={activeTab}
        onChange={setActiveTab}
        size="large"
        className="self-center mb-4"
      />

      <View className="flex-1">{activeContent}</View>

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
