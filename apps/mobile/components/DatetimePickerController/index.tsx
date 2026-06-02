import { withIconClassName } from "@/hocs/withIconClassName";
import { useColorScheme } from "@/hooks/useColorScheme";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useUnstableNativeVariable } from "nativewind";
import { CalendarIcon as Calendar } from "phosphor-react-native";
import { useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { Modal, Platform, Pressable, View } from "react-native";
import { Button } from "../ui/Button";
import { InputField } from "../ui/InputField";
import { Body } from "../ui/Typography";

const CalendarIcon = withIconClassName(Calendar);

interface DateTimePickerControllerProps<
  T extends FieldValues,
  TTransformedValues = T,
> {
  label?: string;
  name: Path<T>;
  control: Control<T, any, TTransformedValues>;
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
  supportText?: string;
}

export const DateTimePickerController = <
  T extends FieldValues,
  TTransformedValues = T,
>({
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
  supportText,
}: DateTimePickerControllerProps<T, TTransformedValues>) => {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control, rules });

  const [showPicker, setShowPicker] = useState(false);
  const [tempValue, setTempValue] = useState<Date | null>(null);

  const { colorScheme } = useColorScheme();

  const textColor = useUnstableNativeVariable(
    "--text-primary",
  ) as unknown as string;

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
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

        <View className="bg-background-foreground rounded-t-16 shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center py-8 border-b border-line-secondary-inverse">
            <View style={{ width: 96 }} />

            <Body weight="semiBold">
              {mode === "date" && "Select Date"}
              {mode === "time" && "Select Time"}
              {mode === "datetime" && "Select Date & Time"}
            </Body>
            <Button onPress={handleIOSConfirm} variant="ghost">
              Done
            </Button>
          </View>

          {/* Picker */}
          <View className="shadow-sm overflow-hidden">
            <DateTimePicker
              value={tempValue || value || new Date()}
              mode={mode}
              display="spinner"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              themeVariant={colorScheme}
              // TODO: update this
              locale="vi-VI"
              textColor={textColor}
              style={{
                alignSelf: "center",
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <InputField
        label={label}
        value={formatDisplayValue(value)}
        placeholder={placeholder}
        editable={false}
        onPress={openPicker}
        hasError={!!error?.message}
        errorMessage={error?.message}
        suffix={
          <Pressable onPress={openPicker}>
            <CalendarIcon weight="duotone" size={24} />
          </Pressable>
        }
        supportText={supportText}
      />

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
              themeVariant={colorScheme}
            />
          )}
    </>
  );
};
