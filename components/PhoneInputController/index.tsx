import parsePhoneNumber, { isPossiblePhoneNumber } from "libphonenumber-js";
import { useCallback, useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { TextInput, TextInputProps, View } from "react-native";
import { Text } from "../ui/Text";
import { CountryCodeSelector } from "./CodeSelector";

interface InputControllerProps<T extends FieldValues> extends TextInputProps {
  label: string;
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
}

export const PhoneInputController = <T extends FieldValues>({
  name,
  control,
  rules,
  label,
  onBlur,
  ...props
}: InputControllerProps<T>) => {
  const {
    field: { value, onChange, onBlur: handleBlur },
    fieldState: { error },
  } = useController({ name, control, rules });

  const [phoneNumber, setPhoneNumber] = useState("");

  const [phoneCode, setPhoneCode] = useState("+84");

  const handleSelectCountryCode = (code: string) => {
    setPhoneCode(code);
    onChange(code + phoneNumber);
  };

  const handleFormatPhoneNumber = useCallback(
    (val: string) => {
      const trim = val.replace(/[^0-9]/g, "");

      const phone = phoneCode + trim;
      if (isPossiblePhoneNumber(phone)) {
        const phoneFormatted = parsePhoneNumber(phone)?.formatNational() || "";
        setPhoneNumber(phoneFormatted);
      } else {
        setPhoneNumber(trim);
      }
      onChange(phone);
    },
    [onChange, phoneCode]
  );

  return (
    <View aria-invalid={!!error?.message} className="gap-1">
      <Text variant="caption1">{label}</Text>
      <View className="flex-row border border-line-primary rounded-lg px-1 py-2 gap-2 items-center">
        <CountryCodeSelector
          value={phoneCode}
          onSelect={handleSelectCountryCode}
        />
        <TextInput
          defaultValue={value}
          value={phoneNumber}
          className="py-1 flex-1 placeholder:text-text-secondary selection:text-text-link"
          onChangeText={handleFormatPhoneNumber}
          inputMode="tel"
          onBlur={(e) => {
            onBlur?.(e);
            handleBlur();
          }}
          {...props}
        />
      </View>
      <Text className="text-text-negative" variant="footnote">
        {error?.message}
      </Text>
    </View>
  );
};
