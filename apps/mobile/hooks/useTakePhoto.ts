import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking } from "react-native";

export const useTakePhoto = () => {
  const { t } = useTranslation();
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset>();
  const openSettings = useCallback(
    () =>
      Alert.alert(
        t("photos.cameraPermission.title"),
        t("photos.cameraPermission.description"),
        [
          {
            text: t("photos.cameraPermission.cancel"),
            style: "cancel",
          },
          {
            text: t("photos.cameraPermission.openSettings"),
            onPress: Linking.openSettings,
          },
        ],
      ),
    [t],
  );

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
