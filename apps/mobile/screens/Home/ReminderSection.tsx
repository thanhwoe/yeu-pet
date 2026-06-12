import { ReminderTypeIcon } from "@/features/reminders/components/ReminderIcons";
import { Skeleton } from "@/components/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import { StateView } from "@/components/ui/StateView";
import { Body, Heading } from "@/components/ui/Typography";
import { REMINDER_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IReminder } from "@/interfaces";
import { getUpcomingReminderQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { CalendarCheckIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";
import { HOME_REMINDER_PARAMS } from "./homeQueries";

const CalendarIcon = withIconClassName(CalendarCheckIcon);

const ReminderItem = ({ data }: { data: IReminder }) => {
  return (
    <View className="flex-row p-12 bg-background-card items-center rounded-16 gap-12">
      <ReminderTypeIcon type={data.type} size={30} circle />
      <View className="flex-1 ">
        <Body weight="bold" numberOfLines={1}>
          {data.title}
        </Body>
        <Body variant="body3" className="text-text-muted">
          {dayjs(data.scheduledAt).fromNow()}
        </Body>
        {data.description && <Body variant="body2">{data.description}</Body>}
      </View>
      <View>
        <Avatar
          source={{
            uri: data.pets?.avatarUrl ?? "",
          }}
          size="large"
        />
      </View>
    </View>
  );
};

export const ReminderSection = () => {
  const router = useRouter();

  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: REMINDER_KEY.upcoming(HOME_REMINDER_PARAMS),
    queryFn: () => getUpcomingReminderQuery(HOME_REMINDER_PARAMS),
  });

  const reminders = data?.data ?? [];
  const openReminders = () => router.push("/(tabs)/(reminder)");

  return (
    <View className="mx-20 p-20 mt-10 bg-background-card-highlight rounded-24">
      <View className="flex-row items-center gap-8 mb-16">
        <CalendarIcon className="text-icon-primary" weight="bold" />
        <Heading variant="h4" weight="bold">
          Upcoming
        </Heading>
      </View>
      <View className="gap-12">
        {isLoading ? (
          <>
            <Skeleton
              className="h-80 rounded-16"
              backgroundClassName="bg-background-secondary-highlight"
            />
            <Skeleton
              className="h-80 rounded-16"
              backgroundClassName="bg-background-secondary-highlight"
            />
          </>
        ) : isError ? (
          <StateView
            variant="error"
            title="Reminders could not load"
            description="Try again to see the next care tasks."
            actionLabel="Retry"
            onAction={() => refetch()}
            className="min-h-140 rounded-16 bg-background-card px-16 py-20"
          />
        ) : reminders.length === 0 ? (
          <StateView
            variant="empty"
            title="No upcoming reminders"
            description="Add the next vaccine, meal, or grooming task when you are ready."
            actionLabel="Add reminder"
            onAction={openReminders}
            className="min-h-140 rounded-16 bg-background-card px-16 py-20"
          />
        ) : (
          reminders.map((i) => <ReminderItem data={i} key={i.id} />)
        )}
        {!isError && !isLoading && reminders.length > 0 ? (
          <TouchableOpacity
            accessibilityLabel="Open reminders"
            accessibilityRole="button"
            onPress={openReminders}
            className="mt-16 border-[1.5px] border-dashed rounded-32 p-16 items-center border-line-secondary"
          >
            <Body weight="bold" className="text-text-link">
              Open reminders
            </Body>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};
