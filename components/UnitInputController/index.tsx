import { useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { TextInput, TextInputProps, View } from "react-native";
import { Text } from "../ui/Text";
import { UnitSelector } from "./UnitSelector";

interface InputControllerProps<T extends FieldValues> extends TextInputProps {
  label: string;
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
  options: { label: string; value: string }[];
}

export const UnitInputController = <T extends FieldValues>({
  name,
  control,
  rules,
  label,
  options,
  ...props
}: InputControllerProps<T>) => {
  const {
    field: { value: defaultValue, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control, rules });

  const [defaultVal, defaultUnit] = defaultValue
    ? defaultValue?.split?.(" ")
    : [];

  const [value, setValue] = useState(defaultVal ?? "");

  const [unit, setUnit] = useState(defaultUnit ?? options[0].value);

  const handleSelectCountryCode = (code: string) => {
    setUnit(code);
    onChange(`${value} ${code}`);
  };

  const handleFormatPhoneNumber = (val: string) => {
    setValue(val);

    onChange(`${val} ${unit}`);
  };

  return (
    <View aria-invalid={!!error?.message} className="gap-1">
      <Text variant="caption1">{label}</Text>
      <View className="pl-3 flex-row border border-line-primary rounded-lg px-1 py-2 gap-2 items-center">
        <TextInput
          defaultValue={defaultValue}
          value={value}
          className="py-1 flex-1"
          onChangeText={handleFormatPhoneNumber}
          onBlur={onBlur}
          {...props}
        />
        <UnitSelector
          options={options}
          value={unit}
          onSelect={handleSelectCountryCode}
        />
      </View>
      <Text className="text-text-negative" variant="footnote">
        {error?.message}
      </Text>
    </View>
  );
};
