import { SignUpForm } from "@/components/SignUpForm";
import { Text } from "@/components/ui/Text";
import { ISignUpForm } from "@/constants/validation";
import { signUpMutation } from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import { useMutation } from "@tanstack/react-query";
import { Link } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function RegisterScreen() {
  const { updateUserInfo } = useUserInfoStore();

  const { mutate } = useMutation({
    mutationFn: signUpMutation,
    onSuccess: (res) => {
      updateUserInfo(res.data);
    },
    onError: () => {},
  });
  const handleLogin = async (data: ISignUpForm) => {
    mutate(data);
  };

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <View className="mb-20">
        <Text variant="title1">Create an account</Text>
        <Text variant="title3" className=" text-gray-500">
          Welcome to smatter pet care
        </Text>
      </View>

      <SignUpForm onSubmit={handleLogin} />

      <View className="flex-row mt-10 justify-center items-center">
        <Text>Already have an account? </Text>
        <Link href="/login">
          <Text className="text-text-link">Sign In</Text>
        </Link>
      </View>
    </View>
  );
}
