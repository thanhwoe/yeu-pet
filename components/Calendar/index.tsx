import { IReminder, IReminderInfo } from "@/interfaces";
import { date } from "@/utils";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { isEmpty } from "lodash";
import { useCallback, useRef } from "react";
import { View } from "react-native";
import {
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
  ExpandableCalendarProps,
} from "react-native-calendars";
import { Text } from "../ui/Text";
import { AgendaDate } from "./AgendaDate";
import { AgendaItem } from "./AgendaItem";
import { DayItem } from "./DayItem";

interface IProps {
  onEditAgenda?: (item: IReminderInfo) => void;
  onDeleteAgenda?: (item: IReminderInfo) => void;
  data: IReminder[];
}

export const Calendar = ({ onEditAgenda, onDeleteAgenda, data }: IProps) => {
  const calendarRef = useRef<{ toggleCalendarPosition: () => boolean }>(null);

  const marked = getMarkedDates(data);

  const renderItem = useCallback(
    ({ item }: { item: IReminderInfo }) => {
      return (
        <AgendaItem
          item={item}
          onEdit={onEditAgenda}
          onDelete={onDeleteAgenda}
        />
      );
    },
    [onDeleteAgenda, onEditAgenda]
  );

  const renderHeader = useCallback((vale?: any) => {
    return <Text variant="title3">{date(vale).format("MMMM YYYY")}</Text>;
  }, []);

  return (
    <View className="flex-1 mx-5">
      <CalendarProvider
        date={new Date().toISOString().split("T")[0]}
        // date={data[1]?.title}
        // onDateChanged={onDateChanged}
        // onMonthChange={onMonthChange}
        // disabledOpacity={0.6}
      >
        <View className="gap-4 flex-1">
          <ExpandableCalendar
            calendarWidth={SCREEN_WIDTH - 40}
            renderHeader={renderHeader}
            ref={calendarRef}
            contentContainerClassName="pb-4"
            // disablePan
            style={{
              borderRadius: 20,
              paddingBottom: 10,
            }}
            theme={{
              calendarBackground: "#FFFDF6",
              textSectionTitleColor: "#000",
              arrowColor: "#FF894F",
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
          {isEmpty(data) ? (
            <View className="mt-10">
              <Text className="text-center" variant="body2">
                No reminders added yet. {"\n"} Start by adding your first one!
              </Text>
            </View>
          ) : (
            <AgendaList
              sections={data}
              renderItem={renderItem}
              scrollToNextEvent={false}
              renderSectionHeader={AgendaDate}
              removeClippedSubviews
              style={{
                flex: 1,
              }}
            />
          )}
        </View>
      </CalendarProvider>
    </View>
  );
};

function getMarkedDates(data: IReminder[]) {
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
