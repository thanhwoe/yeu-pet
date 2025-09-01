import { cn } from "@/utils";
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
    <View aria-invalid={!!error?.message} className="gap-1">
      {label && <Text variant="caption1">{label}</Text>}
      <View
        className={`flex-row px-3 justify-center border border-line-primary rounded-lg gap-2 ${isTextArea ? "py-3 items-start min-h-[100px]" : "py-2 items-center"
          }`}
      >
        <TextInput
          value={value}
          onChangeText={format ? (t) => onChange(format(t)) : onChange}
          onEndEditing={() => onChange(value?.trim())}
          autoCapitalize="none"
          className={cn('flex-1 placeholder:text-text-secondary selection:text-text-link py-1', {
            "py-0 text-top min-h-[80px]": isTextArea
          })}
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
      <Text className="text-text-negative" variant="footnote">
        {error?.message}
      </Text>
    </View>
  );
};
