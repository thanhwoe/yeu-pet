import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
} from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import { PermissionsAndroid, Platform } from "react-native";

const ensureNotificationPermission = async () => {
  if (Platform.OS === "android") {
    if (Platform.Version < 33) {
      return;
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error(
        "Allow notifications in your device settings to receive care reminders.",
      );
    }
    return;
  }

  if (Platform.OS === "ios") {
    const status = await requestPermission(getMessaging());
    const enabled =
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      throw new Error(
        "Allow notifications in your device settings to receive care reminders.",
      );
    }
  }
};

export async function registerForFirebasePushNotificationsAsync() {
  if (!Device.isDevice) {
    return undefined;
  }

  await ensureNotificationPermission();
  return getToken(getMessaging());
}

export const subscribeToFirebasePushTokenRefresh = (
  listener: (token: string) => void,
) => onTokenRefresh(getMessaging(), listener);
