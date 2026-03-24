import { ReminderCalendar } from "@/components/ReminderCalendar";
import { REMINDER_KEY } from "@/constants/query-keys";
import { getListReminderQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";

export function ReminderScreen() {
  const { data, isLoading } = useQuery({
    queryKey: REMINDER_KEY.list(),
    queryFn: () => getListReminderQuery(),
  });

  return (
    <View className="flex-1 pt-20 bg-background">
      <ReminderCalendar data={data?.data ?? []} loading={isLoading} />
    </View>
  );
}
