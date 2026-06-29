import {
  GroupedReminder,
  IReminder,
  ReminderRepeatFrequency,
  ReminderStatus,
} from "@/interfaces";
import dayjs from "dayjs";
import type { TFunction } from "i18next";
import { isEmpty } from "lodash";
import type { ExpandableCalendarProps } from "react-native-calendars";

export const REMINDER_DAY_KEY_FORMAT = "YYYY-MM-DD";

const NON_DELETABLE_REMINDER_STATUSES = new Set<ReminderStatus>([
  "sent",
  "completed",
]);

export const canDeleteReminder = (status: ReminderStatus) =>
  !NON_DELETABLE_REMINDER_STATUSES.has(status);

export const toReminderDate = (value?: string | Date | null) => {
  if (!value) return null;

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

export const getReminderDayKey = (value?: string | Date | null) =>
  toReminderDate(value)?.format(REMINDER_DAY_KEY_FORMAT);

export const isSameLocalDay = (
  left?: string | Date | null,
  right?: string | Date | null,
) => {
  const leftKey = getReminderDayKey(left);
  const rightKey = getReminderDayKey(right);

  return !!leftKey && !!rightKey && leftKey === rightKey;
};

export const formatReminderDateLabel = (
  value: string | Date | null | undefined,
  t: TFunction,
) => {
  const parsed = toReminderDate(value);

  if (!parsed) return t("reminders.calendar.unknownDate");
  if (parsed.isSame(dayjs(), "day")) return t("reminders.calendar.today");

  return parsed.format("D MMMM YYYY");
};

export const formatReminderMonthLabel = (
  value: string | Date | null | undefined,
  t: TFunction,
) =>
  toReminderDate(value)?.format("MMMM YYYY") ??
  t("reminders.calendar.thisMonth");

export const formatReminderTime = (value?: string | Date | null) =>
  toReminderDate(value)?.format("HH:mm") ?? "--:--";

export const formatReminderRepeatLabel = (
  frequency: ReminderRepeatFrequency | null | undefined,
  until: string | Date | null | undefined,
  t: TFunction,
) => {
  const repeat = t(`reminders.repeat.${frequency ?? "none"}`);
  const parsedUntil = toReminderDate(until);

  if (!parsedUntil || frequency === "none" || !frequency) {
    return repeat;
  }

  return t("reminders.repeat.until", {
    date: parsedUntil.format("D MMM YYYY"),
    repeat,
  });
};

export const getMonthRange = (value?: string | Date | null) => {
  const month = toReminderDate(value) ?? dayjs();

  return {
    from: month.startOf("month").toISOString(),
    to: month.endOf("month").toISOString(),
  };
};

export const sortRemindersByTime = (items: IReminder[]) =>
  [...items].sort((a, b) => {
    const aTime = toReminderDate(a.scheduledAt)?.valueOf() ?? 0;
    const bTime = toReminderDate(b.scheduledAt)?.valueOf() ?? 0;

    return aTime - bTime;
  });

export const getRemindersForDay = (items: IReminder[], dayKey: string) =>
  sortRemindersByTime(
    items.filter((item) => getReminderDayKey(item.scheduledAt) === dayKey),
  );

export const getMarkedDateCounts = (items: IReminder[]) =>
  items.reduce<Record<string, number>>((acc, item) => {
    const dayKey = getReminderDayKey(item.scheduledAt);
    if (!dayKey) return acc;

    acc[dayKey] = (acc[dayKey] ?? 0) + 1;
    return acc;
  }, {});

export const groupReminder = (items: IReminder[]): GroupedReminder[] => {
  const map = new Map<string, IReminder[]>();

  for (const item of items) {
    const key = getReminderDayKey(item.scheduledAt);
    if (!key) continue;

    const group = map.get(key);
    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ title: date, data }));
};

export function getMarkedDates(data: GroupedReminder[]) {
  const marked: ExpandableCalendarProps["markedDates"] = {};

  data.forEach((item) => {
    // NOTE: only mark dates with data
    if (item.data && item.data.length > 0 && !isEmpty(item.data[0])) {
      marked[item.title] = { marked: true };
    } else {
      marked[item.title] = { disabled: true };
    }
  });
  return marked;
}
