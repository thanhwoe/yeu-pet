import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  hasPermission,
  onTokenRefresh,
  requestPermission,
} from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";
import "react-native-get-random-values";
import { PermissionsAndroid, Platform } from "react-native";
import { v4 as uuid } from "uuid";

const PUSH_INSTALLATION_ID_KEY = "PUSH_INSTALLATION_ID";
const PUSH_REGISTRATION_GENERATION_KEY = "PUSH_REGISTRATION_GENERATION";
const PUSH_PERMISSION_REQUESTED_KEY = "PUSH_PERMISSION_REQUESTED";
let installationIdPromise: Promise<string> | undefined;
let registrationGenerationPromise: Promise<number> | undefined;

export type PushNotificationPermissionStatus =
  | "authorized"
  | "denied"
  | "not_determined";

export const getPushInstallationIdAsync = () => {
  installationIdPromise ??= SecureStore.getItemAsync(
    PUSH_INSTALLATION_ID_KEY,
  ).then(async (storedInstallationId) => {
    if (storedInstallationId) {
      return storedInstallationId;
    }

    const installationId = uuid();
    await SecureStore.setItemAsync(PUSH_INSTALLATION_ID_KEY, installationId);
    return installationId;
  });

  return installationIdPromise;
};

const readPushRegistrationGenerationAsync = () => {
  registrationGenerationPromise ??= SecureStore.getItemAsync(
    PUSH_REGISTRATION_GENERATION_KEY,
  ).then((storedGeneration) => {
    const generation = Number(storedGeneration);
    return Number.isSafeInteger(generation) && generation > 0 ? generation : 0;
  });

  return registrationGenerationPromise;
};

export const getPushRegistrationGenerationAsync = async () => {
  const currentGeneration = await readPushRegistrationGenerationAsync();
  if (currentGeneration > 0) {
    return currentGeneration;
  }

  await SecureStore.setItemAsync(PUSH_REGISTRATION_GENERATION_KEY, "1");
  registrationGenerationPromise = Promise.resolve(1);
  return 1;
};

export const startPushRegistrationSessionAsync = async () => {
  const currentGeneration = await readPushRegistrationGenerationAsync();
  const nextGeneration = currentGeneration + 1;

  await SecureStore.setItemAsync(
    PUSH_REGISTRATION_GENERATION_KEY,
    String(nextGeneration),
  );
  registrationGenerationPromise = Promise.resolve(nextGeneration);

  return nextGeneration;
};

const ensureNotificationPermission = async () => {
  if (Platform.OS === "android") {
    if (Platform.Version < 33) {
      return;
    }

    await SecureStore.setItemAsync(PUSH_PERMISSION_REQUESTED_KEY, "1");
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
      status === AuthorizationStatus.PROVISIONAL ||
      status === AuthorizationStatus.EPHEMERAL;

    if (!enabled) {
      throw new Error(
        "Allow notifications in your device settings to receive care reminders.",
      );
    }
  }
};

export const getPushNotificationPermissionStatusAsync =
  async (): Promise<PushNotificationPermissionStatus> => {
    if (Platform.OS === "android") {
      if (Platform.Version < 33) {
        return "authorized";
      }

      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted) {
        return "authorized";
      }

      const requested = await SecureStore.getItemAsync(
        PUSH_PERMISSION_REQUESTED_KEY,
      );
      return requested ? "denied" : "not_determined";
    }

    if (Platform.OS === "ios") {
      const status = await hasPermission(getMessaging());
      if (
        status === AuthorizationStatus.AUTHORIZED ||
        status === AuthorizationStatus.PROVISIONAL ||
        status === AuthorizationStatus.EPHEMERAL
      ) {
        return "authorized";
      }

      return status === AuthorizationStatus.NOT_DETERMINED
        ? "not_determined"
        : "denied";
    }

    return "not_determined";
  };

export async function registerForFirebasePushNotificationsAsync() {
  const supportsFirebasePush = Device.isDevice || Platform.OS === "android";

  if (!supportsFirebasePush) {
    return undefined;
  }

  await ensureNotificationPermission();
  return getToken(getMessaging());
}

export const subscribeToFirebasePushTokenRefresh = (
  listener: (token: string) => void,
) => onTokenRefresh(getMessaging(), listener);
