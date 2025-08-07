import { BackHeader } from "@/components/Headers/BackHeader";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="list-clinic"
        options={{
          header: BackHeader,
          title: "List Clinic",
        }}
      />
    </Stack>
  );
}
