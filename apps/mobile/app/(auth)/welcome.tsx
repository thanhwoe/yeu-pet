import { Button } from "@/components/ui/Button";
import { Image } from "@/components/ui/Image";
import { Heading } from "@/components/ui/Typography";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View className="flex-1 bg-white justify-end">
      <LinearGradient
        colors={["#FF7D29", "#FFF"]}
        style={StyleSheet.absoluteFill}
      >
        <View className="mt-safe-offset-8">
          <Image
            contentFit="cover"
            style={[
              {
                height: "80%",
              },
            ]}
            source={require("@/assets/images/orange-cat.png")}
          />
        </View>
      </LinearGradient>
      <View className="gap-56 px-18">
        <View className="gap-12">
          <Heading variant="h3" weight="bold" center>
            {t("auth.welcome.title")}
          </Heading>
          <Heading variant="h6" center>
            {t("auth.welcome.subtitle")}
          </Heading>
        </View>
        <View className="gap-12 mb-safe-offset-4">
          <Button onPress={() => router.replace("/login")}>
            {t("auth.common.signIn")}
          </Button>
          <Button variant="outline" onPress={() => router.replace("/register")}>
            {t("auth.common.createAccount")}
          </Button>
        </View>
      </View>
    </View>
  );
}
