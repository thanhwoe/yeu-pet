import { PHONE_CODE, PHONE_CODE_PREFIX } from "@/constants/phoneCodes";
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
}

export const CountryCodeSelector = ({
  onSelect,
  value,
  ...props
}: CountryCodeSelectorProps) => {
  const [showOptions, setShowOptions] = useState(false);

  const renderItem = ({ item }: { item: (typeof PHONE_CODE)[0] }) => (
    <View
      className={cn("py-3 px-4 border-b border-gray-200", {
        "bg-background-secondary": `+${item.code}` === value,
      })}
    >
      <Text
        onPress={() => {
          onSelect(PHONE_CODE_PREFIX + item.code);
          setShowOptions(false);
        }}
      >
        {item.countryName} (+{item.code})
      </Text>
    </View>
  );

  return (
    <View className="border-r border-line-primary w-12 items-center">
      <Text onPress={() => setShowOptions(true)} variant="body2">
        {value}
      </Text>
      <BottomSheet
        visible={showOptions}
        onDismiss={() => setShowOptions(false)}
        snapPoints={undefined}
        useScrollView
      >
        <FlatList
          scrollEnabled={false}
          data={PHONE_CODE}
          renderItem={renderItem}
        />
      </BottomSheet>
    </View>
  );
};
