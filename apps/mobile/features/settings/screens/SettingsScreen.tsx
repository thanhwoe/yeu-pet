import { Toast } from "@/components/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Text } from "@/components/ui/Text";
import { SETTINGS_KEY, SUBSCRIPTION_KEY } from "@/constants/query-keys";
import { SegmentedSetting } from "@/features/settings/components/SegmentedSetting";
import { SettingsRow } from "@/features/settings/components/SettingsRow";
import { SettingsSection } from "@/features/settings/components/SettingsSection";
import { SettingToggle } from "@/features/settings/components/SettingToggle";
import { getPlanPeriodCopy } from "@/features/subscriptions/utils";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useLogout } from "@/hooks/useLogout";
import { IUserSettingsForm, SubscriptionEntitlements } from "@/interfaces";
import {
  getEntitlementsQuery,
  getUserSettingsQuery,
  saveDeviceInfoMutation,
  updateUserSettingsMutation,
} from "@/services";
import { useUserInfoStore } from "@/stores";
import {
  getPushInstallationIdAsync,
  getPushRegistrationGenerationAsync,
  registerForFirebasePushNotificationsAsync,
} from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Device from "expo-device";
import { router } from "expo-router";
import { CaretRightIcon } from "phosphor-react-native";
import { useCallback, useState } from "react";
import { Alert, Linking, Platform, Pressable, View } from "react-native";

const CaretRight = withIconClassName(CaretRightIcon);

const THEME_OPTIONS = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
] as const;

const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "Tiếng Việt", value: "vi" },
] as const;

const SUPPORT_EMAIL = "support@yeupet.app";
const PRIVACY_URL = "https://yeupet.app/privacy";
const TERMS_URL = "https://yeupet.app/terms";

const getInitials = (name: string) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "YP";
};

function ProfileCard({
  name,
  contact,
  avatarUrl,
  onEdit,
}: {
  name: string;
  contact: string;
  avatarUrl?: string | null;
  onEdit: () => void;
}) {
  return (
    <View className="flex-row items-center gap-14 rounded-24 border-hairline border-line-subtle bg-background-surface px-16 py-14 shadow-sm">
      {avatarUrl ? (
        <Avatar size="large" source={{ uri: avatarUrl }} />
      ) : (
        <View className="h-56 w-56 items-center justify-center rounded-full bg-background-surface-muted">
          <Text variant="heading" className="font-bold text-text-accent">
            {getInitials(name)}
          </Text>
        </View>
      )}
      <View className="flex-1 gap-2">
        <Text variant="title3" className="font-bold" numberOfLines={1}>
          {name}
        </Text>
        <Text variant="footnote" className="text-text-muted" numberOfLines={1}>
          {contact}
        </Text>
      </View>
      <Button size="sm" variant="outline" onPress={onEdit}>
        Edit
      </Button>
    </View>
  );
}

