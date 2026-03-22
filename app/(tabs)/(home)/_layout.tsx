import { HomeHeader } from "@/components/Headers/HomeHeader";
import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ header: HomeHeader }} />
    </Stack>
  );
}
