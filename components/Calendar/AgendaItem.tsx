import { withIconClassName } from "@/hocs/withIconClassName";
import { IReminderInfo } from "@/interfaces";
import { cn, date } from "@/utils";
import isEmpty from "lodash/isEmpty";
import { PencilSimpleLineIcon, TrashIcon } from "phosphor-react-native";
import React, { useCallback } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { ReminderIcons } from "../ReminderIcons";
import { Image } from "../ui/Image";
import { Text } from "../ui/Text";
const EditIcon = withIconClassName(PencilSimpleLineIcon);
const DeleteIcon = withIconClassName(TrashIcon);

interface ItemProps {
  item: IReminderInfo;
  onEdit?: (item: IReminderInfo) => void;
  onDelete?: (item: IReminderInfo) => void;
}

export const AgendaItem = ({ item, onDelete, onEdit }: ItemProps) => {
  const itemPressed = useCallback(() => {
    Alert.alert(item.title, item.description);
  }, [item]);

  if (isEmpty(item)) {
    return (
      <View className="flex-row mb-5 items-center p-4 border border-line-tertiary rounded-2xl bg-white gap-4">
        <Text variant="body">No Events Planned Today</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={itemPressed}
      className="flex-row mb-2 items-center p-4 border border-line-tertiary rounded-2xl bg-white gap-4"
    >
      <Image
        source={{
          uri:
            item.petAvatar ||
            "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }}
        style={{
          width: 50,
          height: 80,
        }}
        className="rounded-lg"
      />

      <View className="flex-1 gap-1">
        <Text variant="body" className="font-semibold" numberOfLines={1}>
          {item.title}
        </Text>
        <Text variant="body2">{date(item.time).format("hh:mm A")}</Text>
        <Text
          variant="caption1"
          numberOfLines={2}
          className={cn({ hidden: !item.description })}
        >
          {item.description}
        </Text>
        <View className="flex-row items-center gap-1">
          <ReminderIcons type={item.type} size={12} />
          <Text variant="caption1">- {item.type}</Text>
        </View>
      </View>
      <View className="gap-4 items-end">
        <TouchableOpacity
          className="bg-background-screen p-2 rounded-full"
          onPress={onEdit?.bind(this, item)}
        >
          <EditIcon size={20} className="text-icon-primary" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-background-screen p-2 rounded-full"
          onPress={onDelete?.bind(this, item)}
        >
          <DeleteIcon size={20} className="text-icon-primary" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
