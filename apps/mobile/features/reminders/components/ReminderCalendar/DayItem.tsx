import { withIconClassName } from "@/hocs/withIconClassName";
import { SCREEN_WIDTH } from "@/constants/common";
import { cva, type VariantProps } from "class-variance-authority";
import { PawPrintIcon } from "phosphor-react-native";
import React, { memo } from "react";
import { DateData } from "react-native-calendars";
import { TouchableOpacity, View } from "react-native";
import { Body } from "@/components/ui/Typography";

const PawPrint = withIconClassName(PawPrintIcon);

const dayVariants = cva("size-30 rounded-full items-center justify-center", {
  variants: {
    state: {
      today: "bg-background-secondary-pressed",
      selected: "bg-background-primary",
      disabled: "",
      inactive: "",
      "": "",
    },
  },
  defaultVariants: {
    state: "",
  },
});

const textVariants = cva("", {
  variants: {
    state: {
      "": "text-text-primary",
      today: "text-text-primary-disabled",
      selected: "text-text-primary-inverse",
      disabled: "text-text-primary-disabled",
      inactive: "",
    },
  },
  defaultVariants: {
    state: "",
  },
});

interface DayProps extends VariantProps<typeof dayVariants> {
  date?: DateData;
  onPress?: (date: DateData) => void;
  onLongPress?: (date: DateData) => void;
  marking?: {
    marked?: boolean;
  };
}

export const DayItem = memo<DayProps>(
  ({ date, onPress, onLongPress, state, marking }) => {
    const disabled = state === "disabled";

    const handlePress = () => {
      if (!disabled && onPress && date) {
        onPress(date);
      }
    };

    const handleLongPress = () => {
      if (!disabled && onLongPress && date) {
        onLongPress(date);
      }
    };

    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={disabled}
        style={{
          width: (SCREEN_WIDTH - 40) / 7,
          height: 30,
        }}
        activeOpacity={0.7}
        className="items-center self-start gap-2"
      >
        <View
          className={dayVariants({
            state,
          })}
        >
          <Body
            className={textVariants({
              state,
            })}
          >
            {date?.day}
          </Body>
        </View>

        {marking?.marked && (
          <PawPrint
            size={12}
            weight="fill"
            className="text-icon-primary-highlight"
          />
        )}
      </TouchableOpacity>
    );
  },
);

DayItem.displayName = "DayItem";
