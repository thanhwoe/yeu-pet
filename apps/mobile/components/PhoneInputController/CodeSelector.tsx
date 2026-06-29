import { PHONE_CODE, PHONE_CODE_PREFIX } from "@/constants/phoneCodes";
import { cn } from "@/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { BottomSheet } from "../ui/BottomSheet";
import { Body } from "../ui/Typography";

interface CountryCodeSelectorProps {
  onSelect: (code: string) => void;
  value?: string;
}

export const CountryCodeSelector = ({
  onSelect,
  value,
}: CountryCodeSelectorProps) => {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);

  const renderItem = ({ item }: { item: (typeof PHONE_CODE)[0] }) => (
    <View
      className={cn("py-12 px-16 rounded-12", {
        "bg-background-secondary": `+${item.code}` === value,
      })}
    >
      <Body
        onPress={() => {
          onSelect(PHONE_CODE_PREFIX + item.code);
          setShowOptions(false);
        }}
      >
        {t(item.countryKey)} (+{item.code})
      </Body>
    </View>
  );

  return (
    <View className="border border-line-secondary-inverse items-center justify-center px-12 bg-background-foreground rounded-8">
      <Body
        onPress={() => setShowOptions(true)}
        variant="body2"
        className="text-text-tertiary-inverse"
      >
        {value}
      </Body>
      <BottomSheet
        visible={showOptions}
        onDismiss={() => setShowOptions(false)}
        useScrollView
        titleElement={
          <Body weight="semiBold">{t("common.selectCountryCode")}</Body>
        }
      >
        <FlatList
          scrollEnabled={false}
          contentContainerClassName="px-2"
          data={PHONE_CODE}
          renderItem={renderItem}
        />
      </BottomSheet>
    </View>
  );
};
