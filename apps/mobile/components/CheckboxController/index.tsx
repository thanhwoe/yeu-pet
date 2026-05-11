import { ComponentProps } from "react";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { View } from "react-native";
import { Checkbox } from "../ui/Checkbox";
import { Text } from "../ui/Text";

interface CheckboxControllerProps<T extends FieldValues>
  extends ComponentProps<typeof Checkbox> {
  label?: string;
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
}

export const CheckboxController = <T extends FieldValues>({
  name,
  control,
  rules,
  label,
  ...props
}: CheckboxControllerProps<T>) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <View aria-invalid={!!error?.message} className="gap-1">
      <View className="flex-row gap-3 items-center">
        {label && (
          <Text variant="subhead" className="font-semibold">
            {label}
          </Text>
        )}
        <Checkbox checked={value} onChange={onChange} {...props} />
      </View>
      <Text className="text-text-negative" variant="footnote">
        {error?.message}
      </Text>
    </View>
  );
};
