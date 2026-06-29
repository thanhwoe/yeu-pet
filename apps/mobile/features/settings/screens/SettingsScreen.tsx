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
import { usePremiumPaywall } from "@/features/subscriptions/usePremiumPaywall";
import { getPlanPeriodCopy } from "@/features/subscriptions/utils";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useLogout } from "@/hooks/useLogout";
import {
  LANGUAGE_OPTIONS,
  changeAppLanguage,
  normalizeLanguage,
  type SupportedLanguage,
} from "@/i18n";
import { IUserSettingsForm, SubscriptionEntitlements } from "@/interfaces";
import {
  getEntitlementsQuery,
  getUserSettingsQuery,
  updateUserSettingsMutation,
} from "@/services";
import { useUserInfoStore } from "@/stores";
import { getApiErrorToast } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { CaretRightIcon } from "phosphor-react-native";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Linking, Pressable, View } from "react-native";

const CaretRight = withIconClassName(CaretRightIcon);

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
  email,
  phone,
  avatarUrl,
  editLabel,
  onEdit,
}: {
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string | null;
  editLabel: string;
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
          {phone}
        </Text>
        {email && (
          <Text
            variant="footnote"
            className="text-text-muted"
            numberOfLines={1}
          >
            {email}
          </Text>
        )}
      </View>
      <Button size="sm" variant="outline" onPress={onEdit}>
        {editLabel}
      </Button>
    </View>
  );
}

