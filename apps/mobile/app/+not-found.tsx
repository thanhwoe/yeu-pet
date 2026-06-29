import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { useTranslation } from "react-i18next";

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t("notFound.title") }} />
      <View style={styles.container}>
        <Text>{t("notFound.message")}</Text>
        <Link href="/" style={styles.link}>
          <Text>{t("notFound.action")}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
