import { Toast } from "@/components/Toast";
import { Image } from "@/components/ui/Image";
import { Body, Heading } from "@/components/ui/Typography";
import { IForgotPasswordForm } from "@/constants/validation";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { requestResetPasswordMutation } from "@/services";
import { useUserInfoStore } from "@/stores";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link, useRouter } from "expo-router";
import { Keyboard, StyleSheet, View } from "react-native";

export const ForgotPasswordScreen = () => {
  const router = useRouter();
  const updateOtpExpire = useUserInfoStore.use.updateOtpExpire();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: requestResetPasswordMutation,
    onError(e) {
      Toast.error({
        title: "Reset code not sent",
        text: e.message || "Check your phone number and try again.",
      });
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
          <Heading variant="h2">Forgot Password ?</Heading>
          <Body className="text-text-tertiary-inverse">
            Don&apos;t worry! It happens. Please enter the phone number
            associated with your account.
          </Body>
        </View>
        <ForgotPasswordForm onSubmit={handleSubmit} isSubmitting={isPending} />
        <View className="flex-row mt-10 justify-center items-center">
          <Body>Remember password ? </Body>
          <Link href="/login" replace>
            <Body className="text-text-link">Sign In</Body>
          </Link>
        </View>
      </View>
    </View>
  );
};
