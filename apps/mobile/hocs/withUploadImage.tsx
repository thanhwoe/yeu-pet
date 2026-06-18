import { Toast } from "@/components/Toast";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Option } from "@/components/ui/Options/option";
import { Body } from "@/components/ui/Typography";
import { UploadFileParam } from "@/interfaces";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { ComponentType, useCallback, useState } from "react";
import { Alert, Linking, View } from "react-native";

interface WithUploadImageProps {}
export interface UploadImageInjectedProps {
  onUpload: (val: UploadFileParam) => void;
}

const openSettings = () =>
  Alert.alert("Yeu Pet Would Like to Access the Camera", "Description", [
    {
      text: "Cancel",
      style: "cancel",
    },
    { text: "Setting", onPress: Linking.openSettings },
  ]);

export const withUploadImage =
  <P extends WithUploadImageProps>(Component: ComponentType<P>) =>
  // eslint-disable-next-line react/display-name
  (props: Omit<P, keyof WithUploadImageProps> & UploadImageInjectedProps) => {
    const [isShowOptions, setIsShowOptions] = useState(false);
    const [uri, setUri] = useState("");

    const handleShowOption = () => {
      setIsShowOptions(true);
    };

    const handleError = useCallback((err: unknown) => {
      Toast.error({
        text: (err as Error).message ?? "Could not select image.",
      });
    }, []);

    // Take a photo from camera
    const handleTakePhoto = async () => {
      setIsShowOptions(false);

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

        const { assets, canceled } = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
        });
        if (!assets || canceled) {
          return;
        }

        setUri(assets[0].uri);
        props.onUpload({
          uri: assets[0].uri,
          type: assets[0].mimeType ?? "image/jpeg",
          name: assets[0]?.fileName ?? `photo_${Date.now()}.jpg`,
          size: assets[0].fileSize,
        });
      } catch (error) {
        handleError(error);
      }
    };

    // Upload image from gallery
    const handlePickPhoto = async () => {
      setIsShowOptions(false);

      try {
        const permission = await ImagePicker.getMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!res.granted) {
            if (!res.canAskAgain) {
              openSettings();
            }
            return;
          }
        }

        const { assets, canceled } = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
        });

        if (!assets || canceled) {
          return;
        }
        setUri(assets[0].uri);
        props.onUpload({
          uri: assets[0].uri,
          type: assets[0].mimeType ?? "image/jpeg",
          name: assets[0]?.fileName ?? `photo_${Date.now()}.jpg`,
          size: assets[0].fileSize,
        });
      } catch (error) {
        handleError(error);
      }
    };

    // Upload image from document
    const handlePickFile = async () => {
      setIsShowOptions(false);
      try {
        const { assets, canceled } = await DocumentPicker.getDocumentAsync({
          type: ["image/*"],
        });
        if (!assets || canceled) {
          return;
        }
        setUri(assets[0].uri);
        props.onUpload({
          uri: assets[0].uri,
          type: assets[0].mimeType ?? "image/jpeg",
          name: assets[0]?.name ?? `photo_${Date.now()}.jpg`,
          size: assets[0].size,
        });
      } catch (error) {
        handleError(error);
      }
    };

    const options = [
      {
        label: "Camera",
        onPress: handleTakePhoto,
      },
      {
        label: "Gallery",
        onPress: handlePickPhoto,
      },
      {
        label: "Document",
        onPress: handlePickFile,
      },
    ];

    return (
      <View>
        <Component
          {...(props as P)}
          onPress={handleShowOption}
          {...(uri && { source: { uri } })}
        />

        <BottomSheet
          visible={isShowOptions}
          onDismiss={() => setIsShowOptions(false)}
          stackBehavior="push"
          titleElement={<Body weight="semiBold">Choose an option</Body>}
        >
          <View className="gap-12 px-20">
            {options.map(({ label, onPress }) => (
              <Option
                key={label}
                item={{
                  label,
                  value: label,
                }}
                onSelect={onPress}
              />
            ))}
          </View>
        </BottomSheet>
      </View>
    );
  };
