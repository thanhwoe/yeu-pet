import { Toast } from "@/components/Toast";
import { i18n } from "@/i18n";
import * as MediaLibrary from "expo-media-library";
import { Alert, Linking } from "react-native";

const alertGalleryPermission = () =>
  Alert.alert(
    i18n.t("common.permission.galleryTitle"),
    i18n.t("common.permission.galleryDescription"),
    [
      {
        text: i18n.t("common.cancel"),
        style: "cancel",
      },
      { text: i18n.t("common.settings"), onPress: Linking.openSettings },
    ],
  );

export const saveImageToGallery = async (imageUri: string) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status === "granted") {
      await MediaLibrary.saveToLibraryAsync(imageUri);
      Toast.success({
        title: i18n.t("photos.view.savedTitle"),
        text: i18n.t("photos.view.savedText"),
      });
    } else {
      alertGalleryPermission();
    }
  } catch {
    // TODO: sentry log
  }
};
