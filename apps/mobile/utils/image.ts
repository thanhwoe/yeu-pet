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
      Toast.success({
        title: "Image saved",
        text: "You can find it in your device gallery.",
      });
    } else {
      alertGalleryPermission();
    }
  } catch (error) {
    // TODO: sentry log
  }
};
