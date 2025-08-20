import { cn } from "@/utils";
import { ReactNode, useState } from "react";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import {
  Keyboard,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { BottomSheet } from "../ui/BottomSheet";
import { Text } from "../ui/Text";

interface InputControllerProps<T extends FieldValues> extends TextInputProps {
  label: string;
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
  options: { label: string; value: string; icon?: ReactNode }[];
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

  const defaultLabel = options.find(
    (item) => item.value === defaultValue
  )?.label;

  const [value, setValue] = useState(defaultLabel ?? "");
  const [showOptions, setShowOptions] = useState(false);

  const renderItem = ({
    item,
  }: {
    item: { label: string; value: string; icon?: ReactNode };
  }) => (
    <TouchableOpacity
      className={cn(
        "flex-row gap-3 items-center py-3 px-5 border-b border-line-secondary",
        {
          "bg-option-selected": item.value === defaultValue,
        }
      )}
      onPress={() => {
        onChange(item.value);
        setValue(item.label);
        setShowOptions(false);
        onBlur();
      }}
    >
      <Text>{item.label}</Text>
      {item?.icon}
    </TouchableOpacity>
  );

  return (
    <View aria-invalid={!!error?.message} className="gap-1">
      <Text variant="caption1">{label}</Text>
      <View className="pl-3 flex-row border border-line-primary rounded-lg px-1 py-2 gap-2 items-center">
        <TextInput
          defaultValue={defaultValue}
          value={value}
          className="py-1 flex-1"
          onBlur={onBlur}
          onPress={() => {
            setShowOptions(true);
            Keyboard.dismiss();
          }}
          editable={false}
          {...props}
        />
      </View>
      <Text className="text-text-negative" variant="footnote">
        {error?.message}
      </Text>
      <BottomSheet
        visible={showOptions}
        onDismiss={() => setShowOptions(false)}
        snapPoints={undefined}
        titleElement={<Text className="font-medium">Select {label}</Text>}
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
