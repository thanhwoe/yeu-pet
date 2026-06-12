import { GroupedReminder, IReminder, ReminderRepeatFrequency } from "@/interfaces";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import type { ExpandableCalendarProps } from "react-native-calendars";

export const REMINDER_DAY_KEY_FORMAT = "YYYY-MM-DD";

export const REMINDER_STATUS_LABELS = {
  pending: "Pending",
  completed: "Done",
  sent: "Done",
  skipped: "Skipped",
  cancelled: "Cancelled",
} as const;

export const REMINDER_TYPE_LABELS = {
  feeding: "Feeding",
  grooming: "Grooming",
  vaccination: "Vaccination",
  medication: "Medication",
} as const;

export const REMINDER_REPEAT_LABELS: Record<ReminderRepeatFrequency, string> = {
  none: "Does not repeat",
  daily: "Every day",
  weekly: "Every week",
  monthly: "Every month",
  yearly: "Every year",
  custom: "Custom repeat",
};

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

export const formatReminderDate = (value?: string | Date | null) => {
  const parsed = toReminderDate(value);

  if (!parsed) return "Unknown date";
  if (parsed.isSame(dayjs(), "day")) return "Today";

  return parsed.format("D MMMM YYYY");
};

export const formatReminderMonth = (value?: string | Date | null) =>
  toReminderDate(value)?.format("MMMM YYYY") ?? "This month";

export const formatReminderTime = (value?: string | Date | null) =>
  toReminderDate(value)?.format("HH:mm") ?? "--:--";

export const formatReminderRepeat = (
  frequency?: ReminderRepeatFrequency | null,
  until?: string | Date | null,
) => {
  const label = REMINDER_REPEAT_LABELS[frequency ?? "none"];
  const parsedUntil = toReminderDate(until);

  if (!parsedUntil || frequency === "none" || !frequency) {
    return label;
  }

  return `${label} until ${parsedUntil.format("D MMM YYYY")}`;
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
