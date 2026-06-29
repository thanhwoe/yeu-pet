import { i18n } from "@/i18n";
import type { IReminder, IUser } from "@/interfaces";
import { date } from "@/utils";
import { sortRemindersByTime, toReminderDate } from "@/utils/reminder";
import type { Dayjs } from "dayjs";
import type { TFunction } from "i18next";

type GreetingDayPart = "morning" | "noon" | "afternoon" | "evening" | "night";

type HomeGreetingTitleParams = {
  hasPets: boolean;
  now: Dayjs;
  petsReady: boolean;
  t: TFunction;
  user: IUser | null;
};

type HomeGreetingSubtitleParams = {
  hasPets: boolean;
  now: Dayjs;
  overdueCount: number;
  petsReady: boolean;
  remindersReady: boolean;
  t: TFunction;
  todayCount: number;
  todayReminders: IReminder[];
};

const MAX_FRIENDLY_NAME_LENGTH = 24;
const RANDOMISH_NAME_PATTERN = /^[a-z]*\d{4,}$/i;

const isSafeDisplayNameToken = (value: string) =>
  value.length <= MAX_FRIENDLY_NAME_LENGTH &&
  /^\p{L}/u.test(value) &&
  !/[.@/#\\]/.test(value) &&
  !RANDOMISH_NAME_PATTERN.test(value);

const capitalizeDisplayToken = (value: string) => {
  const first = value.charAt(0);

  return first.toLocaleUpperCase() + value.slice(1);
};

export const getFriendlyUserName = (user: IUser | null | undefined) => {
  const fallback = i18n.t("home.greeting.fallbackName");
  const token = user?.firstName?.trim().split(/\s+/)[0];

  if (!token || !isSafeDisplayNameToken(token)) {
    return fallback;
  }

  return capitalizeDisplayToken(token);
};

export const getGreetingDayPart = (now: Dayjs = date()): GreetingDayPart => {
  const hour = now.hour();

  if (hour >= 5 && hour <= 10) return "morning";
  if (hour >= 11 && hour <= 13) return "noon";
  if (hour >= 14 && hour <= 17) return "afternoon";
  if (hour >= 18 && hour <= 21) return "evening";

  return "night";
};

export const getHomeGreetingReminderParams = (now: Dayjs) => ({
  overdue: {
    from: date(0).toISOString(),
    limit: 20,
    status: "pending" as const,
    to: now.toISOString(),
  },
  today: {
    from: now.startOf("day").toISOString(),
    limit: 20,
    status: "pending" as const,
    to: now.endOf("day").toISOString(),
  },
});

export const getHomeGreetingTitle = ({
  hasPets,
  now,
  petsReady,
  t,
  user,
}: HomeGreetingTitleParams) => {
  if (petsReady && !hasPets) {
    return t("home.greeting.welcomeTitle");
  }

  const dayPart = getGreetingDayPart(now);
  const greeting = t(`home.greeting.time.${dayPart}`);
  const name = getFriendlyUserName(user);

  if (dayPart === "night") {
    return t("home.greeting.titleNight", { greeting, name });
  }

  return t("home.greeting.title", { greeting, name });
};

const getNextReminderToday = (reminders: IReminder[], now: Dayjs) =>
  sortRemindersByTime(reminders).find((reminder) => {
    const scheduledAt = toReminderDate(reminder.scheduledAt);

    return scheduledAt
      ? scheduledAt.isSame(now) || scheduledAt.isAfter(now)
      : false;
  });

const getReminderPetName = (reminder: IReminder, t: TFunction) =>
  reminder.pets?.name?.trim() || t("home.greeting.petFallback");

const getReminderTitle = (reminder: IReminder, t: TFunction) =>
  reminder.title?.trim() || t("home.greeting.reminderFallback");

const getReminderTime = (reminder: IReminder, t: TFunction) =>
  toReminderDate(reminder.scheduledAt)?.format("LT") ??
  t("home.greeting.timeFallback");

export const getHomeGreetingSubtitle = ({
  hasPets,
  now,
  overdueCount,
  petsReady,
  remindersReady,
  t,
  todayCount,
  todayReminders,
}: HomeGreetingSubtitleParams) => {
  if (petsReady && !hasPets) {
    return t("home.greeting.subtitle.noPets");
  }

  if (!remindersReady) {
    return t("home.greeting.subtitle.fallback");
  }

  if (overdueCount > 0) {
    return t("home.greeting.subtitle.overdue", {
      count: overdueCount,
    });
  }

  const nextReminder = getNextReminderToday(todayReminders, now);
  if (nextReminder) {
    return t("home.greeting.subtitle.nextToday", {
      petName: getReminderPetName(nextReminder, t),
      time: getReminderTime(nextReminder, t),
      title: getReminderTitle(nextReminder, t),
    });
  }

  if (todayCount > 0) {
    return t("home.greeting.subtitle.todayCount", {
      count: todayCount,
    });
  }

  return t("home.greeting.subtitle.noToday");
};
