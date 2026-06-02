import { ReminderIcons } from "@/components/ReminderIcons";
import { Skeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/Button";
import { Image } from "@/components/ui/Image";
import { Text } from "@/components/ui/Text";
import { SCREEN_WIDTH } from "@/constants/common";
import { REMINDER_KEY } from "@/constants/query-keys";
import { IPet } from "@/interfaces";
import { getListReminderQuery } from "@/services";
import { date } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { View } from "react-native";

interface IProps {
  pet: IPet;
}

export const TimelineList = ({ pet }: IProps) => {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: REMINDER_KEY.list({ petId: pet.id }),
    queryFn: () => getListReminderQuery({ petId: pet.id, limit: 2 }),
    select: (data) =>
      (data?.data || [])
        .flatMap((item) => item)
        .sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime(),
        ),
  });

  if (isLoading) {
    return (
      <View
        style={{
          width: SCREEN_WIDTH - 40,
        }}
        className="gap-4"
      >
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton className="flex-1 h-20 rounded-2xl" key={index} />
        ))}
      </View>
    );
  }

  if (data?.length === 0) {
    return (
      <View
        className="gap-4"
        style={{
          width: SCREEN_WIDTH - 40,
          height: 250,
        }}
      >
        <Text className="text-text-upcoming-title text-center">
          {pet.name}&apos;s reminders
        </Text>

        <View className="items-center overflow-hidden gap-2 justify-center flex-1 bg-background-white rounded-2xl">
          <View className="absolute bottom-0 right-0">
            <Image
              contentFit="contain"
              className="size-56"
              source={require("@/assets/images/funny-cat.png")}
            />
          </View>
          <Text>Don&apos;t forget to add a reminder</Text>
          <Button
            variant="secondary"
            onPress={() => router.push("/(tabs)/(reminder)")}
          >
            Add reminder
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View
      className="gap-4"
      style={{
        width: SCREEN_WIDTH - 40,
      }}
    >
      <Text className="text-text-upcoming-title text-center">
        {pet.name}&apos;s reminders
      </Text>
      {data?.map((reminder) => {
        return (
          <View
            key={reminder.id}
            className="bg-background-white p-4 rounded-2xl gap-1"
          >
            <View className="flex-row">
              <Text variant="caption2">
                {date(reminder.scheduledAt).format("l LT")}
              </Text>
            </View>
            <Text variant="callout" className="font-bold">
              {reminder.title}
            </Text>
            <Text variant="footnote" numberOfLines={2}>
              {reminder.description}
            </Text>
            <Text
              variant="caption2"
              className="absolute top-4 right-4 text-text-secondary"
            >
              {date(reminder.scheduledAt).fromNow()}
            </Text>
            <View className="absolute top-1/2 right-4 opacity-50">
              <ReminderIcons type={reminder.type} size={60} />
            </View>
          </View>
        );
      })}
    </View>
  );
};
