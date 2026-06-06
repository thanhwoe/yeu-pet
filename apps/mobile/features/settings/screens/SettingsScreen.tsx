import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StateView } from "@/components/ui/StateView";
import { Text } from "@/components/ui/Text";
import { Toast } from "@/components/Toast";
import {
  SETTINGS_KEY,
  SUBSCRIPTION_KEY,
  USER_KEY,
} from "@/constants/query-keys";
import { IProfileForm } from "@/constants/validation";
import { ProfileForm } from "@/features/settings/components/ProfileForm";
import { SegmentedSetting } from "@/features/settings/components/SegmentedSetting";
import { SettingsRow } from "@/features/settings/components/SettingsRow";
import { SettingsSection } from "@/features/settings/components/SettingsSection";
import { SettingToggle } from "@/features/settings/components/SettingToggle";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useLogout } from "@/hooks/useLogout";
import { IUserSettingsForm } from "@/interfaces";
import {
  getEntitlementsQuery,
  getUserSettingsQuery,
  mockDowngradeSubscriptionMutation,
  mockUpgradeSubscriptionMutation,
  updateUserProfileMutation,
  updateUserSettingsMutation,
} from "@/services";
import { useUserInfoStore } from "@/stores";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Linking, View } from "react-native";

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

export function SettingsScreen() {
  const { loading, logout } = useLogout();
  const { setColorScheme } = useColorScheme();
  const user = useUserInfoStore.use.user();
  const updateUser = useUserInfoStore.use.updateUser();
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const queryClient = useQueryClient();
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

  const invalidateSubscription = () => {
    queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEY.all });
  };

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

  const { mutate: mockUpgrade, isPending: isUpgrading } = useMutation({
    mutationFn: mockUpgradeSubscriptionMutation,
    onSuccess: invalidateSubscription,
  });
  const { mutate: mockDowngrade, isPending: isDowngrading } = useMutation({
    mutationFn: mockDowngradeSubscriptionMutation,
    onSuccess: invalidateSubscription,
  });
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: updateUserProfileMutation,
      onSuccess: (updatedUser) => {
        updateUser(updatedUser);
        queryClient.setQueryData(USER_KEY.detail(updatedUser.id), updatedUser);
        setIsProfileFormOpen(false);
      },
      onError: (error: Error) => {
        Toast.error({
          text: error.message || "Could not update profile. Please try again.",
        });
      },
    });

  const handleUpdateSettings = useCallback(
    async (params: IUserSettingsForm) => {
      await updateSettings(params);
    },
    [updateSettings],
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

  const handleProfileSubmit = useCallback(
    async (data: IProfileForm) => {
      await updateProfile(data);
    },
    [updateProfile],
  );

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
  const planLabel = entitlements?.tier === "premium" ? "Premium" : "Free";
  const planUsage = entitlements
    ? `${entitlements.usage.pets}/${entitlements.limits.maxPets} pets · ${entitlements.usage.aiMessagesThisMonth}/${entitlements.limits.aiMessagesPerMonth} AI messages`
    : isLoadingEntitlements
      ? "Loading plan..."
      : "Plan details unavailable";

  return (
    <ScreenContainer scrollEnabled className="px-20 pt-safe-offset-16">
      <View className="gap-20 pb-32">
        <View className="gap-6">
          <Text variant="largeTitle" className="font-bold">
            Settings
          </Text>
          <Text variant="body2" color="secondary">
            Manage your account, care reminders, and app preferences.
          </Text>
        </View>

        <View className="gap-3 rounded-24 bg-background-card p-16">
          <Text variant="body2" color="secondary">
            Signed in as
          </Text>
          <Text variant="title3" className="font-bold">
            {fullName || "YeuPet owner"}
          </Text>
          <Text variant="body2" color="secondary">
            {user?.email || user?.phone || "Account details are synced."}
          </Text>
        </View>

        <SettingsSection
          title="Account"
          description="Keep your owner profile up to date."
        >
          <SettingsRow
            title="Profile"
            description="Update your display name and contact email."
            value="Edit"
            onPress={() => setIsProfileFormOpen(true)}
          />
        </SettingsSection>

        <SettingsSection
          title="Subscription"
          description="Your current plan and care limits."
        >
          <SettingsRow
            title={`${planLabel} plan`}
            description={planUsage}
            loading={isLoadingEntitlements}
          />
          {isEntitlementsError ? (
            <SettingsRow
              title="Plan details could not refresh"
              description="Try again to update your subscription status."
            >
              <Button
                size="sm"
                variant="outline"
                onPress={() => refetchEntitlements()}
              >
                Retry
              </Button>
            </SettingsRow>
          ) : null}
          <View className="flex-row gap-10 border-b border-line-secondary px-16 py-14">
            <Button
              size="sm"
              variant="secondary"
              loading={isUpgrading}
              onPress={() => mockUpgrade()}
            >
              Mock Upgrade
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={isDowngrading}
              onPress={() => mockDowngrade()}
            >
              Mock Downgrade
            </Button>
          </View>
        </SettingsSection>

        <SettingsSection
          title="Notifications"
          description="Choose which pet-care updates can reach you."
        >
          <SettingsRow
            title="Push notifications"
            description="Master switch for reminders, bookings, social, and AI updates."
            loading={isUpdatingSettings}
          >
            <SettingToggle
              label="Push notifications"
              value={settings.notificationEnable}
              disabled={isUpdatingSettings}
              onChange={(notificationEnable) =>
                handleUpdateSettings({ notificationEnable })
              }
            />
          </SettingsRow>
          <SettingsRow
            title="Care reminders"
            description="Vaccines, medicine, grooming, and daily care."
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
            description="Requests, status changes, and messages."
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
            title="Photos social"
            description="Comments, replies, and social activity."
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
            description="Conversation updates and monthly usage notices."
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

        <SettingsSection
          title="Appearance"
          description="Keep the app comfortable in any light."
        >
          <SettingsRow
            title="Theme"
            description="Follow your device, light mode, or dark mode."
          >
            <SegmentedSetting
              accessibilityLabel="Theme preference"
              options={THEME_OPTIONS}
              value={settings.theme}
              disabled={isUpdatingSettings}
              onChange={handleThemeChange}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection
          title="Language"
          description="Choose the app language."
        >
          <SettingsRow
            title="App language"
            description="Vietnamese and English are supported."
          >
            <SegmentedSetting
              accessibilityLabel="Language preference"
              options={LANGUAGE_OPTIONS}
              value={settings.language}
              disabled={isUpdatingSettings}
              onChange={(language) => handleUpdateSettings({ language })}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection
          title="Help and legal"
          description="Get support and review YeuPet policies."
        >
          <SettingsRow
            title="Contact support"
            description="Email us when you need help with your pets, bookings, or account."
            value="Email"
            onPress={() => openExternalLink(`mailto:${SUPPORT_EMAIL}`)}
          />
          <SettingsRow
            title="Privacy policy"
            description="How YeuPet protects your account and pet-care data."
            value="Open"
            onPress={() => openExternalLink(PRIVACY_URL)}
          />
          <SettingsRow
            title="Terms of service"
            description="Rules for using YeuPet features and services."
            value="Open"
            onPress={() => openExternalLink(TERMS_URL)}
          />
        </SettingsSection>

        <SettingsSection title="Session">
          <SettingsRow
            title="Logout"
            description="Sign out on this device and clear local session data."
            destructive
          >
            <Button
              size="sm"
              variant="destructive"
              onPress={logout}
              loading={loading}
            >
              Logout
            </Button>
          </SettingsRow>
        </SettingsSection>
      </View>

      {user ? (
        <BottomSheet
          visible={isProfileFormOpen}
          titleElement={<Text className="font-semibold">Edit profile</Text>}
          onDismiss={() => setIsProfileFormOpen(false)}
        >
          <ProfileForm
            defaultValues={{
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email ?? undefined,
            }}
            isSubmitting={isUpdatingProfile}
            onSubmit={handleProfileSubmit}
          />
        </BottomSheet>
      ) : null}
    </ScreenContainer>
  );
}
