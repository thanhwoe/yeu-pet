import { Skeleton } from "@/components/Skeleton";
import { Text } from "@/components/ui/Text";
import {
  GRID_COLUMNS,
  GRID_GAP,
  GRID_ITEM_RADIUS,
  ITEM_WIDTH,
} from "@/features/photos/utils";
import { View } from "react-native";

interface IProps {
  isLoading: boolean;
}

export const EmptyPhotos = ({ isLoading }: IProps) => {
  if (isLoading) {
    return (
      <View className="flex-row flex-wrap">
        {[...Array(9)].map((_, index) => (
          <Skeleton
            className=""
            key={index}
            style={{
              height: ITEM_WIDTH,
              width: ITEM_WIDTH,
              marginBottom: GRID_GAP,
              marginRight:
                index % GRID_COLUMNS === GRID_COLUMNS - 1 ? 0 : GRID_GAP,
              borderRadius: GRID_ITEM_RADIUS,
            }}
          />
        ))}
      </View>
    );
  }
  return (
    <View className="flex-1 items-center justify-center px-24 py-80">
      <View className="items-center gap-8 rounded-24 bg-background-card px-24 py-28">
        <Text variant="heading" className="text-center font-medium">
          No Photos Yet
        </Text>
        <Text variant="body2" color="tertiary" className="text-center">
          You haven&apos;t uploaded any photos yet. Start capturing and sharing
          your pet&apos;s moments!
        </Text>
      </View>
    </View>
  );
};
