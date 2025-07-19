import { PHONE_CODE, PHONE_CODE_PREFIX } from "@/constants/phoneCodes";
import { useState } from "react";
import { Text, TextInputProps, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { BottomSheet } from "../ui/BottomSheet";

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

  return (
    <View className="border-r border-gray-200 w-12 items-center">
      <Text onPress={() => setShowOptions(true)}>{value}</Text>
      <BottomSheet
        visible={showOptions}
        onDismiss={() => setShowOptions(false)}
        snapPoints={undefined}
        useScrollView={false}
      >
        <FlatList
          data={PHONE_CODE}
          renderItem={({ item }) => (
            <Text
              onPress={() => {
                onSelect(PHONE_CODE_PREFIX + item.code);
                setShowOptions(false);
              }}
            >
              {item.countryName}
            </Text>
          )}
        />
      </BottomSheet>
    </View>
  );
};
