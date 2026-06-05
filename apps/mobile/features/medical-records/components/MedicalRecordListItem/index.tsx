import { Body } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IMedicalRecord } from "@/interfaces";
import { cn, date } from "@/utils";
import { cva } from "class-variance-authority";
import { DotsThreeVerticalIcon } from "phosphor-react-native";
import { memo, useCallback } from "react";
import { GestureResponderEvent, TouchableOpacity, View } from "react-native";

const MoreIcon = withIconClassName(DotsThreeVerticalIcon);

interface MedicalRecordListItemProps {
  record: IMedicalRecord;
  onPress?: () => void;
  onMorePress?: () => void;
  className?: string;
}

export const MedicalRecordListItem = memo(({
  record,
  onPress,
  onMorePress,
  className,
}: MedicalRecordListItemProps) => {
  const isProcessing = record.attachmentStatus === "processing";
  const isFailed = record.attachmentStatus === "failed";

  const handlePress = useCallback(() => {
    if (isProcessing || isFailed) return;
    onPress?.();
  }, [isFailed, isProcessing, onPress]);

  const handleMorePress = useCallback(
    (event: GestureResponderEvent) => {
      event.stopPropagation();
      onMorePress?.();
    },
    [onMorePress],
  );

  return (
    <TouchableOpacity
      className={cn(
        "flex-row bg-background-card rounded-16 p-16 elevation-sm shadow-sm",
        className,
      )}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!onPress && !onMorePress}
    >
      <View className="flex-1 flex-row items-center justify-between">
        <View className="flex-1 mr-12 gap-4">
          <Body weight="semiBold" numberOfLines={1}>
            {record.title}
          </Body>
          <Body variant="body3" className="text-text-primary-disabled">
            {date(record.date).format("L")}
          </Body>
        </View>
        <View className="flex-row items-center gap-8">
          <StatusChip status={record.attachmentStatus} />
          <TouchableOpacity
            onPress={handleMorePress}
          >
            <MoreIcon size={24} className="text-icon-primary" weight="bold" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

MedicalRecordListItem.displayName = "MedicalRecordListItem";

const statusWrapperStyle = cva("px-12 py-6 rounded-18", {
  variants: {
    status: {
      ready: "bg-background-positive-foreground",
      processing: "bg-background-warning-foreground",
      failed: "bg-background-negative-foreground",
    },
  },
});
const statusTextStyle = cva("", {
  variants: {
    status: {
      ready: "text-text-positive",
      processing: "text-text-warning",
      failed: "text-text-negative",
    },
  },
});

const StatusChip = ({
  status,
}: {
  status: IMedicalRecord["attachmentStatus"];
}) => {
  return (
    <View className={statusWrapperStyle({ status })}>
      <Body variant="body3" className={statusTextStyle({ status })}>
        {status}
      </Body>
    </View>
  );
};
