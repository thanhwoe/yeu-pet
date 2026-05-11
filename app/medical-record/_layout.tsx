import { BackHeader } from "@/components/Headers/BackHeader";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          header: BackHeader,
          title: "Medical Record",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          header: BackHeader,
          title: `Medical Record Detail`,
        }}
      />
    </Stack>
  );
}
