import { cn } from "@/utils";
import { useState } from "react";
import { TextInputProps, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { BottomSheet } from "../ui/BottomSheet";
import { Text } from "../ui/Text";

interface CountryCodeSelectorProps
  extends Pick<TextInputProps, "onFocus" | "onBlur"> {
  onSelect: (code: string) => void;
  value?: string;
  options: { label: string; value: string }[];
}

export const UnitSelector = ({
  onSelect,
  value,
  options,
  ...props
}: CountryCodeSelectorProps) => {
  const [showOptions, setShowOptions] = useState(false);

  const renderItem = ({ item }: { item: { label: string; value: string } }) => (
    <View
      className={cn("py-3 px-4 border-b border-gray-200", {
        "bg-orange-200": item.value === value,
      })}
    >
      <Text
        onPress={() => {
          onSelect(item.value);
          setShowOptions(false);
        }}
      >
        {item.label}
      </Text>
    </View>
  );

  return (
    <View className="border-l border-gray-200 w-12 items-center">
      <Text onPress={() => setShowOptions(true)} variant="body2">
        {value}
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
