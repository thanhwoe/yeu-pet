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
  getApiErrorToast,
  registerForFirebasePushNotificationsAsync,
  type PushNotificationPermissionStatus,
} from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Device from "expo-device";
import { BellSlashIcon } from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import { AppState, Linking, Platform, View } from "react-native";
import { useTranslation } from "react-i18next";

const BellSlash = withIconClassName(BellSlashIcon);

type PermissionState = PushNotificationPermissionStatus | "checking" | "error";

function DevicePermissionCard({
  onOpenSettings,
}: {
  onOpenSettings: () => void;
}) {
  const { t } = useTranslation();

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
          {t("notificationSettings.devicePermission.title")}
        </Text>
        <Text variant="body2" className="text-status-warning-text">
          {t("notificationSettings.devicePermission.description")}
        </Text>
      </View>
      <Button
        variant="secondary"
        accessibilityLabel={t(
          "notificationSettings.devicePermission.accessibilityLabel",
        )}
        onPress={onOpenSettings}
      >
        {t("notificationSettings.devicePermission.button")}
      </Button>
    </View>
  );
}

export function NotificationSettingsScreen() {
  const { t } = useTranslation();
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
      onError: (error: unknown) => {
        Toast.error(
          getApiErrorToast(error, {
            textKey: "notificationSettings.saveError.text",
            titleKey: "notificationSettings.saveError.title",
          }),
        );
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
            title: t("notificationSettings.pushUnavailable.title"),
            text: t("notificationSettings.pushUnavailable.text"),
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
          title: t("notificationSettings.enabled.title"),
          text: t("notificationSettings.enabled.text"),
        });
      } catch (error: unknown) {
        if (!registrationComplete) {
          Toast.warn(
            getApiErrorToast(error, {
              textKey: "notificationSettings.notEnabled.text",
              titleKey: "notificationSettings.notEnabled.title",
            }),
          );
        }
        await refreshPermission();
      } finally {
        setIsRegisteringPush(false);
      }
    },
    [handleUpdateSettings, refreshPermission, t, updateDeviceInfo],
  );

  const openDeviceSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      Toast.error({
        title: t("notificationSettings.openSettingsFailed.title"),
        text: t("notificationSettings.openSettingsFailed.text"),
      });
    }
  }, [t]);

  if (permissionState === "checking") {
    return (
      <ScreenContainer>
        <StateView
          variant="loading"
          title={t("notificationSettings.checking.title")}
          description={t("notificationSettings.checking.description")}
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
          title={t("notificationSettings.accessError.title")}
          description={t("notificationSettings.accessError.description")}
          actionLabel={t("common.tryAgain")}
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
          title={t("notificationSettings.loading.title")}
          description={t("notificationSettings.loading.description")}
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
          title={t("notificationSettings.loadError.title")}
          description={t("notificationSettings.loadError.description")}
          actionLabel={t("common.tryAgain")}
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
        <SettingsSection title={t("notificationSettings.preferences.section")}>
          <SettingsRow
            title={t("notificationSettings.preferences.pushTitle")}
            description={t("notificationSettings.preferences.masterDescription")}
            loading={togglesDisabled}
          >
            <SettingToggle
              label={t("notificationSettings.preferences.pushLabel")}
              value={settings.notificationEnable}
              disabled={togglesDisabled}
              onChange={handlePushNotificationsChange}
            />
          </SettingsRow>
          <SettingsRow
            title={t("notificationSettings.preferences.remindersTitle")}
            description={t(
              "notificationSettings.preferences.remindersDescription",
            )}
            value={
              notificationsMuted ? t("notificationSettings.muted") : undefined
            }
            disabled={notificationsMuted}
          >
            <SettingToggle
              label={t("notificationSettings.preferences.remindersLabel")}
              value={settings.reminderNotifications}
              disabled={togglesDisabled || notificationsMuted}
              onChange={(reminderNotifications) =>
                saveNotificationPreference({ reminderNotifications })
              }
            />
          </SettingsRow>
          <SettingsRow
            title={t("notificationSettings.preferences.bookingTitle")}
            description={t("notificationSettings.preferences.bookingDescription")}
            value={
              notificationsMuted ? t("notificationSettings.muted") : undefined
            }
            disabled={notificationsMuted}
          >
            <SettingToggle
              label={t("notificationSettings.preferences.bookingLabel")}
              value={settings.bookingNotifications}
              disabled={togglesDisabled || notificationsMuted}
              onChange={(bookingNotifications) =>
                saveNotificationPreference({ bookingNotifications })
              }
            />
          </SettingsRow>
          <SettingsRow
            title={t("notificationSettings.preferences.photosTitle")}
            description={t("notificationSettings.preferences.photosDescription")}
            value={
              notificationsMuted ? t("notificationSettings.muted") : undefined
            }
            disabled={notificationsMuted}
          >
            <SettingToggle
              label={t("notificationSettings.preferences.photosLabel")}
              value={settings.socialNotifications}
              disabled={togglesDisabled || notificationsMuted}
              onChange={(socialNotifications) =>
                saveNotificationPreference({ socialNotifications })
              }
            />
          </SettingsRow>
          <SettingsRow
            title={t("notificationSettings.preferences.aiTitle")}
            description={t("notificationSettings.preferences.aiDescription")}
            value={
              notificationsMuted ? t("notificationSettings.muted") : undefined
            }
            disabled={notificationsMuted}
          >
            <SettingToggle
              label={t("notificationSettings.preferences.aiLabel")}
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
