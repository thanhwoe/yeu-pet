import { InputController } from "@/components/InputController";
import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { SUBSCRIPTION_KEY } from "@/constants/query-keys";
import { usePremiumPaywall } from "@/features/subscriptions/usePremiumPaywall";
import { withIconClassName } from "@/hocs/withIconClassName";
import {
  deleteAccountMutation,
  getEntitlementsQuery,
  resetRevenueCatUser,
} from "@/services";
import { useUserInfoStore } from "@/stores";
import { getApiErrorToast } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ArrowLeftIcon,
  TrashIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { z } from "zod/v4";

const ArrowLeft = withIconClassName(ArrowLeftIcon);
const Trash = withIconClassName(TrashIcon);
const WarningCircle = withIconClassName(WarningCircleIcon);

type DeleteAccountInput = {
  password: string;
};

type DeleteAccountForm = DeleteAccountInput;

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "grace_period",
]);
const ANDROID_SCROLL_DELAY_MS = 80;

export function DeleteAccountScreen() {
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0);
  const queryClient = useQueryClient();
  const logout = useUserInfoStore.use.logout();
  const { isManaging, presentCustomerCenter } = usePremiumPaywall();
  const deleteAccountSchema = useMemo(
    () =>
      z.object({
        password: z
          .string()
          .min(8, t("settings.accountDeletion.validation.password")),
      }),
    [t],
  );

  const { control, handleSubmit, watch } = useForm<
    DeleteAccountInput,
    unknown,
    DeleteAccountForm
  >({
    resolver: zodResolver(deleteAccountSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      password: "",
    },
  });
  const password = watch("password");
  const canSubmit = password.length >= 8;

  const { data: entitlements } = useQuery({
    queryKey: SUBSCRIPTION_KEY.entitlements(),
    queryFn: getEntitlementsQuery,
  });
  const hasActiveSubscription =
    entitlements?.tier === "premium" ||
    Boolean(
      entitlements?.status &&
      ACTIVE_SUBSCRIPTION_STATUSES.has(entitlements.status),
    );

  const { mutateAsync: deleteAccount, isPending } = useMutation({
    mutationFn: deleteAccountMutation,
  });

  const scrollToPasswordConfirm = useCallback(() => {
    if (Platform.OS !== "android") {
      return;
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, ANDROID_SCROLL_DELAY_MS);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setAndroidKeyboardHeight(event.endCoordinates.height);
        scrollToPasswordConfirm();
      },
    );
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setAndroidKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [scrollToPasswordConfirm]);

  const completeLocalSignOut = useCallback(async () => {
    await resetRevenueCatUser();
    queryClient.clear();
    logout();
    router.replace("/login");
  }, [logout, queryClient]);

  const submitDeletion = useCallback(
    async (values: DeleteAccountForm) => {
      try {
        await deleteAccount({ password: values.password });
        Toast.success({
          title: t("settings.accountDeletion.toast.successTitle"),
          text: t("settings.accountDeletion.toast.successText"),
        });
        await completeLocalSignOut();
      } catch (error) {
        Toast.error(
          getApiErrorToast(error, {
            titleKey: "settings.accountDeletion.toast.errorTitle",
            textKey: "settings.accountDeletion.toast.errorText",
          }),
        );
      }
    },
    [completeLocalSignOut, deleteAccount, t],
  );

  const confirmDeletion = useCallback(
    (values: DeleteAccountForm) => {
      Alert.alert(
        t("settings.accountDeletion.finalConfirm.title"),
        t("settings.accountDeletion.finalConfirm.description"),
        [
          {
            text: t("settings.accountDeletion.finalConfirm.cancel"),
            style: "cancel",
          },
          {
            text: t("settings.accountDeletion.finalConfirm.delete"),
            style: "destructive",
            onPress: () => {
              void submitDeletion(values);
            },
          },
        ],
      );
    },
    [submitDeletion, t],
  );

  const consequences = useMemo(
    () => [
      t("settings.accountDeletion.consequences.profile"),
      t("settings.accountDeletion.consequences.care"),
      t("settings.accountDeletion.consequences.social"),
      t("settings.accountDeletion.consequences.session"),
      t("settings.accountDeletion.consequences.retention"),
    ],
    [t],
  );
  const androidContentContainerStyle =
    Platform.OS === "android" && androidKeyboardHeight > 0
      ? [
          styles.androidKeyboardContent,
          {
            paddingBottom: androidKeyboardHeight,
          },
        ]
      : undefined;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 bg-background"
        contentContainerClassName="pb-safe"
        contentContainerStyle={androidContentContainerStyle}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-22 px-20 pb-120 pt-safe-offset-14">
          <View className="flex-row items-center gap-12">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("common.accessibility.goBack")}
              onPress={() => router.back()}
              className="h-44 w-44 items-center justify-center rounded-full bg-background-surface"
            >
              <ArrowLeft size={22} className="text-icon-primary" />
            </Pressable>
          </View>

          <View className="items-center gap-10">
            <View className="h-52 w-52 items-center justify-center rounded-full bg-status-danger-surface">
              <Trash size={26} className="text-status-danger-text" />
            </View>
            <Text variant="largeTitle" className="font-bold">
              {t("settings.accountDeletion.title")}
            </Text>
            <Text variant="body2" className="text-text-muted">
              {t("settings.accountDeletion.description")}
            </Text>
          </View>

          <View className="gap-12 rounded-24 border-hairline border-line-subtle bg-background-surface px-16 py-16">
            <Text variant="body2" className="font-semibold">
              {t("settings.accountDeletion.deletedDataTitle")}
            </Text>
            <View className="gap-10">
              {consequences.map((item) => (
                <View key={item} className="flex-row gap-10">
                  <View className="mt-8 h-6 w-6 rounded-full bg-danger-text" />
                  <Text variant="footnote" className="flex-1 text-text-muted">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          {hasActiveSubscription ? (
            <View className="gap-12 rounded-24 border-hairline border-status-danger-border bg-status-danger-surface px-16 py-16">
              <View className="flex-row gap-10">
                <WarningCircle
                  size={22}
                  weight="fill"
                  className="text-status-danger-text"
                />
                <View className="flex-1 gap-4">
                  <Text
                    variant="body2"
                    className="font-semibold text-status-danger-text"
                  >
                    {t("settings.accountDeletion.subscription.title")}
                  </Text>
                  <Text variant="footnote" className="text-status-danger-text">
                    {t("settings.accountDeletion.subscription.description")}
                  </Text>
                </View>
              </View>

              <Button
                variant="outline"
                size="sm"
                loading={isManaging}
                onPress={() => void presentCustomerCenter()}
              >
                {t("settings.accountDeletion.subscription.manage")}
              </Button>
            </View>
          ) : null}

          <View className="gap-14 rounded-24 border-hairline border-line-subtle bg-background-surface px-16 py-16">
            <InputController<DeleteAccountInput, DeleteAccountForm>
              control={control}
              name="password"
              label={t("settings.accountDeletion.form.sectionTitle")}
              placeholder={t(
                "settings.accountDeletion.form.passwordPlaceholder",
              )}
              onFocus={scrollToPasswordConfirm}
              secureTextEntry
              textContentType="password"
            />
          </View>

          <Button
            variant="destructive"
            loading={isPending}
            disabled={!canSubmit}
            onPress={handleSubmit(confirmDeletion)}
          >
            {t("settings.accountDeletion.form.submit")}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  androidKeyboardContent: {
    flexGrow: 1,
  },
});
