import { withIconClassName } from "@/hocs/withIconClassName";
import { cva, type VariantProps } from "class-variance-authority";
import { PawPrintIcon } from "phosphor-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const PawPrint = withIconClassName(PawPrintIcon);

const dayVariants = cva(
  // Base styles
  "size-7 rounded-full items-center justify-center",
  {
    variants: {
      // Day state variants
      state: {
        today: "bg-background-secondary",
        selected: "bg-background-primary",
        disabled: "",
        inactive: "bg-green-10",
        "": "",
      },
      // Text variants
      textVariant: {
        "": "text-gray-90",
        today: "text-text-primary-inverse font-semibold",
        selected: "text-text-primary-inverse font-semibold",
        disabled: "text-gray-40",
        inactive: "text-green-80 font-medium",
      },
    },
    defaultVariants: {
      state: "",
      textVariant: "",
    },
  }
);

const textVariants = cva(
  // Base styles
  "",
  {
    variants: {
      // Day state variants
      state: {
        "": "text-gray-90",
        today: "text-text-primary-inverse font-semibold",
        selected: "text-text-primary-inverse font-semibold",
        disabled: "text-gray-40",
        inactive: "text-green-80 font-medium",
      },
    },
    defaultVariants: {
      state: "",
    },
  }
);

interface DayProps extends VariantProps<typeof dayVariants> {
  date?: {
    day: number;
    month: number;
    year: number;
    timestamp: number;
    dateString: string;
  };
  onPress?: (date: any) => void;
  onLongPress?: (date: any) => void;
  marking?: {
    marked?: boolean;
  };
}

export const DayItem: React.FC<DayProps> = ({
  date,
  onPress,
  onLongPress,
  state,
  marking,
}) => {
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
      activeOpacity={0.7}
      className={"items-center gap-1"}
    >
      <View
        className={dayVariants({
          state,
        })}
      >
        <Text
          className={textVariants({
            state,
          })}
        >
          {date?.day}
        </Text>
      </View>

      {marking?.marked && (
        <PawPrint size={12} weight="fill" className="text-icon-primary" />
      )}
    </TouchableOpacity>
  );
};
