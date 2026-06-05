import { ReminderTypeIcon } from "@/components/ReminderIcons";
import { Avatar } from "@/components/ui/Avatar";
import { Body, Heading } from "@/components/ui/Typography";
import { REMINDER_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IReminder } from "@/interfaces";
import { getListReminderQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { CalendarCheckIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";

const CalendarIcon = withIconClassName(CalendarCheckIcon);

const ReminderItem = ({ data }: { data: IReminder }) => {
  return (
    <View className="flex-row p-12 bg-background-card items-center rounded-16 gap-12">
      <ReminderTypeIcon type={data.type} size={30} circle />
      <View className="flex-1 ">
        <Body weight="bold" numberOfLines={1}>
          {data.title}
        </Body>
        <Body variant="body3" className="text-text-tertiary-inverse opacity-80">
          {dayjs(data.scheduledAt).fromNow()}
        </Body>
        {data.description && <Body variant="body2">{data.description}</Body>}
      </View>
      <View>
        <Avatar
          source={{
            uri: data.pets.avatarUrl ?? "",
          }}
          size="large"
        />
      </View>
    </View>
  );
};

export const ReminderSection = () => {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: REMINDER_KEY.list({
      status: "pending",
      limit: 3,
    }),
    queryFn: () =>
      getListReminderQuery({
        status: "pending",
        limit: 3,
      }),
  });

  return (
    <View className="mx-20 p-20 mt-10 bg-background-card-highlight rounded-24">
      <View className="flex-row items-center gap-8 mb-16">
        <CalendarIcon className="text-icon-primary" weight="bold" />
        <Heading variant="h4" weight="bold">
          Upcoming
        </Heading>
      </View>
      <View className="gap-12">
        {data?.data.map((i) => (
          <ReminderItem data={i} key={i.id} />
        ))}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/(reminder)")}
          className="mt-16 border-[1.5px] border-dashed rounded-32 p-16 items-center border-line-secondary"
        >
          <Body weight="bold" className="text-text-link">
            Add Reminder
          </Body>
        </TouchableOpacity>
      </View>
    </View>
  );
};