function SubscriptionSummary({
  entitlements,
  loading,
  error,
  managing,
  upgrading,
  onManage,
  onOpen,
  onRetry,
  onUpgrade,
}: {
  entitlements?: SubscriptionEntitlements;
  loading: boolean;
  error: boolean;
  managing: boolean;
  upgrading: boolean;
  onManage: () => void;
  onOpen: () => void;
  onRetry: () => void;
  onUpgrade: () => void;
}) {
  const { t } = useTranslation();

  if (loading && !entitlements) {
    return (
      <SettingsRow
        title={t("settings.subscription.loadingTitle")}
        description={t("settings.subscription.loadingDescription")}
        loading
      />
    );
  }

  if (error && !entitlements) {
    return (
      <SettingsRow
        title={t("settings.subscription.unavailableTitle")}
        description={t("settings.subscription.unavailableDescription")}
      >
        <Button size="sm" variant="outline" onPress={onRetry}>
          {t("common.retry")}
        </Button>
      </SettingsRow>
    );
  }

  if (!entitlements) {
    return (
      <SettingsRow
        title={t("settings.subscription.unavailableTitle")}
        description={t("settings.subscription.unavailableDescription")}
      />
    );
  }

  const isPremium = entitlements.tier === "premium";
  const planLabel = isPremium ? t("common.premium") : t("common.free");

  return (
    <View className="gap-12 border-b border-line-subtle px-16 py-14 ">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("settings.subscription.viewPlanUsage", {
          plan: planLabel,
        })}
        className="min-h-44 flex-row items-center gap-12"
        onPress={onOpen}
      >
        <View className="flex-1 gap-2">
          <Text variant="body2" className="font-semibold">
            {t("settings.subscription.plan", { plan: planLabel })}
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
            {t("settings.subscription.usage")}
          </Button>
          <Button
            size="sm"
            wrapperClassName="flex-1"
            loading={upgrading}
            onPress={onUpgrade}
          >
            {t("settings.subscription.upgrade")}
          </Button>
        </View>
      ) : (
        <Button
          size="sm"
          variant="outline"
          loading={managing}
          onPress={onManage}
        >
          {t("settings.subscription.manage")}
        </Button>
      )}
    </View>
  );
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const { loading, logout } = useLogout();
  const { setColorScheme } = useColorScheme();
  const user = useUserInfoStore.use.user();
  const queryClient = useQueryClient();
  const { isManaging, isPresenting, presentCustomerCenter, presentPaywall } =
    usePremiumPaywall();
  const {
    data: settings,
    isError: isSettingsError,
    isLoading: isLoadingSettings,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: SETTINGS_KEY.detail(),
    queryFn: getUserSettingsQuery,
  });
  const themeOptions = useMemo(
    () =>
      [
        { label: t("settings.appearance.system"), value: "system" },
        { label: t("settings.appearance.light"), value: "light" },
        { label: t("settings.appearance.dark"), value: "dark" },
      ] as const,
    [t],
  );
  const languageOptions = useMemo(
    () =>
      LANGUAGE_OPTIONS.map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      })),
    [t],
  );
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
    });

  const showSettingsSaveError = useCallback((error: unknown) => {
    Toast.error(
      getApiErrorToast(error, {
        textKey: "settings.saveError.text",
        titleKey: "settings.saveError.title",
      }),
    );
  }, []);

  const handleUpdateSettings = useCallback(
    async (params: IUserSettingsForm) => {
      try {
        await updateSettings(params);
      } catch (error) {
        showSettingsSaveError(error);
        throw error;
      }
    },
    [showSettingsSaveError, updateSettings],
  );

  const handleThemeChange = useCallback(
    async (theme: "system" | "light" | "dark") => {
      const previousTheme = settings?.theme ?? "system";

      setColorScheme(theme);
      try {
        await handleUpdateSettings({ theme });
      } catch {
        setColorScheme(previousTheme);
      }
    },
    [handleUpdateSettings, setColorScheme, settings?.theme],
  );

  const handleLanguageChange = useCallback(
    async (language: SupportedLanguage) => {
      if (!settings || settings.language === language) {
        return;
      }

      const previousLanguage = normalizeLanguage(settings.language);

      queryClient.setQueryData(SETTINGS_KEY.detail(), {
        ...settings,
        language,
      });
      await changeAppLanguage(language);

      try {
        await updateSettings({ language });
        Toast.success({
          title: t("settings.language.updatedTitle"),
          text: t("settings.language.updatedText"),
        });
      } catch (error) {
        queryClient.setQueryData(SETTINGS_KEY.detail(), {
          ...settings,
          language: previousLanguage,
        });
        await changeAppLanguage(previousLanguage);
        Toast.error(
          getApiErrorToast(error, {
            textKey: "settings.language.updateFailedText",
            titleKey: "settings.language.updateFailedTitle",
          }),
        );
      }
    },
    [queryClient, settings, t, updateSettings],
  );

  const openExternalLink = useCallback(
    async (url: string) => {
      try {
        await Linking.openURL(url);
      } catch {
        Toast.error({
          title: t("settings.helpLegal.linkFailedTitle"),
          text: t("settings.helpLegal.linkFailedText"),
        });
      }
    },
    [t],
  );

  const openSubscription = useCallback(() => {
    router.push("/subscription");
  }, []);

  const handleLogoutPress = useCallback(() => {
    Alert.alert(
      t("settings.session.logoutTitle"),
      t("settings.session.logoutDescription"),
      [
        { text: t("settings.session.staySignedIn"), style: "cancel" },
        {
          text: t("settings.session.logoutButton"),
          style: "destructive",
          onPress: logout,
        },
      ],
    );
  }, [logout, t]);

  if (isLoadingSettings) {
    return (
      <ScreenContainer>
        <StateView
          variant="loading"
          title={t("settings.loading.title")}
          description={t("settings.loading.description")}
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
          title={t("settings.loadError.title")}
          description={t("settings.loadError.description")}
          actionLabel={t("common.tryAgain")}
          onAction={() => refetchSettings()}
          className="flex-1"
        />
      </ScreenContainer>
    );
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const displayName = fullName || t("settings.profile.owner");
  const contact = user?.phone || t("common.accountSynced");

  return (
    <ScreenContainer
      scrollEnabled
      className="bg-background"
      stickyHeaderIndices={[0]}
    >
      <View className="bg-background px-20 pb-10 pt-safe-offset-16">
        <View className="border-b border-line-subtle pb-10">
          <Text variant="largeTitle" className="font-bold">
            {t("settings.title")}
          </Text>
        </View>
      </View>

      <View className="gap-22 px-20 pb-120">
        <ProfileCard
          name={displayName}
          phone={contact}
          email={user?.email ?? undefined}
          avatarUrl={user?.avatarUrl}
          editLabel={t("settings.profile.edit")}
          onEdit={() => router.push("/profile")}
        />

        <SettingsSection title={t("settings.subscription.section")}>
          <SubscriptionSummary
            entitlements={entitlements}
            loading={isLoadingEntitlements}
            error={isEntitlementsError}
            managing={isManaging}
            upgrading={isPresenting}
            onManage={() => void presentCustomerCenter()}
            onOpen={openSubscription}
            onRetry={() => void refetchEntitlements()}
            onUpgrade={() => void presentPaywall()}
          />
        </SettingsSection>

        <SettingsSection title={t("settings.notifications.section")}>
          <SettingsRow
            title={t("settings.notifications.row")}
            onPress={() => router.push("/notification-settings")}
            accessibilityLabel={t("settings.notifications.accessibilityLabel")}
          >
            <CaretRight size={20} className="text-icon-secondary" />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title={t("settings.appearance.section")}>
          <SettingsRow title={t("settings.appearance.theme")}>
            <SegmentedSetting
              accessibilityLabel={t("settings.appearance.accessibilityLabel")}
              options={themeOptions}
              value={settings.theme}
              disabled={isUpdatingSettings}
              onChange={handleThemeChange}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title={t("settings.language.section")}>
          <SettingsRow title={t("settings.language.appLanguage")}>
            <SegmentedSetting
              accessibilityLabel={t("settings.language.accessibilityLabel")}
              options={languageOptions}
              value={settings.language}
              disabled={isUpdatingSettings}
              onChange={handleLanguageChange}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title={t("settings.helpLegal.section")}>
          <SettingsRow
            title={t("settings.helpLegal.contactSupport")}
            value={t("common.email")}
            onPress={() => openExternalLink(`mailto:${SUPPORT_EMAIL}`)}
          />
          <SettingsRow
            title={t("settings.helpLegal.privacyPolicy")}
            value={t("common.open")}
            onPress={() => openExternalLink(PRIVACY_URL)}
          />
          <SettingsRow
            title={t("settings.helpLegal.termsOfService")}
            value={t("common.open")}
            onPress={() => openExternalLink(TERMS_URL)}
          />
        </SettingsSection>

        <SettingsSection title={t("settings.session.section")}>
          <SettingsRow
            title={t("settings.session.logout")}
            description={t("settings.session.description")}
            destructive
            className="bg-danger-surface"
          >
            <Button
              size="sm"
              variant="destructive"
              onPress={handleLogoutPress}
              loading={loading}
            >
              {t("settings.session.logout")}
            </Button>
          </SettingsRow>
        </SettingsSection>
      </View>
    </ScreenContainer>
  );
}
