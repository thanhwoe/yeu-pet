import { GroupedReminder, IReminder } from "@/interfaces";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import type { ExpandableCalendarProps } from "react-native-calendars";

export const groupReminder = (items: IReminder[]): GroupedReminder[] => {
  const map = new Map<string, IReminder[]>();

  for (const item of items) {
    const key = dayjs(item.scheduledAt).format("YYYY-MM-DD");
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
