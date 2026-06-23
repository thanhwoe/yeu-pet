import { SwipeableWrapper } from "@/components/SwipeableWrapper";
import { Body } from "@/components/ui/Typography";
import {
  ReminderStatusChip,
  ReminderTypeIcon,
} from "@/features/reminders/components/ReminderIcons";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IReminder } from "@/interfaces";
import { cn } from "@/utils";
import {
  formatReminderRepeat,
  formatReminderTime,
  REMINDER_TYPE_LABELS,
} from "@/utils/reminder";
import { ClockIcon, PencilIcon, TrashIcon } from "phosphor-react-native";
import { Pressable, View } from "react-native";

const EditIcon = withIconClassName(PencilIcon);
const DeleteIcon = withIconClassName(TrashIcon);
const Clock = withIconClassName(ClockIcon);

interface ItemProps {
  item: IReminder;
  editing?: boolean;
  deleting?: boolean;
  onPress?: (item: IReminder) => void;
  onEdit?: (item: IReminder) => void;
  onDelete?: (item: IReminder) => void;
}

export const AgendaItem = ({
  item,
  onDelete,
  onEdit,
  onPress,
  editing,
  deleting,
}: ItemProps) => {
  const isMuted = item.status === "cancelled";
  const petName = item.pets?.name ?? "No pet";
  const repeatSummary = formatReminderRepeat(
    item.repeatFrequency,
    item.repeatUntil,
  );

  return (
    <SwipeableWrapper
      leftAction={{
        icon: <EditIcon className="text-status-success-icon" weight="bold" />,
        onPress: () => onEdit?.(item),
        width: 80,
        loading: editing,
      }}
      rightAction={{
        icon: <DeleteIcon className="text-status-danger-icon" weight="bold" />,
        onPress: () => onDelete?.(item),
        width: 80,
        loading: deleting,
      }}
      style={{ marginBottom: 12 }}
      swipeThreshold={60}
    >
      <View
        className={cn(
          "rounded-20 border border-line-subtle bg-background-card px-14 py-14",
          isMuted && "opacity-80",
        )}
      >
        <Pressable
          onPress={() => onPress?.(item)}
          accessibilityLabel={`Open ${item.title} reminder for ${petName}`}
          accessibilityRole="button"
          className="flex-row gap-12"
        >
          <ReminderTypeIcon type={item.type} circle />

          <View className="flex-1 gap-8">
            <View className="flex-row items-start justify-between gap-10">
              <View className="flex-1">
                <Body weight="bold" numberOfLines={1}>
                  {item.title}
                </Body>
                <Body
                  variant="body3"
                  numberOfLines={1}
                  className="text-text-muted"
                >
                  {petName} · {REMINDER_TYPE_LABELS[item.type]}
                </Body>
              </View>
              <ReminderStatusChip status={item.status} />
            </View>

            {item.description ? (
              <Body
                variant="body3"
                numberOfLines={1}
                className="text-text-muted"
              >
                {item.description}
              </Body>
            ) : null}

            <View className="flex-row flex-wrap items-center gap-x-10 gap-y-4">
              <View className="flex-row items-center gap-6">
                <Clock size={16} className="text-icon-secondary" />
                <Body variant="body3" weight="semiBold">
                  {formatReminderTime(item.scheduledAt)}
                </Body>
              </View>
              {item.repeatFrequency && item.repeatFrequency !== "none" ? (
                <Body variant="body4" className="text-text-muted">
                  {repeatSummary}
                </Body>
              ) : null}
            </View>
          </View>
        </Pressable>
      </View>
    </SwipeableWrapper>
  );
};
