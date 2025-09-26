import { BottomSheet } from "@/components/ui/BottomSheet";
import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import { uploadFileMutation } from "@/services/file";
import { useMutation } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { ComponentType, useCallback, useEffect, useState } from "react";
import { Alert, Linking, TouchableOpacity, View } from "react-native";

interface WithUploadImageProps {}
interface InjectProps {
  onUpload: (val: string) => void;
  onProcess?: (val: boolean) => void;
}

const openSettings = () =>
  Alert.alert("Pet Land Would Like to Access the Camera", "Description", [
    {
      text: "Cancel",
      style: "cancel",
    },
    { text: "Setting", onPress: Linking.openSettings },
  ]);

export const withUploadImage =
  <P extends WithUploadImageProps>(Component: ComponentType<P>) =>
  // eslint-disable-next-line react/display-name
  (props: Omit<P, keyof WithUploadImageProps> & InjectProps) => {
    const [isShowOptions, setIsShowOptions] = useState(false);
    const [uri, setUri] = useState("");

    const { mutateAsync, isPending } = useMutation({
      mutationFn: uploadFileMutation,
      onError(error) {
        console.log({ error });
      },
    });

    useEffect(() => {
      props.onProcess?.(isPending);
    }, [isPending, props]);

    const handleShowOption = () => {
      setIsShowOptions(true);
    };

    const handleError = useCallback((err: unknown) => {
      console.log(err);
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
        const { secure_url, url } = await mutateAsync(assets[0]);
        props.onUpload(secure_url ?? url);
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
        const { secure_url, url } = await mutateAsync(assets[0]);
        props.onUpload(secure_url ?? url);
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
        const { secure_url, url } = await mutateAsync(assets[0]);
        props.onUpload(secure_url ?? url);
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
        {isPending && (
          <View className="absolute items-center justify-center inset-0 bottom-0 bg-white opacity-50">
            <Spinner className="text-icon-foreground" />
          </View>
        )}

        <BottomSheet
          visible={isShowOptions}
          onDismiss={() => setIsShowOptions(false)}
          stackBehavior="push"
          titleElement={<Text className="font-medium">Choose an option</Text>}
        >
          {options.map(({ label, onPress }, index) => (
            <TouchableOpacity
              key={label}
              onPress={onPress}
              className="items-center py-2 border-b border-line-secondary"
            >
              <Text>{label}</Text>
            </TouchableOpacity>
          ))}
        </BottomSheet>
      </View>
    );
  };
