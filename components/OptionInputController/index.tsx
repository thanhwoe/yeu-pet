import { cn } from "@/utils";
import { useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { TextInput, TextInputProps, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { BottomSheet } from "../ui/BottomSheet";
import { Text } from "../ui/Text";

interface InputControllerProps<T extends FieldValues> extends TextInputProps {
  label: string;
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
  options: { label: string; value: string }[];
}

export const OptionInputController = <T extends FieldValues>({
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

  const [value, setValue] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const renderItem = ({ item }: { item: { label: string; value: string } }) => (
    <View
      className={cn("py-3 px-4 border-b border-gray-200", {
        "bg-orange-200": item.value === value,
      })}
    >
      <Text
        onPress={() => {
          onChange(item.value);
          setValue(item.label);
          setShowOptions(false);
        }}
      >
        {item.label}
      </Text>
    </View>
  );

  return (
    <View aria-invalid={!!error?.message} className="gap-1">
      <Text variant="caption1">{label}</Text>
      <View className="pl-3 flex-row border border-gray-200 rounded-lg px-1 py-2 gap-2 items-center">
        <TextInput
          defaultValue={defaultValue}
          value={value}
          className="py-1 flex-1"
          onBlur={onBlur}
          onPress={() => setShowOptions(true)}
          editable={false}
          {...props}
        />
      </View>
      <Text className="text-red-500" variant="footnote">
        {error?.message}
      </Text>
      <BottomSheet
        visible={showOptions}
        onDismiss={() => setShowOptions(false)}
        snapPoints={undefined}
        useScrollView
        stackBehavior="push"
      >
        <FlatList
          scrollEnabled={false}
          data={options}
          renderItem={renderItem}
        />
      </BottomSheet>
    </View>
  );
};
