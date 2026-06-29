import { Tabs } from "@/components/Tabs";
import { SocialPhotos } from "@/features/photos/components/SocialPhotos";
import { TakePhotoSheet } from "@/features/photos/components/TakePhotoSheet";
import { UserPhotos } from "@/features/photos/components/UserPhotos";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useTakePhoto } from "@/hooks/useTakePhoto";
import { nativeShadows } from "@/theme/shadows";
import { CameraIcon } from "phosphor-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Camera = withIconClassName(CameraIcon);

const PHOTO_TABS = [
  {
    titleKey: "photos.tabs.social",
    value: 0,
  },
  {
    titleKey: "photos.tabs.mine",
    value: 1,
  },
];

export const PhotosScreen = () => {
  const { t } = useTranslation();
  const { handleTakePhoto, image, clearImage } = useTakePhoto();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(PHOTO_TABS[0].value);
  const tabs = useMemo(
    () =>
      PHOTO_TABS.map((tab) => ({
        title: t(tab.titleKey),
        value: tab.value,
      })),
    [t],
  );

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
    <View className="flex-1 bg-background px-20 pt-8">
      <Tabs
        tabs={tabs}
        active={activeTab}
        onChange={setActiveTab}
        className="mb-16 self-center"
      />

      <View className="flex-1">{activeContent}</View>

      <TouchableOpacity
        accessibilityLabel={t("photos.accessibility.choosePhoto")}
        accessibilityRole="button"
        activeOpacity={0.82}
        onPress={handleTakePhoto}
        className="absolute h-56 w-56 items-center justify-center rounded-full bg-background-primary"
        style={[
          styles.cameraButton,
          nativeShadows.floating,
          { bottom: Math.max(insets.bottom + 24, 36) },
        ]}
      >
        <Camera size={26} weight="bold" className="text-icon-primary-inverse" />
      </TouchableOpacity>

      <TakePhotoSheet visible={!!image} image={image} onDismiss={clearImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  cameraButton: {
    left: "50%",
    transform: [{ translateX: -10 }],
  },
});
