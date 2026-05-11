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
import { Body } from "../ui/Typography";

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
    defaultValue: options[0].id as any,
  });

  return (
    <View className="gap-12">
      {label && (
        <Body variant="body3" weight="semiBold">
          {label}
        </Body>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-20"
      >
        {options.map((item, index) => (
          <TouchableOpacity
            onPress={() => {
              onChange(item.id);
            }}
            key={index}
            className="items-center gap-4 max-w-68"
          >
            <Avatar
              source={{
                uri: item.avatarUrl ?? "",
              }}
              className={cn("border-line-secondary-inverse border-2", {
                "border-line-secondary": value === item.id,
              })}
              variant="line"
              size="large"
            />
            <Body variant="body3" numberOfLines={1}>
              {item.name}
            </Body>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
