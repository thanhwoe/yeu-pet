import { date } from "@/utils";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { useCallback, useRef } from "react";
import { View } from "react-native";
import {
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
} from "react-native-calendars";
import { Text } from "../ui/Text";
import { AgendaDate } from "./AgendaDate";
import { AgendaItem } from "./AgendaItem";
import { DayItem } from "./DayItem";
import { agendaItems, getMarkedDates } from "./mocks";

const ITEMS: any[] = agendaItems;

interface IProps {
  onEditAgenda?: () => void;
}

export const Calendar = ({ onEditAgenda }: IProps) => {
  const marked = useRef(getMarkedDates());
  const calendarRef = useRef<{ toggleCalendarPosition: () => boolean }>(null);

  const renderItem = ({ item }: any) => {
    return <AgendaItem item={item} onEdit={onEditAgenda} />;
  };

  const renderHeader = useCallback((vale?: any) => {
    return <Text variant="title3">{date(vale).format("MMMM YYYY")}</Text>;
  }, []);

  return (
    <View className="flex-1 mb-5 mx-5 pb-[300px]">
      <CalendarProvider
        date={ITEMS[1]?.title}
        // onDateChanged={onDateChanged}
        // onMonthChange={onMonthChange}
        // disabledOpacity={0.6}
      >
        <View className="gap-4">
          <ExpandableCalendar
            calendarWidth={SCREEN_WIDTH - 40}
            renderHeader={renderHeader}
            ref={calendarRef}
            contentContainerClassName="pb-4"
            disablePan
            style={{
              borderRadius: 20,
              paddingBottom: 10,
            }}
            theme={{
              calendarBackground: "#FFFDF6",
              textSectionTitleColor: "#000",
              dayTextColor: "#000",
              todayTextColor: "#EB5B00",
              selectedDayTextColor: "#fff",
              // monthTextColor: "blue",
              // indicatorColor: "black",
              selectedDayBackgroundColor: "#FF894F",
              arrowColor: "#FF894F",
              // textDisabledColor: 'red',
            }}
            hideKnob
            initialPosition={ExpandableCalendar.positions.OPEN}
            // disableAllTouchEventsForDisabledDays
            firstDay={1}
            dayComponent={DayItem}
            markedDates={marked.current}
            animateScroll
            closeOnDayPress={false}
            removeClippedSubviews
          />
          <AgendaList
            sections={ITEMS}
            renderItem={renderItem}
            scrollToNextEvent
            renderSectionHeader={AgendaDate}
            removeClippedSubviews
            // dayFormat={"yyyy-MM-d"}
          />
        </View>
      </CalendarProvider>
    </View>
  );
};
