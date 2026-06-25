import { Skeleton } from "@/components/Skeleton";
import { Body } from "@/components/ui/Typography";
import { REMINDER_KEY } from "@/constants/query-keys";
import { ReminderTypeIcon } from "@/features/reminders/components/ReminderIcons";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IReminder } from "@/interfaces";
import { getUpcomingReminderQuery } from "@/services";
import { cn } from "@/utils";
import {
  formatReminderRepeat,
  REMINDER_TYPE_LABELS,
  sortRemindersByTime,
  toReminderDate,
} from "@/utils/reminder";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import {
  CalendarCheckIcon,
  CalendarPlusIcon,
  CaretRightIcon,
  ClockIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { View } from "react-native";
import {
  DashboardAction,
  DashboardCard,
  DashboardState,
} from "./DashboardCard";
import { HOME_REMINDER_PARAMS } from "./homeQueries";

const CalendarIcon = withIconClassName(CalendarCheckIcon);
const CalendarPlus = withIconClassName(CalendarPlusIcon);
const CaretRight = withIconClassName(CaretRightIcon);
const Clock = withIconClassName(ClockIcon);
const WarningCircle = withIconClassName(WarningCircleIcon);

const formatDashboardDueTime = (value: string) => {
  const dueAt = toReminderDate(value);

  if (!dueAt) return "Time not set";

  const today = dayjs();
  const time = dueAt.format("HH:mm");

  if (dueAt.isSame(today, "day")) return `Today · ${time}`;
  if (dueAt.isSame(today.add(1, "day"), "day")) {
    return `Tomorrow · ${time}`;
  }

  const date = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(dueAt.toDate());

  return `${date} · ${time}`;
};

const ReminderItem = ({
  data,
  isNext,
}: {
  data: IReminder;
  isNext: boolean;
}) => {
  const petName = data.pets?.name?.trim() || "All pets";
  const repeatSummary = formatReminderRepeat(
    data.repeatFrequency,
    data.repeatUntil,
  );
  const repeats = data.repeatFrequency && data.repeatFrequency !== "none";

  return (
    <View
      className={cn("flex-row gap-10 border-b border-line-subtle pb-8 pt-12")}
    >
      <ReminderTypeIcon
        type={data.type}
        size={16}
        weight="duotone"
        circle
        containerClassName="size-32 rounded-10"
      />

      <View className="flex-1 gap-3">
        <View className="flex-row items-center gap-8">
          {isNext ? (
            <View className="rounded-full bg-feature-reminder-surface px-8 py-2">
              <Body
                variant="body5"
                weight="bold"
                caps
                className="text-feature-reminder-accent"
              >
                Next
              </Body>
            </View>
          ) : null}
          <Body
            variant={isNext ? "body2" : "body3"}
            weight="semiBold"
            numberOfLines={1}
            className="flex-1"
          >
            {data.title}
          </Body>
        </View>

        <Body variant="body4" className="text-text-muted" numberOfLines={1}>
          {petName} · {REMINDER_TYPE_LABELS[data.type]}
        </Body>

        <View className="flex-row flex-wrap items-center gap-x-6 gap-y-2">
          <View className="flex-row items-center gap-4">
            <Clock size={14} weight="bold" className="text-icon-secondary" />
            <Body variant="body4" weight="semiBold">
              {formatDashboardDueTime(data.scheduledAt)}
            </Body>
          </View>
          {repeats ? (
            <Body variant="body5" className="text-text-muted">
              · {repeatSummary}
            </Body>
          ) : null}
        </View>
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

  const reminders = sortRemindersByTime(data?.data ?? []);
  const openReminders = () => router.push("/(tabs)/(reminder)");

  return (
    <DashboardCard
      title="Upcoming Reminders"
      subtitle="Next care tasks"
      icon={
        <View className="size-40 items-center justify-center rounded-14 bg-feature-reminder-surface">
          <CalendarIcon
            size={21}
            weight="duotone"
            className="text-feature-reminder-accent"
          />
        </View>
      }
    >
      <View>
        {isLoading ? (
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Loading upcoming reminders"
            className="gap-10"
          >
            <Skeleton
              className="h-76 rounded-16"
              backgroundClassName="bg-background-surface-muted"
            />
            <Skeleton
              className="h-60 rounded-16"
              backgroundClassName="bg-background-surface-muted"
            />
          </View>
        ) : isError ? (
          <DashboardState
            icon={
              <View className="size-44 items-center justify-center rounded-full bg-status-danger-surface">
                <WarningCircle
                  size={24}
                  weight="duotone"
                  className="text-status-danger-icon"
                />
              </View>
            }
            title="Reminders could not load"
            description="Try again to see the next care tasks."
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        ) : reminders.length === 0 ? (
          <DashboardState
            icon={
              <View className="size-44 items-center justify-center rounded-full bg-feature-reminder-surface">
                <CalendarPlus
                  size={24}
                  weight="duotone"
                  className="text-feature-reminder-accent"
                />
              </View>
            }
            title="No upcoming reminders"
            description="Add the next vaccine, medication, feeding or grooming reminder."
            actionLabel="Add Reminder"
            onAction={openReminders}
          />
        ) : (
          <>
            {reminders.slice(0, 2).map((reminder, index) => (
              <ReminderItem
                data={reminder}
                key={reminder.id}
                isNext={index === 0}
              />
            ))}
            <DashboardAction
              label="View all reminders"
              accessibilityLabel="View all reminders"
              onPress={openReminders}
            />
          </>
        )}
      </View>
    </DashboardCard>
  );
};
