import { cn } from "@/utils";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { ScrollView, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { Text } from "../ui/Text";

interface IPetPickerControllerProps<T extends FieldValues> {
  label?: string;
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
}

export const PetPickerController = <T extends FieldValues>({
  name,
  control,
  label,
  rules,
  ...props
}: IPetPickerControllerProps<T>) => {
  const {
    field: { value, onChange },
  } = useController({ name, control, rules });

  return (
    <View>
      {label && <Text>{label}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 py-2"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} className="items-center gap-2">
            <Avatar
              source={{ uri: "https://avatar.iran.liara.run/public/32" }}
              className={cn({
                "border-red-200": index === 0,
              })}
              variant="line"
              size="medium"
            />
            <Text variant="footnote">name</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
