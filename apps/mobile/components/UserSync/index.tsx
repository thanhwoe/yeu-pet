import { USER_KEY } from "@/constants/query-keys";
import { getUserQuery, saveDeviceInfoMutation } from "@/services";
import { useUserInfoStore } from "@/stores";
import {
  getPushInstallationIdAsync,
  getPushRegistrationGenerationAsync,
  registerForFirebasePushNotificationsAsync,
  subscribeToFirebasePushTokenRefresh,
} from "@/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Device from "expo-device";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, Platform } from "react-native";
import { Toast } from "../Toast";

export const UserSync = () => {
  const { user, updateUser, updateDeviceInfo } = useUserInfoStore();
  const { t } = useTranslation();

  const isAuthenticated = !!user;

  const { data } = useQuery({
    queryKey: USER_KEY.detail(user?.id),
    queryFn: getUserQuery,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minute,
  });

  const { mutateAsync } = useMutation({
    mutationFn: saveDeviceInfoMutation,
    onError(e) {
      Toast.error({
        title: t("common.sync.deviceFailedTitle"),
        text: e.message || t("common.sync.deviceFailedText"),
      });
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isActive = true;
    let registrationPromise: Promise<void> | null = null;
    let pendingToken: string | undefined;

    const registerToken = async (refreshedToken?: string) => {
      const token =
        refreshedToken ?? (await registerForFirebasePushNotificationsAsync());

      if (!isActive || !token) {
        return;
      }

      const [installationId, registrationGeneration] = await Promise.all([
        getPushInstallationIdAsync(),
        getPushRegistrationGenerationAsync(),
      ]);
      if (!isActive) {
        return;
      }

      const device = await mutateAsync({
        pushToken: token,
        installationId,
        registrationGeneration,
        platform: Platform.select({
          android: "android",
          ios: "ios",
          default: "unknown",
        }),
        deviceName: Device.deviceName ?? undefined,
        osVersion: Device.osVersion ?? undefined,
      });

      if (isActive) {
        updateDeviceInfo({
          deviceName: device.deviceName,
          id: device.id,
          isActive: device.isActive,
          osVersion: device.osVersion,
        });
      }
    };

    const syncFirebasePushToken = (refreshedToken?: string) => {
      if (refreshedToken) {
        pendingToken = refreshedToken;
      }

      if (registrationPromise) {
        return registrationPromise;
      }

      const shouldFetchCurrentToken = pendingToken === undefined;
      registrationPromise = (async () => {
        let fetchCurrentToken = shouldFetchCurrentToken;

        while (isActive) {
          const tokenToRegister = pendingToken;
          pendingToken = undefined;

          await registerToken(fetchCurrentToken ? undefined : tokenToRegister);
          fetchCurrentToken = false;

          if (!pendingToken) {
            break;
          }
        }
      })().finally(() => {
        registrationPromise = null;
        if (isActive && pendingToken) {
          void syncFirebasePushToken().catch(() => undefined);
        }
      });

      return registrationPromise;
    };

    const task = InteractionManager.runAfterInteractions(() => {
      void syncFirebasePushToken().catch(() => undefined);
    });

    const unsubscribeTokenRefresh = subscribeToFirebasePushTokenRefresh(
      (token) => {
        void syncFirebasePushToken(token).catch(() => undefined);
      },
    );

    return () => {
      isActive = false;
      task.cancel();
      unsubscribeTokenRefresh();
    };
  }, [isAuthenticated, mutateAsync, updateDeviceInfo, user?.id]);

  useEffect(() => {
    if (data) {
      updateUser(data);
    }
  }, [data, updateUser]);

  return null;
};
