import { cn } from "@/utils";
import { TouchableOpacity } from "react-native";
import type { ItemType } from ".";
import { Body } from "../Typography";

interface IProps<T> {
  item: ItemType<T>;
  onSelect: (value: ItemType<T>) => void;
  selected?: boolean;
}

export const Option = <T,>({ item, onSelect, selected }: IProps<T>) => {
  return (
    <TouchableOpacity
      className={cn(
        "px-24 py-12 flex-row items-center bg-background-tertiary rounded-12",
        {
          "bg-background-secondary": selected,
        },
      )}
      onPress={() => onSelect(item)}
    >
      <Body>{item.label}</Body>
    </TouchableOpacity>
  );
};
