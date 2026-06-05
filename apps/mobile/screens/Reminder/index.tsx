import { ReminderCalendar } from "@/features/reminders/components/ReminderCalendar";
import { View } from "react-native";

export function ReminderScreen() {
  return (
    <View className="flex-1 pt-20 bg-background">
      <ReminderCalendar />
    </View>
  );
}
