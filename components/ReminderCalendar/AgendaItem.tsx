import { IReminder } from "@/interfaces";
import { date } from "@/utils";
import isEmpty from "lodash/isEmpty";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Popup } from "../Popup";
import { ReminderStatusChip, ReminderTypeIcon } from "../ReminderIcons";
import { SwipeableWrapper } from "../SwipeableWrapper";
import { Avatar } from "../ui/Avatar";
import { Body } from "../ui/Typography";

interface ItemProps {
  item: IReminder;
  editing?: boolean;
  deleting?: boolean;
  onEdit?: (item: IReminder) => void;
  onDelete?: (item: IReminder) => void;
}

export const AgendaItem = ({
  item,
  onDelete,
  onEdit,
  editing,
  deleting,
}: ItemProps) => {
  const [visible, setVisible] = useState<boolean>(false);

  if (isEmpty(item)) {
    return (
      <View className="flex-row mb-10 items-center p-20 bg-background-foreground">
        <Body>No Events Planned</Body>
      </View>
    );
  }

  return (
    <>
      <SwipeableWrapper
        leftAction={{
          text: "Edit",
          onPress: () => onEdit?.(item),
          width: 80,
          loading: editing,
        }}
        rightAction={{
          text: "Delete",
          onPress: () => onDelete?.(item),
          width: 80,
          loading: deleting,
        }}
        style={{
          marginBottom: 10,
        }}
        swipeThreshold={60}
      >
        <TouchableOpacity
          onPress={() => setVisible(true)}
          className="flex-row items-center py-20 px-20 border border-line-tertiary bg-background-foreground gap-12"
        >
          <View>
            <Avatar
              source={{
                uri: item.pets.avatarUrl ?? "",
              }}
              size="large"
            />
          </View>

          <View className="flex-1 gap-4">
            <View className="flex-row items-center gap-8">
              <ReminderTypeIcon type={item.type} size={16} />
              <Body weight="bold" numberOfLines={1}>
                {item.title}
              </Body>
            </View>
            <Body
              variant="body2"
              numberOfLines={2}
              className="text-text-tertiary-inverse"
            >
              {item.pets.name}
            </Body>
          </View>

          <View className="items-end gap-4">
            <ReminderStatusChip status={item.status} />
            <Body weight="bold">
              {date(item.scheduledAt).format("hh:mm A")}
            </Body>
          </View>
        </TouchableOpacity>
      </SwipeableWrapper>

      <Popup
        visible={visible}
        onCancel={() => setVisible(false)}
        title={item.title}
        description={item.description ?? "No description yet"}
        variant="alert"
        cancelLabel="Close"
      />
    </>
  );
};
