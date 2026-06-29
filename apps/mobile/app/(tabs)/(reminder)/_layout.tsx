import { ReminderHeader } from "@/components/Headers/ReminderHeader";
import { ReminderFilterDrawer } from "@/features/reminders/components/ReminderFilterDrawer";
import { Drawer } from "expo-router/drawer";
import { useTranslation } from "react-i18next";

export default function Layout() {
  const { t } = useTranslation();

  return (
    <Drawer
      drawerContent={(props) => <ReminderFilterDrawer {...props} />}
      screenOptions={{
        drawerPosition: "right",
        drawerType: "front",
        drawerStyle: { width: "84%" },
        header: (props) => <ReminderHeader {...props} />,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{ title: t("reminders.screen.title") }}
      />
    </Drawer>
  );
}
