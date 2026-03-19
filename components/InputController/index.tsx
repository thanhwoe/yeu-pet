import { EyeClosedIcon, EyeIcon } from "phosphor-react-native";
import { useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { TextInputProps, TouchableOpacity } from "react-native";
import { InputField } from "../ui/InputField";

interface InputControllerProps<T extends FieldValues> extends TextInputProps {
  label?: string;
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
  format?: (value: string) => void;
}

export const InputController = <T extends FieldValues>({
  name,
  control,
  rules,
  format,
  label,
  secureTextEntry,
  multiline,
  numberOfLines,
  onBlur,
  ...props
}: InputControllerProps<T>) => {
  const {
    field: { value, onChange, onBlur: handleBlur },
    fieldState: { error },
  } = useController({ name, control, rules });

  const [isHide, setIsHide] = useState(secureTextEntry);
  const onPressSecureIcon = () => setIsHide((pre) => !pre);

  const isTextArea = multiline || (numberOfLines && numberOfLines > 1);
  return (
    <InputField
      label={label}
      multiline={Boolean(isTextArea)}
      value={value}
      onChangeText={format ? (t) => onChange(format(t)) : onChange}
      onEndEditing={() => onChange(value?.trim())}
      autoCapitalize="none"
      autoCorrect={false}
      onBlur={(e) => {
        onBlur?.(e);
        handleBlur();
      }}
      secureTextEntry={isHide}
      numberOfLines={numberOfLines}
      errorMessage={error?.message}
      hasError={!!error?.message}
      suffix={
        typeof secureTextEntry !== "undefined" ? (
          <TouchableOpacity onPress={onPressSecureIcon}>
            {isHide ? (
              <EyeClosedIcon size={18} color="black" />
            ) : (
              <EyeIcon size={18} color="black" />
            )}
          </TouchableOpacity>
        ) : undefined
      }
      {...props}
    />
  );
};
