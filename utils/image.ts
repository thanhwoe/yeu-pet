import { Toast } from "@/components/Toast";
import * as MediaLibrary from "expo-media-library";
import { Alert, Linking } from "react-native";

const alertGalleryPermission = () =>
  Alert.alert(
    "Yeu Pet Would Like to Access the Gallery to Save Image",
    "Please enable permission in settings",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      { text: "Setting", onPress: Linking.openSettings },
    ],
  );

export const saveImageToGallery = async (imageUri: string) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status === "granted") {
      await MediaLibrary.saveToLibraryAsync(imageUri);
      Toast.show({ text: "Image saved to gallery" });
    } else {
      alertGalleryPermission();
    }
  } catch (error) {
    // TODO: sentry log
  }
};
