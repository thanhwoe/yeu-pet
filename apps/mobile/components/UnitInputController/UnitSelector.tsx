import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { BottomSheet } from "../ui/BottomSheet";
import { Options } from "../ui/Options";
import { Body } from "../ui/Typography";

interface CountryCodeSelectorProps {
  onSelect: (code: string) => void;
  value?: string;
  options: { label: string; value: string }[];
}

export const UnitSelector = ({
  onSelect,
  value,
  options,
}: CountryCodeSelectorProps) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleSelect = (data: (typeof options)[0]) => {
    onSelect(data.value);
    setShowOptions(false);
  };

  return (
    <>
      <TouchableOpacity
        className="px-12 items-center"
        onPress={() => setShowOptions(true)}
      >
        <Body weight="bold" variant="body2">
          {value}
        </Body>
      </TouchableOpacity>

      <BottomSheet
        visible={showOptions}
        onDismiss={() => setShowOptions(false)}
        useScrollView
        stackBehavior="push"
      >
        <Options data={options} selected={value} onSelect={handleSelect} />
      </BottomSheet>
    </>
  );
};
