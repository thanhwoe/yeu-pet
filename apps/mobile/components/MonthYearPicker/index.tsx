import dayjs from "dayjs";
import React, { memo, useCallback, useRef, useState } from "react";
import { View } from "react-native";
import { Button } from "../ui/Button";
import { WheelColumn } from "./WheelColumn";
import { CURRENT_MONTH, CURRENT_YEAR, ITEM_HEIGHT, YEARS } from "./utils";

export interface MonthYear {
  month: number; // 1–12
  year: number;
}

interface MonthYearPickerProps {
  initialMonth?: number; // 1–12
  initialYear?: number;
  onChange?: (value: MonthYear) => void;
  onConfirm?: (value: MonthYear) => void;
}

export const MonthYearPicker = memo<MonthYearPickerProps>(
  ({
    initialMonth = CURRENT_MONTH,
    initialYear = CURRENT_YEAR,
    onChange,
    onConfirm,
  }) => {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [selectedYear, setSelectedYear] = useState(initialYear);
    const months = useRef(dayjs.months()).current;

    const handleMonthChange = useCallback(
      (index: number) => {
        setSelectedMonth(index);
        onChange?.({ month: index, year: selectedYear });
      },
      [selectedYear, onChange],
    );

    const handleYearChange = useCallback(
      (index: number) => {
        const year = YEARS[index];
        setSelectedYear(year);
        onChange?.({ month: selectedMonth, year });
      },
      [selectedMonth, onChange],
    );

    const handleConfirm = () => {
      onConfirm?.({ month: selectedMonth, year: selectedYear });
    };

    const initialYearIndex = YEARS.indexOf(initialYear);

    return (
      <View className="rounded-18 overflow-hidden pb-20 px-24 gap-16">
        {/* Picker Area */}
        <View className="flex-row items-center justify-center relative">
          {/* Selection highlight */}
          <View
            className="absolute left-20 right-20 top-[50%] rounded-8 bg-background-tertiary"
            style={{
              height: ITEM_HEIGHT,
              marginTop: -(ITEM_HEIGHT / 2),
            }}
            pointerEvents="none"
          />

          {/* Month wheel */}
          <WheelColumn
            data={months}
            initialIndex={initialMonth}
            onIndexChange={handleMonthChange}
            width={180}
          />

          {/* Year wheel */}
          <WheelColumn
            data={YEARS}
            initialIndex={initialYearIndex >= 0 ? initialYearIndex : 100}
            onIndexChange={handleYearChange}
            width={100}
          />
        </View>

        {/* Confirm button */}
        <Button onPress={handleConfirm}>Confirm</Button>
      </View>
    );
  },
);

MonthYearPicker.displayName = "MonthYearPicker";
