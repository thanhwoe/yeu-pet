import {
  isPossiblePhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import { useCallback, useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { TextInputProps, View } from "react-native";
import { InputField } from "../ui/InputField";
import { Body } from "../ui/Typography";
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
        const phoneFormatted =
          parsePhoneNumberFromString(phone)?.formatNational() || "";
        setPhoneNumber(phoneFormatted);
      } else {
        setPhoneNumber(trim);
      }
      onChange(phone);
    },
    [onChange, phoneCode],
  );

  return (
    <View aria-invalid={!!error?.message} className="gap-4">
      <Body variant="body3">{label}</Body>
      <View className="flex-row gap-8">
        <CountryCodeSelector
          value={phoneCode}
          onSelect={handleSelectCountryCode}
        />
        <InputField
          className="flex-1"
          hasError={!!error?.message}
          onChangeText={handleFormatPhoneNumber}
          onBlur={(e) => {
            onBlur?.(e);
            handleBlur();
          }}
          inputMode="tel"
          value={phoneNumber}
          defaultValue={value}
          {...props}
        />
      </View>
      {error?.message && (
        <Body variant="body4" className="text-text-negative">
          {error?.message}
        </Body>
      )}
    </View>
  );
};
