import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Linking } from "react-native";

const openSettings = () =>
  Alert.alert("Pet Land Would Like to Access the Camera", "Description", [
    {
      text: "Cancel",
      style: "cancel",
    },
    { text: "Setting", onPress: Linking.openSettings },
  ]);

export const useTakePhoto = () => {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset>();

  const handleError = (err: unknown) => {
    console.log(err);
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.getCameraPermissionsAsync();

      if (!permission.granted) {
        const res = await ImagePicker.requestCameraPermissionsAsync();
        if (!res.granted) {
          if (!res.canAskAgain) {
            openSettings();
          }
          return;
        }
      }

      //       const { assets, canceled } = await ImagePicker.launchCameraAsync({
      //   mediaTypes: ["images"],
      // });

      const { assets, canceled } = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
      });
      if (!assets || canceled) {
        return;
      }

      setImage(assets[0]);
    } catch (error) {
      handleError(error);
    }
  };

  const clearImage = () => {
    setImage(undefined);
  };
  return {
    handleTakePhoto,
    image,
    clearImage,
  };
};
