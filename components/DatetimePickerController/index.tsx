import { withIconClassName } from "@/hocs/withIconClassName";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { CalendarIcon as Calendar, XIcon as X } from "phosphor-react-native";
import { useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import {
  Modal,
  Platform,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";

const XIcon = withIconClassName(X);
const CalendarIcon = withIconClassName(Calendar);

interface DateTimePickerControllerProps<T extends FieldValues> {
  label?: string;
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
  mode?: "date" | "time" | "datetime";
  display?: "default" | "spinner" | "compact" | "inline";
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  format?: (date: Date) => string;
  disabled?: boolean;
  variant?: "default" | "outlined" | "filled";
  size?: "sm" | "md" | "lg";
}

export const DateTimePickerController = <T extends FieldValues>({
  name,
  control,
  rules,
  label,
  mode = "date",
  display = Platform.OS === "ios" ? "spinner" : "default",
  minimumDate,
  maximumDate,
  placeholder,
  format,
  disabled = false,
}: DateTimePickerControllerProps<T>) => {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control, rules });

  const [showPicker, setShowPicker] = useState(false);
  const [tempValue, setTempValue] = useState<Date | null>(null);

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && selectedDate) {
        onChange(selectedDate);
      }
      return;
    }

    // iOS handling
    if (selectedDate) {
      setTempValue(selectedDate);
    }
  };

  const handleIOSConfirm = () => {
    if (tempValue) {
      onChange(tempValue);
    }
    handleIOSCancel();
  };

  const handleIOSCancel = () => {
    setTempValue(null);
    setShowPicker(false);
    onBlur();
  };

  const formatDisplayValue = (date: Date | null | undefined): string => {
    if (!date) return "";

    if (format) return format(date);

    const dateObj = new Date(date);

    switch (mode) {
      case "time":
        return dateObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "datetime":
        return dateObj.toLocaleString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      case "date":
      default:
        return dateObj.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
    }
  };

  const openPicker = () => {
    if (!disabled) {
      setTempValue(value || new Date());
      setShowPicker(true);
    }
  };

  const renderIOSModal = () => (
    <Modal
      transparent
      visible={showPicker}
      animationType="fade"
      onRequestClose={handleIOSCancel}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable className="flex-1" onPress={handleIOSCancel} />

        <View className="bg-white rounded-t-3xl shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
            <TouchableOpacity
              onPress={handleIOSCancel}
              className="flex-row items-center gap-1 px-3 py-2 rounded-lg"
              activeOpacity={0.7}
            >
              <XIcon size={18} color="#6B7280" weight="bold" />
            </TouchableOpacity>

            <Text>
              {mode === "date" && "Select Date"}
              {mode === "time" && "Select Time"}
              {mode === "datetime" && "Select Date & Time"}
            </Text>
            <Button onPress={handleIOSConfirm} variant="tonal">
              Done
            </Button>
          </View>

          {/* Picker */}
          <View className="pl-8 py-6 ">
            <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <DateTimePicker
                value={tempValue || value || new Date()}
                mode={mode}
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                themeVariant="light"
                locale="vi-VI"
                textColor="#1F2937"
                style={{ backgroundColor: "white" }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="gap-2 ">
      {label && <Text variant="caption1">{label}</Text>}
      <View className="gap-1">
        <TouchableOpacity
          onPress={openPicker}
          disabled={disabled}
          className="flex-row px-3 py-2 items-center justify-center border border-gray-200 rounded-lg gap-2"
          activeOpacity={0.8}
        >
          <TextInput
            className="flex-1 py-1"
            editable={false}
            placeholder={placeholder}
            pointerEvents="none"
          >
            {formatDisplayValue(value)}
          </TextInput>

          <CalendarIcon weight="duotone" size={20} />
        </TouchableOpacity>

        <Text className="text-red-500" variant={"footnote"}>
          {error?.message}
        </Text>
      </View>

      {/* Render modals based on platform */}
      {Platform.OS === "ios"
        ? renderIOSModal()
        : showPicker && (
            <DateTimePicker
              value={value || new Date()}
              mode={mode}
              display={display}
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              themeVariant="light"
            />
          )}
    </View>
  );
};
