import { BackHeader } from "@/components/Headers/BackHeader";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function Layout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: BackHeader,
          title: t("medicalRecords.routes.index"),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          header: BackHeader,
          title: t("medicalRecords.routes.detail"),
        }}
      />
      <Stack.Screen
        name="pet/[petId]"
        options={{
          header: BackHeader,
          title: t("medicalRecords.routes.petRecords"),
        }}
      />
    </Stack>
  );
}
