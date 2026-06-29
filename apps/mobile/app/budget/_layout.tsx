import { BackHeader } from "@/components/Headers/BackHeader";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function BudgetLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ header: BackHeader, title: t("budget.routes.statistics") }}
      />
      <Stack.Screen
        name="categories"
        options={{ header: BackHeader, title: t("budget.routes.categories") }}
      />
      <Stack.Screen
        name="transactions"
        options={{ header: BackHeader, title: t("budget.routes.transactions") }}
      />
    </Stack>
  );
}
