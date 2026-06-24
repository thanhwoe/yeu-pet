import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Text } from "@/components/ui/Text";
import { SETTINGS_KEY } from "@/constants/query-keys";
import { SettingToggle } from "@/features/settings/components/SettingToggle";
import { SettingsRow } from "@/features/settings/components/SettingsRow";
import { SettingsSection } from "@/features/settings/components/SettingsSection";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IUserSettingsForm } from "@/interfaces";
import {
  getUserSettingsQuery,
  saveDeviceInfoMutation,
  updateUserSettingsMutation,
} from "@/services";
import { useUserInfoStore } from "@/stores";
import {
  getPushInstallationIdAsync,
  getPushNotificationPermissionStatusAsync,
  getPushRegistrationGenerationAsync,
  registerForFirebasePushNotificationsAsync,
  type PushNotificationPermissionStatus,
} from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Device from "expo-device";
import { BellSlashIcon } from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import { AppState, Linking, Platform, View } from "react-native";

const BellSlash = withIconClassName(BellSlashIcon);

type PermissionState = PushNotificationPermissionStatus | "checking" | "error";

function DevicePermissionCard({
  onOpenSettings,
}: {
  onOpenSettings: () => void;
}) {
  return (
    <View className="gap-16 rounded-22 px-18 py-20">
      <View className="gap-4 items-center">
        <View className="h-44 w-44 items-center justify-center rounded-14 bg-background-warning">
          <BellSlash
            size={24}
            weight="duotone"
            className="text-status-warning-icon"
          />
        </View>
        <Text variant="heading" className="font-bold text-status-warning-text">
          Notifications are disabled
        </Text>
        <Text variant="body2" className="text-status-warning-text">
          Enable notification to receive alert.
        </Text>
      </View>
      <Button
        variant="secondary"
        accessibilityLabel="Open device notification settings"
        onPress={onOpenSettings}
      >
        Open device settings
      </Button>
    </View>
  );
}

