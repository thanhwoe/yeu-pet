import { BottomSheet } from "@/components/ui/BottomSheet";
import { Spinner } from "@/components/ui/Spinner";
import { Body, Heading } from "@/components/ui/Typography";
import {
  ReminderStatusChip,
  ReminderTypeIcon,
} from "@/features/reminders/components/ReminderIcons";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IReminder } from "@/interfaces";
import { cn } from "@/utils";
import {
  formatReminderDate,
  formatReminderRepeat,
  formatReminderTime,
  REMINDER_TYPE_LABELS,
} from "@/utils/reminder";
import {
  CheckCircleIcon,
  ProhibitIcon,
  XCircleIcon,
} from "phosphor-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

const DoneIcon = withIconClassName(CheckCircleIcon);
const SkipIcon = withIconClassName(ProhibitIcon);
const CancelIcon = withIconClassName(XCircleIcon);

interface ReminderDetailSheetProps {
  reminder?: IReminder;
  visible: boolean;
  actioning?: boolean;
  onDismiss: () => void;
  onComplete: (item: IReminder) => Promise<void> | void;
  onSkip: (item: IReminder) => Promise<void> | void;
  onCancelReminder: (item: IReminder) => Promise<void> | void;
}

export const ReminderDetailSheet = ({
  reminder,
  visible,
  actioning,
  onDismiss,
  onComplete,
  onSkip,
  onCancelReminder,
}: ReminderDetailSheetProps) => {
  const runAction = async (
    action: (item: IReminder) => Promise<void> | void,
  ) => {
    if (!reminder) return;

    await action(reminder);
    onDismiss();
  };

  return (
    <BottomSheet
      name="reminder-detail"
      visible={visible && Boolean(reminder)}
      onDismiss={onDismiss}
      titleElement={<Body weight="semiBold">Reminder details</Body>}
      useScrollView
    >
      {reminder ? (
        <View className="gap-20 px-20">
          <View className="gap-14">
            <View className="flex-row items-start justify-between gap-12">
              <View className="flex-1 flex-row gap-12">
                <ReminderTypeIcon type={reminder.type} circle />
                <View className="flex-1 gap-4">
                  <Heading variant="h5" weight="bold" numberOfLines={2}>
                    {reminder.title}
                  </Heading>
                  <Body variant="body3" className="text-text-muted">
                    {reminder.pets?.name ?? "No pet"} ·{" "}
                    {REMINDER_TYPE_LABELS[reminder.type]}
                  </Body>
                </View>
              </View>
              <ReminderStatusChip status={reminder.status} />
            </View>

            {reminder.description ? (
              <Body variant="body3" className="text-text-muted">
                {reminder.description}
              </Body>
            ) : null}
          </View>

          <View className="gap-10 rounded-20 bg-background-surface-muted p-14">
            <DetailRow
              label="Date"
              value={formatReminderDate(reminder.scheduledAt)}
            />
            <DetailRow
              label="Time"
              value={formatReminderTime(reminder.scheduledAt)}
            />
            <DetailRow
              label="Repeat"
              value={formatReminderRepeat(
                reminder.repeatFrequency,
                reminder.repeatUntil,
              )}
            />
          </View>

          {reminder.status === "pending" ? (
            <View className="items-center gap-12 pt-4">
              <View className="flex-row flex-wrap justify-center gap-12">
                <DetailActionButton
                  label="Done"
                  disabled={actioning}
                  className="bg-status-success-surface"
                  textClassName="text-status-success-text"
                  icon={
                    <DoneIcon
                      size={17}
                      weight="fill"
                      className="text-status-success-icon"
                    />
                  }
                  onPress={() => void runAction(onComplete)}
                />
                <DetailActionButton
                  label="Skip"
                  disabled={actioning}
                  className="bg-background-surface-muted"
                  textClassName="text-text-muted"
                  icon={
                    <SkipIcon
                      size={17}
                      weight="fill"
                      className="text-icon-muted"
                    />
                  }
                  onPress={() => void runAction(onSkip)}
                />
                <DetailActionButton
                  label="Cancel"
                  disabled={actioning}
                  className="bg-status-danger-surface"
                  textClassName="text-status-danger-text"
                  icon={
                    <CancelIcon
                      size={17}
                      weight="fill"
                      className="text-status-danger-icon"
                    />
                  }
                  onPress={() => void runAction(onCancelReminder)}
                />
              </View>
              {actioning ? (
                <Spinner size={20} className="text-icon-primary" />
              ) : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </BottomSheet>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between gap-16">
    <Body variant="body3" className="text-text-muted">
      {label}
    </Body>
    <Body variant="body3" weight="semiBold" className="flex-1 text-right">
      {value}
    </Body>
  </View>
);

const DetailActionButton = ({
  label,
  icon,
  className,
  textClassName,
  disabled,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  className: string;
  textClassName: string;
  disabled?: boolean;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={`${label} reminder`}
    accessibilityState={{ disabled, busy: disabled }}
    disabled={disabled}
    onPress={onPress}
    className={cn(
      "min-h-44 flex-row items-center justify-center gap-6 rounded-14 px-14",
      disabled && "opacity-60",
      className,
    )}
  >
    {icon}
    <Body variant="body3" weight="semiBold" className={textClassName}>
      {label}
    </Body>
  </Pressable>
);
