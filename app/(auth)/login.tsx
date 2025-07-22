import { SignInForm } from "@/components/SignInForm";
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
      updateUserInfo(res.data);
    },
    onError: (e) => {
      console.log({ e });
    },
  });
  const handleLogin = async (data: ISignInForm) => {
    mutate(data);
  };

  return (
    <View className="flex-1 justify-center p-5 bg-white">
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
          <Text className="text-orange-400">Sign Up</Text>
        </Link>
      </View>
    </View>
  );
}
