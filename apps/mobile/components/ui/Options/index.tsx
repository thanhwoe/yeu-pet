import { ReactNode } from "react";
import { FlatList } from "react-native";
import { Option } from "./option";

export interface ItemType<T> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: ReactNode;
  onPress?: () => void;
}

interface IProps<T> {
  data: ItemType<T>[];
  selected?: T;
  onSelect?: (data: ItemType<T>) => void;
}

export const Options = <T,>({ data, onSelect, selected }: IProps<T>) => {
  const renderItem = ({ item }: { item: ItemType<T> }) => (
    <Option<T>
      item={item}
      selected={item.value === selected}
      onSelect={onSelect}
    />
  );

  return (
    <FlatList
      contentContainerClassName="gap-12 px-20"
      scrollEnabled={false}
      data={data}
      renderItem={renderItem}
    />
  );
};
