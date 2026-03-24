import { ReminderHeader } from "@/components/Headers/ReminderHeader";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ header: ReminderHeader }} />
    </Stack>
  );
}
