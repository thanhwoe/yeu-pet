import { IPet } from "@/interfaces";
import { cn } from "@/utils";
import {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { Text } from "../ui/Text";

interface IPetPickerControllerProps<T extends FieldValues> {
  label?: string;
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
  options: IPet[];
}

export const PetPickerController = <T extends FieldValues>({
  name,
  control,
  label,
  rules,
  options,
  ...props
}: IPetPickerControllerProps<T>) => {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
    rules,
    defaultValue: options[0].pet_id as any,
  });

  const showAllButton = options.length > 1;

  return (
    <View>
      {label && <Text variant="footnote">{label}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 py-2"
      >
        {options.map((item, index) => (
          <TouchableOpacity
            onPress={() => {
              onChange(item.pet_id);
            }}
            key={index}
            className="items-center gap-2 max-w-[68px]"
          >
            <Avatar
              source={{
                uri:
                  item.avatar_url || "https://avatar.iran.liara.run/public/32",
              }}
              className={cn({
                "border-line-selected": value === item.pet_id,
              })}
              variant="line"
              size="medium"
            />
            <Text variant="footnote" numberOfLines={1}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
        {/* {showAllButton && (
          <TouchableOpacity
            onPress={() => onChange(null)}
            className="items-center gap-2 max-w-[68px]"
          >
            <Avatar
              source={{
                uri: "https://avatar.iran.liara.run/public/32",
              }}
              className={cn({
                "border-red-200": value === null,
              })}
              variant="line"
              size="medium"
            />
            <Text variant="footnote" numberOfLines={1}>
              All
            </Text>
          </TouchableOpacity>
        )} */}
      </ScrollView>
    </View>
  );
};