function SubscriptionSummary({
  entitlements,
  loading,
  error,
  onOpen,
  onRetry,
}: {
  entitlements?: SubscriptionEntitlements;
  loading: boolean;
  error: boolean;
  onOpen: () => void;
  onRetry: () => void;
}) {
  if (loading && !entitlements) {
    return (
      <SettingsRow
        title="Loading plan"
        description="Checking plan and usage."
        loading
      />
    );
  }

  if (error && !entitlements) {
    return (
      <SettingsRow
        title="Plan details could not load"
        description="Retry to refresh your subscription status."
      >
        <Button size="sm" variant="outline" onPress={onRetry}>
          Retry
        </Button>
      </SettingsRow>
    );
  }

  if (!entitlements) {
    return (
      <SettingsRow
        title="Plan details unavailable"
        description="Retry to refresh subscription status."
      />
    );
  }

  const planLabel = entitlements.tier === "premium" ? "Premium" : "Free";
  const isPremium = entitlements.tier === "premium";

  return (
    <View className="gap-12 border-b border-line-subtle px-16 py-14">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View ${planLabel} plan usage`}
        className="min-h-44 flex-row items-center gap-12"
        onPress={onOpen}
      >
        <View className="flex-1 gap-2">
          <Text variant="body2" className="font-semibold">
            {planLabel} plan
          </Text>
          <Text variant="footnote" className="text-text-muted">
            {getPlanPeriodCopy(entitlements)}
          </Text>
        </View>
        <CaretRight size={20} className="text-icon-secondary" />
      </Pressable>

      {!isPremium ? (
        <View className="flex-row gap-10">
          <Button
            size="sm"
            variant="outline"
            wrapperClassName="flex-1"
            onPress={onOpen}
          >
            View usage
          </Button>
          <Button size="sm" wrapperClassName="flex-1" onPress={onOpen}>
            Upgrade
          </Button>
        </View>
      ) : null}
    </View>
  );
}

export function SettingsScreen() {
  const { loading, logout } = useLogout();
  const { setColorScheme } = useColorScheme();
  const user = useUserInfoStore.use.user();
  const updateDeviceInfo = useUserInfoStore.use.updateDeviceInfo();
  const queryClient = useQueryClient();
  const [isRegisteringPush, setIsRegisteringPush] = useState(false);
  const {
    data: settings,
    isError: isSettingsError,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: SETTINGS_KEY.detail(),
    queryFn: getUserSettingsQuery,
  });
  const {
    data: entitlements,
    isError: isEntitlementsError,
    isLoading: isLoadingEntitlements,
    refetch: refetchEntitlements,
  } = useQuery({
    queryKey: SUBSCRIPTION_KEY.entitlements(),
    queryFn: getEntitlementsQuery,
  });

  const { mutateAsync: updateSettings, isPending: isUpdatingSettings } =
    useMutation({
      mutationFn: updateUserSettingsMutation,
      onSuccess: (updatedSettings) => {
        queryClient.setQueryData(SETTINGS_KEY.detail(), updatedSettings);
      },
      onError: (error: Error) => {
        Toast.error({
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
            text: "Push notifications require a physical device.",
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
        Toast.success({ text: "Push notifications enabled." });
      } catch (error: unknown) {
        if (!registrationComplete) {
          Toast.warn({
            text:
              error instanceof Error
                ? error.message
                : "Could not enable push notifications.",
          });
        }
      } finally {
        setIsRegisteringPush(false);
      }
    },
    [handleUpdateSettings, updateDeviceInfo],
  );

  const handleThemeChange = useCallback(
    async (theme: "system" | "light" | "dark") => {
      const previousTheme = settings?.theme ?? "system";

      setColorScheme(theme);
      try {
        await updateSettings({ theme });
      } catch {
        setColorScheme(previousTheme);
      }
    },
    [setColorScheme, settings?.theme, updateSettings],
  );

  const openExternalLink = useCallback(async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Toast.error({ text: "Could not open this link. Please try again." });
    }
  }, []);

  const openSubscription = useCallback(() => {
    router.push("/subscription");
  }, []);

  const handleLogoutPress = useCallback(() => {
    Alert.alert(
      "Log out?",
      "This will clear the local session on this device.",
      [
        { text: "Stay signed in", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: logout,
        },
      ],
    );
  }, [logout]);

  if (isLoadingSettings) {
    return (
      <ScreenContainer>
        <StateView
          variant="loading"
          title="Loading settings"
          description="Getting your account preferences ready."
          className="flex-1"
        />
      </ScreenContainer>
    );
  }

  if (isSettingsError || !settings) {
    return (
      <ScreenContainer>
        <StateView
          variant="error"
          title="Settings could not load"
          description="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => refetchSettings()}
          className="flex-1"
        />
      </ScreenContainer>
    );
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const notificationsMuted = !settings.notificationEnable;
  const displayName = fullName || "YeuPet owner";
  const contact = user?.email || user?.phone || "Account details synced";

  return (
    <ScreenContainer
      scrollEnabled
      className="bg-background"
      stickyHeaderIndices={[0]}
    >
      <View className="bg-background px-20 pb-10 pt-safe-offset-16">
        <View className="border-b border-line-subtle pb-10">
          <Text variant="largeTitle" className="font-bold">
            Settings
          </Text>
        </View>
      </View>

      <View className="gap-22 px-20 pb-120">
        <ProfileCard
          name={displayName}
          contact={contact}
          avatarUrl={user?.avatarUrl}
          onEdit={() => router.push("/profile")}
        />

        <SettingsSection title="Subscription">
          <SubscriptionSummary
            entitlements={entitlements}
            loading={isLoadingEntitlements}
            error={isEntitlementsError}
            onOpen={openSubscription}
            onRetry={() => void refetchEntitlements()}
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow
            title="Push notifications"
            description="Master notification switch"
            loading={isUpdatingSettings || isRegisteringPush}
          >
            <SettingToggle
              label="Push notifications"
              value={settings.notificationEnable}
              disabled={isUpdatingSettings || isRegisteringPush}
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
              disabled={isUpdatingSettings || !settings.notificationEnable}
              onChange={(reminderNotifications) =>
                handleUpdateSettings({ reminderNotifications })
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
              disabled={isUpdatingSettings || !settings.notificationEnable}
              onChange={(bookingNotifications) =>
                handleUpdateSettings({ bookingNotifications })
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
              disabled={isUpdatingSettings || !settings.notificationEnable}
              onChange={(socialNotifications) =>
                handleUpdateSettings({ socialNotifications })
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
              disabled={isUpdatingSettings || !settings.notificationEnable}
              onChange={(aiNotifications) =>
                handleUpdateSettings({ aiNotifications })
              }
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Appearance">
          <SettingsRow title="Theme">
            <SegmentedSetting
              accessibilityLabel="Theme preference"
              options={THEME_OPTIONS}
              value={settings.theme}
              disabled={isUpdatingSettings}
              onChange={handleThemeChange}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Language">
          <SettingsRow title="App language">
            <SegmentedSetting
              accessibilityLabel="Language preference"
              options={LANGUAGE_OPTIONS}
              value={settings.language}
              disabled={isUpdatingSettings}
              onChange={(language) => handleUpdateSettings({ language })}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Help & Legal">
          <SettingsRow
            title="Contact support"
            value="Email"
            onPress={() => openExternalLink(`mailto:${SUPPORT_EMAIL}`)}
          />
          <SettingsRow
            title="Privacy policy"
            value="Open"
            onPress={() => openExternalLink(PRIVACY_URL)}
          />
          <SettingsRow
            title="Terms of service"
            value="Open"
            onPress={() => openExternalLink(TERMS_URL)}
          />
        </SettingsSection>

        <SettingsSection title="Session">
          <SettingsRow
            title="Logout"
            description="Sign out of this device"
            destructive
            className="bg-danger-surface"
          >
            <Button
              size="sm"
              variant="destructive"
              onPress={handleLogoutPress}
              loading={loading}
            >
              Logout
            </Button>
          </SettingsRow>
        </SettingsSection>
      </View>
    </ScreenContainer>
  );
}
