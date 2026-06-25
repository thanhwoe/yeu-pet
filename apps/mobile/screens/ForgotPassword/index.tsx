import { Toast } from "@/components/Toast";
import { Image } from "@/components/ui/Image";
import { Body, Heading } from "@/components/ui/Typography";
import { IForgotPasswordForm } from "@/constants/validation";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { requestResetPasswordMutation } from "@/services";
import { useUserInfoStore } from "@/stores";
import { getApiErrorToast } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link, useRouter } from "expo-router";
import { Keyboard, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

export const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const updateOtpExpire = useUserInfoStore.use.updateOtpExpire();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: requestResetPasswordMutation,
    onError(e) {
      Toast.error(
        getApiErrorToast(e, {
          textKey: "auth.toast.resetCodeNotSentText",
          titleKey: "auth.toast.resetCodeNotSentTitle",
        }),
      );
    },
    onSuccess(res) {
      updateOtpExpire(dayjs(res.expiresAt).toDate());
      router.replace({
        pathname: "/reset-password/[phone]",
        params: {
          phone: res.phone,
        },
      });
    },
  });

  const handleSubmit = async (data: IForgotPasswordForm) => {
    mutateAsync(data.phone);
  };
  return (
    <View
      onStartShouldSetResponder={() => {
        Keyboard.dismiss();
        return true;
      }}
      className="flex-1 px-16 bg-white justify-between"
    >
      <View style={StyleSheet.absoluteFill}>
        <Image
          contentFit="cover"
          style={{
            height: "40%",
          }}
          source={require("@/assets/images/butterflies.png")}
        />
      </View>

      <View className="flex-1 justify-center">
        <View className="gap-16 mb-50">
          <Heading variant="h2">{t("auth.forgot.title")}</Heading>
          <Body className="text-text-tertiary-inverse">
            {t("auth.forgot.description")}
          </Body>
        </View>
        <ForgotPasswordForm onSubmit={handleSubmit} isSubmitting={isPending} />
        <View className="flex-row mt-10 justify-center items-center">
          <Body>{t("auth.forgot.rememberPassword")} </Body>
          <Link href="/login" replace>
            <Body className="text-text-link">{t("auth.common.signIn")}</Body>
          </Link>
        </View>
      </View>
    </View>
  );
};
