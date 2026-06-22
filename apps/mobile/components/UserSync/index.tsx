import { USER_KEY } from "@/constants/query-keys";
import { getUserQuery, saveDeviceInfoMutation } from "@/services";
import { useUserInfoStore } from "@/stores";
import {
  registerForFirebasePushNotificationsAsync,
  subscribeToFirebasePushTokenRefresh,
} from "@/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Device from "expo-device";
import { useEffect } from "react";
import { InteractionManager, Platform } from "react-native";
import { Toast } from "../Toast";

export const UserSync = () => {
  const { user, updateUser, updateDeviceInfo } = useUserInfoStore();

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
      Toast.error({ text: e.message });
    },
    onSuccess(res) {
      updateDeviceInfo({
        deviceName: res.deviceName,
        id: res.id,
        isActive: res.isActive,
        osVersion: res.osVersion,
      });
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isActive = true;
    let registrationPromise: Promise<void> | null = null;

    const syncFirebasePushToken = (refreshedToken?: string) => {
      if (registrationPromise) {
        return registrationPromise;
      }

      registrationPromise = Promise.resolve(
        refreshedToken ?? registerForFirebasePushNotificationsAsync(),
      )
        .then(async (token) => {
          if (!isActive || !token) {
            return;
          }

          await mutateAsync({
            pushToken: token,
            platform: Platform.select({
              android: "android",
              ios: "ios",
              default: "unknown",
            }),
            deviceName: Device.deviceName ?? undefined,
            osVersion: Device.osVersion ?? undefined,
          });
        })
        .finally(() => {
          registrationPromise = null;
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
  }, [isAuthenticated, mutateAsync]);

  useEffect(() => {
    if (data) {
      updateUser(data);
    }
  }, [data, updateUser]);

  return null;
};
