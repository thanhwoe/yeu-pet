import { SignUpForm } from "@/components/SignUpForm";
import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function RegisterScreen() {
  const handleLogin = async () => {};

  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <View className="mb-20">
        <Text className="text-3xl">Create an account</Text>
        <Text className="text-lg text-gray-500">
          Welcome to smatter pet care
        </Text>
      </View>

      <SignUpForm onSubmit={handleLogin} />

      <View className="flex-row mt-10 justify-center">
        <Text>Already have an account? </Text>
        <Link href="/login" className="text-purple-400 font-semibold">
          Sign In
        </Link>
      </View>
    </View>
  );
}
