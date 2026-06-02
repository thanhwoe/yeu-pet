import { useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { TextInputProps } from "react-native";
import { InputField } from "../ui/InputField";
import { UnitSelector } from "./UnitSelector";

interface InputControllerProps<T extends FieldValues, TTransformedValues = T>
  extends TextInputProps {
  label: string;
  name: Path<T>;
  control: Control<T, any, TTransformedValues>;
  rules?: RegisterOptions<T>;
  options: { label: string; value: string }[];
}

export const UnitInputController = <
  T extends FieldValues,
  TTransformedValues = T,
>({
  name,
  control,
  rules,
  label,
  options,
  onBlur,
  ...props
}: InputControllerProps<T, TTransformedValues>) => {
  const {
    field: { value: defaultValue, onChange, onBlur: handleBlur },
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
    <InputField
      label={label}
      defaultValue={defaultValue}
      value={value}
      onChangeText={handleFormatPhoneNumber}
      onBlur={(e) => {
        onBlur?.(e);
        handleBlur();
      }}
      hasError={!!error?.message}
      errorMessage={error?.message}
      suffix={
        <UnitSelector
          options={options}
          value={unit}
          onSelect={handleSelectCountryCode}
        />
      }
      {...props}
    />
  );
};
