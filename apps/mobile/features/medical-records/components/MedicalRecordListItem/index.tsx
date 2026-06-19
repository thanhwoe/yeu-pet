import { Body } from "@/components/ui/Typography";
import { MedicalRecordStatusChip } from "@/features/medical-records/components/MedicalRecordStatusChip";
import { MedicalRecordType } from "@/features/medical-records/components/MedicalRecordType";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IMedicalRecord } from "@/interfaces";
import { cn, date } from "@/utils";
import { DotsThreeVerticalIcon, FileTextIcon } from "phosphor-react-native";
import { memo, useCallback } from "react";
import { GestureResponderEvent, TouchableOpacity, View } from "react-native";

const MoreIcon = withIconClassName(DotsThreeVerticalIcon);
const RecordIcon = withIconClassName(FileTextIcon);

interface MedicalRecordListItemProps {
  record: IMedicalRecord;
  onPress?: () => void;
  onMorePress?: () => void;
  className?: string;
}

export const MedicalRecordListItem = memo(
  ({ record, onPress, onMorePress, className }: MedicalRecordListItemProps) => {
    const handlePress = useCallback(() => {
      onPress?.();
    }, [onPress]);

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
          "flex-row items-center gap-12 rounded-20 border border-line-subtle bg-background-surface px-14 py-14 shadow-sm",
          className,
        )}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${record.title}, ${date(record.date).format("L")}, ${record.attachmentStatus}`}
        disabled={!onPress}
      >
        <View className="h-42 w-42 items-center justify-center rounded-14 bg-feature-medical-surface">
          <RecordIcon size={20} className="text-feature-medical-accent" />
        </View>

        <View className="min-w-0 flex-1 gap-7">
          <View className="flex-row items-start justify-between gap-10">
            <Body
              weight="semiBold"
              numberOfLines={1}
              className="min-w-0 flex-1"
            >
              {record.title}
            </Body>
            <MedicalRecordStatusChip status={record.attachmentStatus} />
          </View>

          <View className="flex-row items-center gap-8">
            <MedicalRecordType type={record.recordType} />
            <Body variant="body4" className="text-text-muted">
              {date(record.date).format("L")}
            </Body>
          </View>
        </View>

        {!!onMorePress && (
          <View className="items-center justify-center">
            <TouchableOpacity
              onPress={handleMorePress}
              accessibilityRole="button"
              accessibilityLabel={`More options for ${record.title}`}
              className="h-44 w-36 items-center justify-center rounded-full"
            >
              <MoreIcon
                size={22}
                className="text-icon-secondary"
                weight="bold"
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

MedicalRecordListItem.displayName = "MedicalRecordListItem";
