import { Toast } from "@/components/Toast";
import { Body, Heading } from "@/components/ui/Typography";
import { ISignUpForm } from "@/constants/validation";
import { SignUpForm } from "@/features/auth/components/SignUpForm";
import { syncRevenueCatForUser } from "@/features/subscriptions/cache";
import { signUpMutation } from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import { getApiErrorToast, startPushRegistrationSessionAsync } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link } from "expo-router";
import React from "react";
import { Keyboard, View } from "react-native";
import { useTranslation } from "react-i18next";

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { updateUser, updateTokens, updateOtpExpire } = useUserInfoStore();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: signUpMutation,
    onSuccess: async (res) => {
      updateTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });
      updateUser(res.user);

      void syncRevenueCatForUser(queryClient, res.user.id).catch((error) =>
        console.warn("[RevenueCat] Post-registration sync failed.", error),
      );
      await startPushRegistrationSessionAsync();
      Toast.success({
        title: t("auth.toast.accountCreatedTitle"),
        text: t("auth.toast.accountCreatedText"),
      });

      const otpExpire = dayjs().add(10, "minute").toDate();
      updateOtpExpire(otpExpire);
    },
    onError: (e) => {
      Toast.error(
        getApiErrorToast(e, {
          textKey: "auth.toast.accountFailedText",
          titleKey: "auth.toast.accountFailedTitle",
        }),
      );
    },
  });
  const handleLogin = async (data: ISignUpForm) => {
    mutate(data);
  };

  return (
    <View
      onStartShouldSetResponder={() => {
        Keyboard.dismiss();
        return true;
      }}
      className="flex-1 px-16 justify-center p-5 bg-white"
    >
      <View className="gap-16 mb-20">
        <Heading variant="h2">{t("auth.register.title")}</Heading>
        <Heading variant="h5">{t("auth.register.subtitle")}</Heading>
      </View>

      <SignUpForm onSubmit={handleLogin} isSubmitting={isPending} />

      <View className="flex-row mt-10 justify-center items-center">
        <Body>{t("auth.register.hasAccount")} </Body>
        <Link href="/login" replace>
          <Body className="text-text-link">{t("auth.common.signIn")}</Body>
        </Link>
      </View>
    </View>
  );
}
