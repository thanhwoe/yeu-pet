import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import { StyleSheet, View } from "react-native";

const ExpoImage = cssInterop(Image, {
  className: {
    target: "style",
  },
});

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 p-5 bg-white">
      <LinearGradient
        colors={["#FF7D29", "#FFF"]}
        style={StyleSheet.absoluteFill}
      />
      <View className="mt-safe-offset-4">
        <ExpoImage
          cachePolicy="disk"
          contentFit="cover"
          className="h-96"
          source={require("../../assets/images/orange-cat.png")}
        />
      </View>

      <View className="flex-1 justify-between">
        <View className="gap-3">
          <Text variant="largeTitle" className="font-bold text-center">
            Welcome to pet care easy app
          </Text>
          <Text className="text-center">
            Simplify pet care with everything your furry friend needs in one
            easy app.
          </Text>
        </View>
        <View className="gap-3 pb-5">
          <Button size="CTA" onPress={() => router.push("/login")}>
            Sign In
          </Button>
          <Button
            size="CTA"
            variant="secondary"
            onPress={() => router.push("/register")}
          >
            Create an Account
          </Button>
        </View>
      </View>
    </View>
  );
}
