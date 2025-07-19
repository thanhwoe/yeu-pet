import { EyeClosedIcon, EyeIcon } from "phosphor-react-native";
import { useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "../ui/Text";

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
  ...props
}: InputControllerProps<T>) => {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control, rules });

  const [isHide, setIsHide] = useState(secureTextEntry);
  const onPressSecureIcon = () => setIsHide((pre) => !pre);

  const isTextArea = multiline || (numberOfLines && numberOfLines > 1);

  return (
    <View aria-invalid={!!error?.message} className="gap-1 mb-1">
      {label && <Text>{label}</Text>}
      <View
        className={`flex-row px-3 justify-center border border-gray-200 rounded-lg gap-2 ${
          isTextArea ? "py-3 items-start min-h-[100px]" : "py-2 items-center"
        }`}
      >
        <TextInput
          value={value}
          onChangeText={format ? (t) => onChange(format(t)) : onChange}
          onEndEditing={() => onChange(value?.trim())}
          autoCapitalize="none"
          className={`flex-1 ${
            isTextArea ? "py-0 text-top min-h-[80px]" : "py-1"
          }`}
          autoCorrect={false}
          onBlur={onBlur}
          secureTextEntry={isHide}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={isTextArea ? "top" : "center"}
          {...props}
        />
        {typeof secureTextEntry !== "undefined" && (
          <TouchableOpacity
            onPress={onPressSecureIcon}
            className={isTextArea ? "pt-1" : ""}
          >
            {isHide ? (
              <EyeClosedIcon size={18} color="black" />
            ) : (
              <EyeIcon size={18} color="black" />
            )}
          </TouchableOpacity>
        )}
      </View>
      <Text className="text-red-500" variant="footnote">
        {error?.message}
      </Text>
    </View>
  );
};
