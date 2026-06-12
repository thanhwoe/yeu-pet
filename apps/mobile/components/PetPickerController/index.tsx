import { IPet } from "@/interfaces";
import { cn } from "@/utils";
import { PawPrintIcon } from "phosphor-react-native";
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  RegisterOptions,
  useController,
} from "react-hook-form";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Avatar } from "../ui/Avatar";
import { Body } from "../ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";

const PawPrint = withIconClassName(PawPrintIcon);

interface IPetPickerControllerProps<T extends FieldValues, TTransformedValues = T> {
  label?: string;
  name: Path<T>;
  control: Control<T, any, TTransformedValues>;
  rules?: RegisterOptions<T>;
  options: IPet[];
  allowNone?: boolean;
}

export const PetPickerController = <
  T extends FieldValues,
  TTransformedValues = T,
>({
  name,
  control,
  label,
  rules,
  options,
  allowNone,
}: IPetPickerControllerProps<T, TTransformedValues>) => {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
    rules,
    defaultValue: (allowNone ? null : options[0]?.id) as PathValue<T, Path<T>>,
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
        {allowNone ? (
          <TouchableOpacity
            onPress={() => {
              onChange(null);
            }}
            className="max-w-68 items-center gap-4"
          >
            <View
              className={cn(
                "items-center justify-center rounded-full border-[1.5px] border-line-secondary-inverse p-4",
                {
                  "border-line-secondary": !value,
                },
              )}
            >
              <View className="size-56 items-center justify-center rounded-full bg-background-surface-muted">
                <PawPrint size={24} className="text-icon-secondary" weight="duotone" />
              </View>
            </View>
            <Body variant="body3" numberOfLines={1}>
              No pet
            </Body>
          </TouchableOpacity>
        ) : null}
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
