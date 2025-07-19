import { SignInForm } from "@/components/SignInForm";
import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function LoginScreen() {
  const handleLogin = async () => {};

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <View className="mb-20">
        <Text className="text-3xl">Hi, Welcome back! 👋</Text>
        <Text className="text-lg text-gray-500">Sign in to your account</Text>
      </View>

      <SignInForm onSubmit={handleLogin} />

      <View className="flex-row mt-10 justify-center">
        <Text>Don&apos;t have an account? </Text>
        <Link href="/register" className="text-purple-400 font-semibold">
          Sign Up
        </Link>
      </View>
    </View>
  );
}
