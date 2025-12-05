import { SignInForm } from "@/components/SignInForm";
import { Toast } from "@/components/Toast";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { ISignInForm } from "@/constants/validation";
import { signInMutation } from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import { useMutation } from "@tanstack/react-query";
import { Link } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function LoginScreen() {
  const { updateUserInfo } = useUserInfoStore();
  const { mutate } = useMutation({
    mutationFn: signInMutation,
    onSuccess: (res) => {
      Toast.success({ text: "Sign in successfully" });
      updateUserInfo(res.data);
    },
    onError: (e) => {
      Toast.error({ text: e.errors?.[0].message });
    },
  });
  const handleLogin = async (data: ISignInForm) => {
    mutate(data);
  };

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <View className="absolute right-0 w-72 top-10">
        <Image
          contentFit="contain"
          className="h-72"
          source={require("@/assets/images/sneaky-cat.png")}
        />
      </View>

      <View className="mb-20">
        <Text variant="title1">Hi, Welcome back! 👋</Text>
        <Text variant="title3" className=" text-gray-500">
          Sign in to your account
        </Text>
      </View>

      <SignInForm onSubmit={handleLogin} />

      <View className="flex-row mt-10 justify-center items-center">
        <Text>Don&apos;t have an account? </Text>
        <Link href="/register">
          <Text className="text-text-link">Sign Up</Text>
        </Link>
      </View>
    </View>
  );
}
