import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { Body } from "@/components/ui/Typography";
import { MedicalRecordListItem } from "@/features/medical-records/components/MedicalRecordListItem";
import { useMedicalRecordPreview } from "@/features/medical-records/hooks";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IMedicalRecord, IPet } from "@/interfaces";
import { cn } from "@/utils";
import { CaretDownIcon, FileTextIcon } from "phosphor-react-native";
import React, { memo, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const ExpandIcon = withIconClassName(CaretDownIcon);
const EmptyRecordIcon = withIconClassName(FileTextIcon);

const RECORD_ITEM_HEIGHT = 104;
const RECORD_LIST_VERTICAL_SPACE = 36;
const EMPTY_STATE_HEIGHT = 132;

interface MedicalRecordContainerProps {
  pet: IPet;
  onRecordPress?: (record: IMedicalRecord) => void;
  onMorePress?: (record: IMedicalRecord) => void;
  onSeeAllPress?: (pet: IPet) => void;
}

export const MedicalRecordContainer = memo<MedicalRecordContainerProps>(
  ({ pet, onRecordPress, onMorePress, onSeeAllPress }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Animated values
    const animatedHeight = useSharedValue(0);
    const chevronRotation = useSharedValue(0);
    const containerOpacity = useSharedValue(0);

    const { data: medicalRecords, isLoading } = useMedicalRecordPreview(
      pet.id,
      isExpanded,
    );

    const toggleExpand = () => {
      setIsExpanded((prev) => !prev);
    };

    useEffect(() => {
      if (isExpanded) {
        if (!isLoading) {
          // Expand
          chevronRotation.value = withSpring(180, {
            damping: 15,
            stiffness: 100,
          });

          const recordsHeight = medicalRecords?.data?.length
            ? medicalRecords.data.length * RECORD_ITEM_HEIGHT +
              RECORD_LIST_VERTICAL_SPACE
            : EMPTY_STATE_HEIGHT;

          animatedHeight.value = withSpring(recordsHeight, {
            damping: 20,
            stiffness: 90,
          });
          containerOpacity.value = withTiming(1, { duration: 300 });
        }
      } else {
        // Collapse
        chevronRotation.value = withSpring(0, {
          damping: 15,
          stiffness: 100,
        });

        animatedHeight.value = withTiming(0, { duration: 250 });
        containerOpacity.value = withTiming(0, { duration: 200 });
      }
    }, [
      isExpanded,
      isLoading,
      medicalRecords?.data?.length,
      chevronRotation,
      animatedHeight,
      containerOpacity,
    ]);

    // Animated styles
    const chevronAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          rotate: `${chevronRotation.value}deg`,
        },
      ],
    }));

    const dropdownAnimatedStyle = useAnimatedStyle(() => ({
      height: animatedHeight.value,
      opacity: containerOpacity.value,
      overflow: "hidden",
    }));

    return (
      <View className="mb-16">
        {/* Parent Header - Pet Info */}
        <TouchableOpacity
          className="flex-row items-center justify-between rounded-20 border border-line-subtle bg-background-surface p-14 shadow-sm"
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center flex-1 gap-16">
            <Avatar
              source={{
                uri: pet.avatarUrl ?? "",
              }}
            />
            <Body
              weight="semiBold"
              numberOfLines={1}
              className="min-w-0 flex-1"
            >
              {pet.name}
            </Body>
          </View>

          <TouchableOpacity
            className="mx-8 px-8 py-4"
            onPress={(event) => {
              event.stopPropagation();
              onSeeAllPress?.(pet);
            }}
          >
            <Body variant="body3" weight="semiBold" className="text-text-link">
              See all
            </Body>
          </TouchableOpacity>

          {isLoading ? (
            <Spinner size={24} className="text-icon-primary" />
          ) : (
            <Animated.View style={chevronAnimatedStyle}>
              <ExpandIcon size={24} className="text-icon-primary" />
            </Animated.View>
          )}
        </TouchableOpacity>

        {/* Dropdown List - Medical Records */}
        <View className="relative">
          <Animated.View style={dropdownAnimatedStyle}>
            {(medicalRecords?.data?.length ?? 0) > 0 ? (
              <View className="py-14">
                {medicalRecords?.data?.map((record, index) => (
                  <MedicalRecordItem
                    key={record.id}
                    record={record}
                    onPress={() => onRecordPress?.(record)}
                    onMorePress={() => onMorePress?.(record)}
                    isFirst={index === 0}
                    isLast={index === medicalRecords.data.length - 1}
                  />
                ))}
              </View>
            ) : (
              <View className="relative py-14">
                <View
                  className="absolute left-42 top-0 bottom-[50%] w-24 border-l-[3px] border-b-[3px] border-line-primary"
                  style={{ borderBottomLeftRadius: 16 }}
                />

                <View className="ml-68 mr-4 flex-row items-center gap-12 rounded-20 border border-line-subtle bg-background-surface px-14 py-14 shadow-sm">
                  <View className="h-42 w-42 items-center justify-center rounded-14 bg-feature-medical-surface">
                    <EmptyRecordIcon
                      size={21}
                      className="text-feature-medical-accent"
                    />
                  </View>

                  <View className="min-w-0 flex-1">
                    <Body variant="body3" weight="semiBold">
                      No medical records yet
                    </Body>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      </View>
    );
  },
);

MedicalRecordContainer.displayName = "MedicalRecordContainer";

interface MedicalRecordItemProps {
  record: IMedicalRecord;
  onPress: () => void;
  onMorePress: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const MedicalRecordItem: React.FC<MedicalRecordItemProps> = ({
  record,
  onPress,
  onMorePress,
  isFirst,
  isLast,
}) => {
  return (
    <View
      className={cn("relative mb-16", {
        "mb-0": isLast,
      })}
    >
      {/* Branch Curve */}
      <View
        className="absolute -top-16 left-42 bottom-[50%] w-24 border-l-[3px] border-b-[3px] border-line-primary"
        style={[
          {
            borderBottomLeftRadius: 16,
          },
        ]}
      />

      {!isLast && (
        <View
          className={cn(
            "absolute left-42 top-0 -bottom-16 w-[3px] bg-line-primary",
            {
              "-top-16": isFirst,
            },
          )}
        />
      )}

      <MedicalRecordListItem
        record={record}
        className="ml-68 mr-4"
        onPress={onPress}
        onMorePress={onMorePress}
      />
    </View>
  );
};
