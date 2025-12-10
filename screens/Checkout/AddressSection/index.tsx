import { BottomSheet } from "@/components/ui/BottomSheet";
import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { CaretDoubleRightIcon, MapPinIcon } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

const AddressIcon = withIconClassName(MapPinIcon);
const EditIcon = withIconClassName(CaretDoubleRightIcon);

export const AddressSection = () => {
  const [openBottomSheet, setOpenBottomSheet] = useState(false);

  return (
    <>
      <View className="border rounded-xl border-line-tertiary flex-row py-2 px-3 gap-2 bg-background-card-info">
        <AddressIcon size={20} weight="fill" className="text-icon-primary" />
        <View className="flex-1">
          <Text numberOfLines={1} className="font-semibold" variant="callout">
            Name - Phone
          </Text>
          <Text
            numberOfLines={2}
            variant="body2"
            className="text-text-secondary"
          >
            Address: Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Pariatur, quibusdam.
          </Text>
        </View>
        <Pressable onPress={() => setOpenBottomSheet(true)}>
          <EditIcon size={18} weight="bold" className="text-icon-tertiary" />
        </Pressable>
      </View>
      <BottomSheet
        visible={openBottomSheet}
        onDismiss={() => setOpenBottomSheet(false)}
        titleElement={<Text className="font-medium">Select address</Text>}
      >
        <View />
      </BottomSheet>
    </>
  );
};
