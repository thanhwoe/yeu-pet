import { SCREEN_WIDTH } from "@/constants/common";
import { useColorScheme } from "@/hooks/useColorScheme";
import { date } from "@/utils";
import { cssInterop } from "nativewind";
import { memo, useCallback } from "react";
import { ExpandableCalendar } from "react-native-calendars";
import { DateData, MarkedDates } from "react-native-calendars/src/types";
import { Body } from "@/components/ui/Typography";
import { DayItem } from "./DayItem";

const CALENDAR_WIDTH = SCREEN_WIDTH - 40;

interface ExpandableCalendarProps {
  weekTitleColor?: string;
  arrowColor?: string;
  calendarBackgroundColor?: string;
  marked: MarkedDates;
}

const ExpandableCalendarBase = ({
  arrowColor,
  calendarBackgroundColor,
  weekTitleColor,
  marked,
}: ExpandableCalendarProps) => {
  const { colorScheme } = useColorScheme();

  const renderHeader = useCallback((val?: DateData | string) => {
    return (
      <Body weight="semiBold" className="capitalize">
        {date(typeof val === "string" ? val : val?.dateString).format(
          "MMMM YYYY",
        )}
      </Body>
    );
  }, []);

  return (
    <ExpandableCalendar
      key={colorScheme}
      calendarWidth={CALENDAR_WIDTH}
      renderHeader={renderHeader}
      contentContainerClassName="pb-16"
      disablePan
      style={{
        borderRadius: 20,
        paddingBottom: 10,
      }}
      theme={{
        calendarBackground: calendarBackgroundColor,
        textSectionTitleColor: weekTitleColor,
        arrowColor: arrowColor,
      }}
      hideKnob
      initialPosition={ExpandableCalendar.positions.OPEN}
      // disableAllTouchEventsForDisabledDays
      firstDay={1}
      dayComponent={DayItem}
      markedDates={marked}
      animateScroll
      closeOnDayPress={false}
      removeClippedSubviews
    />
  );
};

export const Calendar = memo(
  cssInterop(ExpandableCalendarBase, {
    weekTitleClassName: {
      target: false,
      nativeStyleToProp: {
        color: "weekTitleColor",
      },
    },
    arrowClassName: {
      target: false,
      nativeStyleToProp: {
        color: "arrowColor",
      },
    },
    calendarClassName: {
      target: false,
      nativeStyleToProp: {
        backgroundColor: "calendarBackgroundColor",
      },
    },
  }),
);
