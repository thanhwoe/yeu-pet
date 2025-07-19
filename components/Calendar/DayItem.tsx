import { withIconClassName } from "@/hocs/withIconClassName";
import { cva, type VariantProps } from "class-variance-authority";
import { BoneIcon as Bone } from "phosphor-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
const BoneIcon = withIconClassName(Bone);

const dayVariants = cva(
  // Base styles
  "size-7 rounded-full items-center justify-center",
  {
    variants: {
      // Day state variants
      state: {
        today: "bg-orange-400",
        selected: "bg-orange-600",
        disabled: "",
        inactive: "bg-green-100",
        "": "",
      },
      // Text variants
      textVariant: {
        "": "text-gray-900",
        today: "text-white font-semibold",
        selected: "text-white font-semibold",
        disabled: "text-gray-400",
        inactive: "text-green-800 font-medium",
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
        "": "text-gray-900",
        today: "text-white font-semibold",
        selected: "text-white font-semibold",
        disabled: "text-gray-400",
        inactive: "text-green-800 font-medium",
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
        <BoneIcon size={10} weight="fill" className="text-orange-500" />
      )}
    </TouchableOpacity>
  );
};