export function NotificationSettingsScreen() {
  const queryClient = useQueryClient();
  const updateDeviceInfo = useUserInfoStore.use.updateDeviceInfo();
  const [permissionState, setPermissionState] =
    useState<PermissionState>("checking");
  const [isRegisteringPush, setIsRegisteringPush] = useState(false);

  const {
    data: settings,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: SETTINGS_KEY.detail(),
    queryFn: getUserSettingsQuery,
  });

  const refreshPermission = useCallback(async () => {
    try {
      const status = await getPushNotificationPermissionStatusAsync();
      setPermissionState(status);
    } catch {
      setPermissionState("error");
    }
  }, []);

  useEffect(() => {
    void refreshPermission();
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        if (nextState === "active") {
          void refreshPermission();
        }
      },
    );

    return () => appStateSubscription.remove();
  }, [refreshPermission]);

  const { mutateAsync: updateSettings, isPending: isUpdatingSettings } =
    useMutation({
      mutationFn: updateUserSettingsMutation,
      onSuccess: (updatedSettings) => {
        queryClient.setQueryData(SETTINGS_KEY.detail(), updatedSettings);
      },
      onError: (error: Error) => {
        Toast.error({
          title: "Settings not saved",
          text: error.message || "Could not save settings. Please try again.",
        });
      },
    });

  const handleUpdateSettings = useCallback(
    async (params: IUserSettingsForm) => {
      await updateSettings(params);
    },
    [updateSettings],
  );

  const saveNotificationPreference = useCallback(
    (params: IUserSettingsForm) => {
      void handleUpdateSettings(params).catch(() => undefined);
    },
    [handleUpdateSettings],
  );

  const handlePushNotificationsChange = useCallback(
    async (notificationEnable: boolean) => {
      if (!notificationEnable) {
        try {
          await handleUpdateSettings({ notificationEnable: false });
        } catch {
          // The settings mutation already shows the save error.
        }
        return;
      }

      setIsRegisteringPush(true);
      let registrationComplete = false;
      try {
        const pushToken = await registerForFirebasePushNotificationsAsync();
        if (!pushToken) {
          Toast.warn({
            title: "Push unavailable here",
            text: "Push notifications are unavailable on this simulator.",
          });
          return;
        }

        const [installationId, registrationGeneration] = await Promise.all([
          getPushInstallationIdAsync(),
          getPushRegistrationGenerationAsync(),
        ]);
        const device = await saveDeviceInfoMutation({
          pushToken,
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
        updateDeviceInfo({
          deviceName: device.deviceName,
          id: device.id,
          isActive: device.isActive,
          osVersion: device.osVersion,
        });
        registrationComplete = true;
        await handleUpdateSettings({ notificationEnable: true });
        setPermissionState("authorized");
        Toast.success({
          title: "Notifications enabled",
          text: "YeuPet can now send care reminders to this device.",
        });
      } catch (error: unknown) {
        if (!registrationComplete) {
          Toast.warn({
            title: "Notifications not enabled",
            text:
              error instanceof Error
                ? error.message
                : "Could not enable push notifications.",
          });
        }
        await refreshPermission();
      } finally {
        setIsRegisteringPush(false);
      }
    },
    [handleUpdateSettings, refreshPermission, updateDeviceInfo],
  );

  const openDeviceSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      Toast.error({
        title: "Settings did not open",
        text: "Could not open device settings. Please try again.",
      });
    }
  }, []);

  if (permissionState === "checking") {
    return (
      <ScreenContainer>
        <StateView
          variant="loading"
          title="Checking notification access"
          description="Getting your device permission and preferences ready."
          className="flex-1"
        />
      </ScreenContainer>
    );
  }

  if (permissionState === "error") {
    return (
      <ScreenContainer>
        <StateView
          variant="error"
          title="Notification access could not be checked"
          description="Please try again."
          actionLabel="Try again"
          onAction={() => {
            setPermissionState("checking");
            void refreshPermission();
          }}
          className="flex-1"
        />
      </ScreenContainer>
    );
  }

  if (permissionState === "denied") {
    return (
      <ScreenContainer className="pt-20">
        <DevicePermissionCard onOpenSettings={openDeviceSettings} />
      </ScreenContainer>
    );
  }

  if (isLoading && !settings) {
    return (
      <ScreenContainer>
        <StateView
          variant="loading"
          title="Loading notification settings"
          description="Getting your preferences ready."
          className="flex-1"
        />
      </ScreenContainer>
    );
  }

  if (isError || !settings) {
    return (
      <ScreenContainer>
        <StateView
          variant="error"
          title="Notification settings could not load"
          description="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => void refetch()}
          className="flex-1"
        />
      </ScreenContainer>
    );
  }

  const notificationsMuted = !settings.notificationEnable;
  const togglesDisabled = isUpdatingSettings || isRegisteringPush;

  return (
    <ScreenContainer scrollEnabled>
      <View className="px-20 pb-40 pt-16">
        <SettingsSection title="Notification preferences">
          <SettingsRow
            title="Push notifications"
            description="Master notification switch"
            loading={togglesDisabled}
          >
            <SettingToggle
              label="Push notifications"
              value={settings.notificationEnable}
              disabled={togglesDisabled}
              onChange={handlePushNotificationsChange}
            />
          </SettingsRow>
          <SettingsRow
            title="Care reminders"
            description="Vaccines, medicine, grooming"
            value={notificationsMuted ? "Muted" : undefined}
            disabled={notificationsMuted}
          >
            <SettingToggle
              label="Care reminders"
              value={settings.reminderNotifications}
              disabled={togglesDisabled || notificationsMuted}
              onChange={(reminderNotifications) =>
                saveNotificationPreference({ reminderNotifications })
              }
            />
          </SettingsRow>
          <SettingsRow
            title="Sitter booking"
            description="Requests and messages"
            value={notificationsMuted ? "Muted" : undefined}
            disabled={notificationsMuted}
          >
            <SettingToggle
              label="Sitter booking notifications"
              value={settings.bookingNotifications}
              disabled={togglesDisabled || notificationsMuted}
              onChange={(bookingNotifications) =>
                saveNotificationPreference({ bookingNotifications })
              }
            />
          </SettingsRow>
          <SettingsRow
            title="Photos/social"
            description="Comments and activity"
            value={notificationsMuted ? "Muted" : undefined}
            disabled={notificationsMuted}
          >
            <SettingToggle
              label="Photos social notifications"
              value={settings.socialNotifications}
              disabled={togglesDisabled || notificationsMuted}
              onChange={(socialNotifications) =>
                saveNotificationPreference({ socialNotifications })
              }
            />
          </SettingsRow>
          <SettingsRow
            title="Pet Care AI"
            description="Usage and care tips"
            value={notificationsMuted ? "Muted" : undefined}
            disabled={notificationsMuted}
          >
            <SettingToggle
              label="Pet Care AI notifications"
              value={settings.aiNotifications}
              disabled={togglesDisabled || notificationsMuted}
              onChange={(aiNotifications) =>
                saveNotificationPreference({ aiNotifications })
              }
            />
          </SettingsRow>
        </SettingsSection>
      </View>
    </ScreenContainer>
  );
}
