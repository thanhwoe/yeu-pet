import { withIconClassName } from "@/hocs/withIconClassName";
import { IReminder } from "@/interfaces";
import { date } from "@/utils";
import isEmpty from "lodash/isEmpty";
import {
  CheckCircleIcon,
  PencilIcon,
  ProhibitIcon,
  TrashIcon,
  XCircleIcon,
} from "phosphor-react-native";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Popup } from "@/components/Popup";
import { SwipeableWrapper } from "@/components/SwipeableWrapper";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { Body } from "@/components/ui/Typography";
import {
  ReminderStatusChip,
  ReminderTypeIcon,
} from "@/features/reminders/components/ReminderIcons";

const EditIcon = withIconClassName(PencilIcon);
const DeleteIcon = withIconClassName(TrashIcon);
const CompleteIcon = withIconClassName(CheckCircleIcon);
const SkipIcon = withIconClassName(ProhibitIcon);
const CancelIcon = withIconClassName(XCircleIcon);

interface ItemProps {
  item: IReminder;
  editing?: boolean;
  deleting?: boolean;
  actioning?: boolean;
  onEdit?: (item: IReminder) => void;
  onDelete?: (item: IReminder) => void;
  onComplete?: (item: IReminder) => void;
  onSkip?: (item: IReminder) => void;
  onCancelReminder?: (item: IReminder) => void;
}

export const AgendaItem = ({
  item,
  onDelete,
  onEdit,
  editing,
  deleting,
  actioning,
  onComplete,
  onSkip,
  onCancelReminder,
}: ItemProps) => {
  const [visible, setVisible] = useState<boolean>(false);

  if (isEmpty(item)) {
    return (
      <View className="flex-row mb-10 items-center p-20 bg-background-card">
        <Body>No Events Planned</Body>
      </View>
    );
  }

  const canChangeStatus = item.status === "pending";

  return (
    <>
      <SwipeableWrapper
        leftAction={{
          icon: <EditIcon className="text-grey-0" weight="bold" />,
          onPress: () => onEdit?.(item),
          width: 80,
          loading: editing,
        }}
        rightAction={{
          icon: <DeleteIcon className="text-grey-0" weight="bold" />,
          onPress: () => onDelete?.(item),
          width: 80,
          loading: deleting,
        }}
        style={{
          marginBottom: 10,
        }}
        swipeThreshold={60}
      >
        <View className="border border-line-tertiary bg-background-card">
          <TouchableOpacity
            onPress={() => setVisible(true)}
            accessibilityLabel={`Open ${item.title} reminder for ${item.pets.name}`}
            accessibilityRole="button"
            className="flex-row items-center py-20 px-20 gap-12"
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

          {canChangeStatus ? (
            <View className="flex-row gap-8 px-20 pb-16">
              <ReminderActionButton
                label="Done"
                disabled={actioning}
                icon={
                  <CompleteIcon
                    size={18}
                    className="text-icon-positive"
                    weight="fill"
                  />
                }
                onPress={() => onComplete?.(item)}
              />
              <ReminderActionButton
                label="Skip"
                disabled={actioning}
                icon={
                  <SkipIcon
                    size={18}
                    className="text-icon-primary-disabled"
                    weight="fill"
                  />
                }
                onPress={() => onSkip?.(item)}
              />
              <ReminderActionButton
                label="Cancel"
                disabled={actioning}
                icon={
                  <CancelIcon
                    size={18}
                    className="text-icon-negative"
                    weight="fill"
                  />
                }
                onPress={() => onCancelReminder?.(item)}
              />
              {actioning ? (
                <Spinner size={20} className="text-icon-primary" />
              ) : null}
            </View>
          ) : null}
        </View>
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

const ReminderActionButton = ({
  label,
  icon,
  disabled,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={`${label} reminder`}
    disabled={disabled}
    onPress={onPress}
    className="min-h-44 flex-1 flex-row items-center justify-center gap-6 rounded-14 bg-background-foreground px-10"
  >
    {icon}
    <Body variant="body3" weight="semiBold">
      {label}
    </Body>
  </TouchableOpacity>
);
