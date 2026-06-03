import { USER_KEY } from "@/constants/query-keys";
import { getUserQuery, saveDeviceInfoMutation } from "@/services";
import { useUserInfoStore } from "@/stores";
import { registerForPushNotificationsAsync } from "@/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
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

    const task = InteractionManager.runAfterInteractions(() => {
      registerForPushNotificationsAsync().then((token) => {
        if (!isActive || !token) {
          return;
        }

        mutateAsync({
          pushToken: token,
          platform: Platform.select({
            android: "android",
            ios: "ios",
            default: "unknown",
          }),
          deviceName: Device.deviceName ?? undefined,
          osVersion: Device.osVersion ?? undefined,
        });
      });
    });

    const sub = Notifications.addPushTokenListener((newToken) => {
      mutateAsync({
        pushToken: newToken.data,
        platform: Platform.select({
          android: "android",
          ios: "ios",
          default: "unknown",
        }),
      });
    });

    return () => {
      isActive = false;
      task.cancel();
      sub.remove();
    };
  }, [isAuthenticated, mutateAsync]);

  useEffect(() => {
    if (data) {
      updateUser(data);
    }
  }, [data, updateUser]);

  return null;
};
