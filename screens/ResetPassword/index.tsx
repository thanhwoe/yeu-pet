import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { Toast } from "@/components/Toast";
import { Image } from "@/components/ui/Image";
import { Body, Heading } from "@/components/ui/Typography";
import { IResetPasswordForm } from "@/constants/validation";
import {
  requestResetPasswordMutation,
  resetPasswordMutation,
} from "@/services";
import { useUserInfoStore } from "@/stores";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Keyboard, StyleSheet, View } from "react-native";
import { ResendTimer } from "../VerifyOtp/ResendTimer";

export const ResetPasswordScreen = () => {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const updateOtpExpire = useUserInfoStore.use.updateOtpExpire();

  const { mutateAsync: resendOtp, isPending: resendingOtp } = useMutation({
    mutationFn: requestResetPasswordMutation,
    onError(e) {
      Toast.error({ text: e.message });
    },
    onSuccess(res) {
      updateOtpExpire(dayjs(res.expiresAt).toDate());
    },
  });

  const { mutateAsync: resetPassword, isPending: isSubmitting } = useMutation({
    mutationFn: resetPasswordMutation,
    onError(e) {
      Toast.error({ text: e.message });
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
          <Heading variant="h2">Reset Password</Heading>
          <Body className="text-text-tertiary-inverse">
            Create a strong password to keep your pets safe.
          </Body>
        </View>
        <ResetPasswordForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          phoneNumber={phone}
        >
          <View className="flex-row justify-center items-center mt-8">
            <Body variant="body2" className="text-text-tertiary-inverse">
              Didn&rsquo;t receive the code?{" "}
            </Body>
            <ResendTimer onResend={handleResend} />
          </View>
        </ResetPasswordForm>
        <View className="flex-row mt-10 justify-center items-center">
          <Body>Remember password ?</Body>
          <Link href="/login" replace>
            <Body className="text-text-link">Sign In</Body>
          </Link>
        </View>
      </View>
    </View>
  );
};
