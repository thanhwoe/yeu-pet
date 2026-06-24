import { Toast } from "@/components/Toast";
import { Image } from "@/components/ui/Image";
import { Body, Heading } from "@/components/ui/Typography";
import { ISignInForm } from "@/constants/validation";
import { SignInForm } from "@/features/auth/components/SignInForm";
import { syncRevenueCatForUser } from "@/features/subscriptions/cache";
import { signInMutation } from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import { startPushRegistrationSessionAsync } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Keyboard, StyleSheet, View } from "react-native";

export default function LoginScreen() {
  const { updateUser, updateTokens } = useUserInfoStore();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: signInMutation,
    onSuccess: async (res) => {
      updateTokens({
        refreshToken: res.refreshToken,
        accessToken: res.accessToken,
      });
      updateUser(res.user);

      void syncRevenueCatForUser(queryClient, res.user.id).catch((error) =>
        console.warn("[RevenueCat] Post-login sync failed.", error),
      );
      await startPushRegistrationSessionAsync();
      Toast.success({ text: "Signed in." });
    },
    onError: (e) => {
      Toast.error({ text: e.message });
    },
  });

  const handleLogin = async (data: ISignInForm) => {
    mutate(data);
  };

  return (
    <View
      onStartShouldSetResponder={() => {
        Keyboard.dismiss();
        return true;
      }}
      className="flex-1 px-16 bg-white pt-safe-offset-40 justify-between"
    >
      <View style={StyleSheet.absoluteFill}>
        <Image
          contentFit="contain"
          style={{
            height: "50%",
          }}
          source={require("@/assets/images/sneaky-cat.png")}
        />
      </View>

      <View className="flex-1 justify-center">
        <View className="gap-16 mb-20">
          <Heading variant="h2">Hi, Welcome back! 👋</Heading>
          <Heading variant="h5">Sign in to your account</Heading>
        </View>
        <SignInForm onSubmit={handleLogin} isSubmitting={isPending} />
        <View className="flex-row mt-10 justify-center items-center">
          <Body>Don&apos;t have an account? </Body>
          <Link href="/register" replace>
            <Body className="text-text-link">Sign Up</Body>
          </Link>
        </View>
      </View>
    </View>
  );
}
