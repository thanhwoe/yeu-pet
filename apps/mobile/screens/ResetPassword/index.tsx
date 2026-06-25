import { Toast } from "@/components/Toast";
import { Image } from "@/components/ui/Image";
import { Body, Heading } from "@/components/ui/Typography";
import { IResetPasswordForm } from "@/constants/validation";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";
import {
  requestResetPasswordMutation,
  resetPasswordMutation,
} from "@/services";
import { useUserInfoStore } from "@/stores";
import { getApiErrorToast } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Keyboard, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { ResendTimer } from "../VerifyOtp/ResendTimer";

export const ResetPasswordScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const updateOtpExpire = useUserInfoStore.use.updateOtpExpire();

  const { mutateAsync: resendOtp, isPending: resendingOtp } = useMutation({
    mutationFn: requestResetPasswordMutation,
    onError(e) {
      Toast.error(
        getApiErrorToast(e, {
          textKey: "auth.toast.codeNotResentText",
          titleKey: "auth.toast.codeNotResentTitle",
        }),
      );
    },
    onSuccess(res) {
      updateOtpExpire(dayjs(res.expiresAt).toDate());
    },
  });

  const { mutateAsync: resetPassword, isPending: isSubmitting } = useMutation({
    mutationFn: resetPasswordMutation,
    onError(e) {
      Toast.error(
        getApiErrorToast(e, {
          textKey: "auth.toast.passwordNotResetText",
          titleKey: "auth.toast.passwordNotResetTitle",
        }),
      );
    },
    onSuccess() {
      updateOtpExpire(null);
      router.replace("/login");
    },
  });

  const handleSubmit = async (data: IResetPasswordForm) => {
    if (resendingOtp) {
      return;
    }
    resetPassword(data);
  };

  const handleResend = () => {
    if (resendingOtp) {
      return;
    }
    resendOtp(phone);
  };

  return (
    <View
      onStartShouldSetResponder={() => {
        Keyboard.dismiss();
        return true;
      }}
      className="flex-1 px-16  bg-white justify-between"
    >
      <View style={StyleSheet.absoluteFill} className="pt-safe">
        <Image
          contentFit="contain"
          style={{
            height: "30%",
          }}
          source={require("@/assets/images/butterfly-kitten.png")}
        />
      </View>

      <View className="flex-1 justify-center">
        <View className="gap-16 mb-50">
          <Heading variant="h2">{t("auth.reset.title")}</Heading>
          <Body className="text-text-tertiary-inverse">
            {t("auth.reset.description")}
          </Body>
        </View>
        <ResetPasswordForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          phoneNumber={phone}
        >
          <View className="flex-row justify-center items-center mt-8">
            <Body variant="body2" className="text-text-tertiary-inverse">
              {t("auth.reset.didNotReceive")}{" "}
            </Body>
            <ResendTimer onResend={handleResend} />
          </View>
        </ResetPasswordForm>
        <View className="flex-row mt-10 justify-center items-center">
          <Body>{t("auth.reset.rememberPassword")} </Body>
          <Link href="/login" replace>
            <Body className="text-text-link">{t("auth.common.signIn")}</Body>
          </Link>
        </View>
      </View>
    </View>
  );
};
