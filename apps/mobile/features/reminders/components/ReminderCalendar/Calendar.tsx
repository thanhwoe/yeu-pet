import { Body, Heading } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { cn } from "@/utils";
import {
  formatReminderMonth,
  REMINDER_DAY_KEY_FORMAT,
} from "@/utils/reminder";
import dayjs from "dayjs";
import {
  CaretLeftIcon,
  CaretRightIcon,
  PawPrintIcon,
} from "phosphor-react-native";
import type { ReactNode } from "react";
import { memo, useMemo } from "react";
import { Pressable, View } from "react-native";

const PrevIcon = withIconClassName(CaretLeftIcon);
const NextIcon = withIconClassName(CaretRightIcon);
const PawPrint = withIconClassName(PawPrintIcon);

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

interface CalendarProps {
  visibleMonth: string;
  selectedDate: string;
  markedDateCounts: Record<string, number>;
  onSelectDate: (date: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

interface CalendarDay {
  key: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  reminderCount: number;
}

const buildCalendarDays = (
  visibleMonth: string,
  selectedDate: string,
  markedDateCounts: Record<string, number>,
): CalendarDay[] => {
  const monthStart = dayjs(visibleMonth).startOf("month");
  const mondayOffset = (monthStart.day() + 6) % 7;
  const gridStart = monthStart.subtract(mondayOffset, "day");
  const dayCount = monthStart.daysInMonth();
  const cellCount = Math.ceil((mondayOffset + dayCount) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const date = gridStart.add(index, "day");
    const key = date.format(REMINDER_DAY_KEY_FORMAT);

    return {
      key,
      day: date.date(),
      inMonth: date.isSame(monthStart, "month"),
      isToday: date.isSame(dayjs(), "day"),
      isSelected: key === selectedDate,
      reminderCount: markedDateCounts[key] ?? 0,
    };
  });
};

export const Calendar = memo(
  ({
    visibleMonth,
    selectedDate,
    markedDateCounts,
    onSelectDate,
    onPreviousMonth,
    onNextMonth,
  }: CalendarProps) => {
    const calendarDays = useMemo(
      () => buildCalendarDays(visibleMonth, selectedDate, markedDateCounts),
      [markedDateCounts, selectedDate, visibleMonth],
    );

    return (
      <View className="rounded-24 border border-line-subtle bg-background-card px-14 py-12">
        <View className="mb-8 flex-row items-center justify-between">
          <IconButton
            label="Previous month"
            onPress={onPreviousMonth}
            icon={<PrevIcon size={20} weight="bold" className="text-icon-primary" />}
          />
          <Heading variant="h6" weight="bold" className="capitalize">
            {formatReminderMonth(visibleMonth)}
          </Heading>
          <IconButton
            label="Next month"
            onPress={onNextMonth}
            icon={<NextIcon size={20} weight="bold" className="text-icon-primary" />}
          />
        </View>

        <View className="mb-6 flex-row">
          {WEEKDAY_LABELS.map((label) => (
            <View key={label} className="flex-1 items-center">
              <Body variant="body5" weight="bold" className="text-text-muted">
                {label}
              </Body>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {calendarDays.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.key}${
                item.reminderCount ? `, ${item.reminderCount} reminders` : ""
              }`}
              accessibilityState={{
                selected: item.isSelected,
                disabled: !item.inMonth,
              }}
              disabled={!item.inMonth}
              onPress={() => onSelectDate(item.key)}
              className="h-34 items-center justify-center"
              style={{ width: `${100 / 7}%` }}
            >
              <View
                className={cn("h-28 w-28 items-center justify-center rounded-full", {
                  "bg-action-primary": item.isSelected,
                  "bg-background-secondary": item.isToday && !item.isSelected,
                })}
              >
                <Body
                  variant="body3"
                  weight={item.isSelected || item.isToday ? "bold" : "normal"}
                  className={cn({
                    "text-action-primary-foreground": item.isSelected,
                    "text-text-muted": !item.inMonth,
                    "text-text-primary": item.inMonth && !item.isSelected,
                  })}
                >
                  {item.day}
                </Body>
              </View>

              <View className="h-8 items-center justify-center">
                {item.reminderCount > 0 && item.inMonth ? (
                  <PawPrint
                    size={10}
                    weight="fill"
                    className={cn(
                      item.isSelected
                        ? "text-icon-primary-highlight"
                        : "text-feature-reminder-accent",
                    )}
                  />
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  },
);

Calendar.displayName = "Calendar";

const IconButton = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    onPress={onPress}
    className="h-40 w-40 items-center justify-center rounded-full bg-background-surface-muted"
  >
    {icon}
  </Pressable>
);
