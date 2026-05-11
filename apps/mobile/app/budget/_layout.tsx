import { BackHeader } from "@/components/Headers/BackHeader";
import { Stack } from "expo-router";

export default function BudgetLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ header: BackHeader, title: "Budget statistics" }}
      />
      <Stack.Screen
        name="categories"
        options={{ header: BackHeader, title: "My categories" }}
      />
      <Stack.Screen
        name="transactions"
        options={{ header: BackHeader, title: "Spent Transactions" }}
      />
    </Stack>
  );
}
