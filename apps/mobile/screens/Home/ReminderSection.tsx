import { Skeleton } from "@/components/Skeleton";
import { Body } from "@/components/ui/Typography";
import { REMINDER_KEY } from "@/constants/query-keys";
import { ReminderTypeIcon } from "@/features/reminders/components/ReminderIcons";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IReminder } from "@/interfaces";
import { getUpcomingReminderQuery } from "@/services";
import { cn, date } from "@/utils";
import {
  sortRemindersByTime,
  toReminderDate,
} from "@/utils/reminder";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { type TFunction } from "i18next";
import {
  CalendarCheckIcon,
  CalendarPlusIcon,
  ClockIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import {
  DashboardAction,
  DashboardCard,
  DashboardState,
} from "./DashboardCard";
import { HOME_REMINDER_PARAMS } from "./homeQueries";

const CalendarIcon = withIconClassName(CalendarCheckIcon);
const CalendarPlus = withIconClassName(CalendarPlusIcon);
const Clock = withIconClassName(ClockIcon);
const WarningCircle = withIconClassName(WarningCircleIcon);

const formatDashboardDueTime = (value: string, t: TFunction) => {
  const dueAt = toReminderDate(value);

  if (!dueAt) return t("home.reminders.timeNotSet");

  const today = date();
  const time = dueAt.format("LT");

  if (dueAt.isSame(today, "day")) {
    return t("home.reminders.today", { time });
  }
  if (dueAt.isSame(today.add(1, "day"), "day")) {
    return t("home.reminders.tomorrow", { time });
  }

  return t("home.reminders.dueDate", {
    date: dueAt.format("ll"),
    time,
  });
};

const formatDashboardRepeat = (
  frequency: IReminder["repeatFrequency"],
  until: IReminder["repeatUntil"],
  t: TFunction,
) => {
  const repeatFrequency = frequency ?? "none";
  const repeat = t(`reminders.repeat.${repeatFrequency}`);
  const parsedUntil = toReminderDate(until);

  if (!parsedUntil || repeatFrequency === "none") {
    return repeat;
  }

  return t("reminders.repeat.until", {
    date: parsedUntil.format("ll"),
    repeat,
  });
};

const ReminderItem = ({
  data,
  isNext,
}: {
  data: IReminder;
  isNext: boolean;
}) => {
  const { t } = useTranslation();
  const petName = data.pets?.name?.trim() || t("home.reminders.allPets");
  const repeatSummary = formatDashboardRepeat(
    data.repeatFrequency,
    data.repeatUntil,
    t,
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
                {t("home.reminders.next")}
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
          {petName} · {t(`reminders.type.${data.type}`)}
        </Body>

        <View className="flex-row flex-wrap items-center gap-x-6 gap-y-2">
          <View className="flex-row items-center gap-4">
            <Clock size={14} weight="bold" className="text-icon-secondary" />
            <Body variant="body4" weight="semiBold">
              {formatDashboardDueTime(data.scheduledAt, t)}
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
  const { t } = useTranslation();
  const router = useRouter();

  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: REMINDER_KEY.upcoming(HOME_REMINDER_PARAMS),
    queryFn: () => getUpcomingReminderQuery(HOME_REMINDER_PARAMS),
  });

  const reminders = sortRemindersByTime(data?.data ?? []);
  const openReminders = () => router.push("/(tabs)/(reminder)");

  return (
    <DashboardCard
      title={t("home.reminders.title")}
      subtitle={t("home.reminders.subtitle")}
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
            accessibilityLabel={t("home.reminders.loadingAccessibility")}
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
            title={t("home.reminders.errorTitle")}
            description={t("home.reminders.errorDescription")}
            actionLabel={t("common.retry")}
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
            title={t("home.reminders.emptyTitle")}
            description={t("home.reminders.emptyDescription")}
            actionLabel={t("home.reminders.emptyAction")}
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
              label={t("home.reminders.action")}
              accessibilityLabel={t("home.reminders.actionAccessibility")}
              onPress={openReminders}
            />
          </>
        )}
      </View>
    </DashboardCard>
  );
};
