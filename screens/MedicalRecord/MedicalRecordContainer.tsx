import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { Body } from "@/components/ui/Typography";
import { MEDICAL_RECORDS_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IMedicalRecord, IPet } from "@/interfaces";
import { getMedicalRecordsByPetIdQuery } from "@/services";
import { cn, date } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { cva } from "class-variance-authority";
import { CaretDownIcon, DotsThreeVerticalIcon } from "phosphor-react-native";
import React, { memo, useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const ExpandIcon = withIconClassName(CaretDownIcon);
const MoreIcon = withIconClassName(DotsThreeVerticalIcon);

interface MedicalRecordContainerProps {
  pet: IPet;
  onRecordPress?: (record: IMedicalRecord) => void;
  onMorePress?: (record: IMedicalRecord) => void;
}

export const MedicalRecordContainer = memo<MedicalRecordContainerProps>(
  ({ pet, onRecordPress, onMorePress }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Animated values
    const animatedHeight = useSharedValue(0);
    const chevronRotation = useSharedValue(0);
    const containerOpacity = useSharedValue(0);

    const { data: medicalRecords, isLoading } = useQuery({
      queryKey: MEDICAL_RECORDS_KEY.list({ petId: pet.id, page: 1, limit: 20 }),
      queryFn: () =>
        getMedicalRecordsByPetIdQuery({ petId: pet.id, page: 1, limit: 20 }),
      enabled: isExpanded,
    });

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
            ? medicalRecords?.data?.length * 85 + 40 // 85px per item + padding
            : 60;

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
          className="flex-row items-center shadow-sm elevation justify-between rounded-16 p-16 bg-background-card-highlight"
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center flex-1 gap-16">
            <Avatar
              source={{
                uri: pet.avatarUrl ?? "",
              }}
            />
            <Body weight="semiBold">{pet.name}</Body>
          </View>

          {/* TODO: implement medical record list screen */}
          {/* <Body className="mx-8">See all</Body> */}

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
              <View className="py-16">
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
              <View className="py-16 items-center">
                <Body>No medical records yet</Body>
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
  const isProcessing = record.attachmentStatus === "processing";
  const isFailed = record.attachmentStatus === "failed";

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

      <TouchableOpacity
        className="flex-row bg-background-card rounded-16 p-16 ml-68 mr-16 elevation-sm shadow-sm"
        onPress={onPress}
        activeOpacity={0.7}
        disabled={isProcessing || isFailed}
      >
        <View className="flex-1 flex-row items-center justify-between">
          <View className="flex-1 mr-12">
            <Body weight="semiBold" numberOfLines={1}>
              {record.title}
            </Body>
            <Body variant="body3" className="text-text-primary-disabled">
              {date(record.date).format("L")}
            </Body>
          </View>
          <View className="flex-row items-center gap-8">
            <StatusChip status={record.attachmentStatus} />
            <TouchableOpacity onPress={onMorePress}>
              <MoreIcon size={24} className="text-icon-primary" weight="bold" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

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
