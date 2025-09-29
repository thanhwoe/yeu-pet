import { Skeleton } from "@/components/Skeleton";
import { Text } from "@/components/ui/Text";
import { View } from "react-native";
import { GAP, ITEM_WIDTH } from "../util";

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
              marginBottom: GAP,
              marginLeft: index % 3 === 0 ? GAP : GAP / 2,
              marginRight: index % 3 === 2 ? GAP : GAP / 2,
              borderRadius: 10,
            }}
          />
        ))}
      </View>
    );
  }
  return (
    <View className="flex-1 items-center justify-center px-4">
      <View className="space-y-4 gap-2">
        <Text className="text-center font-medium">No Photos Yet</Text>
        <Text className="text-center">
          You haven&apos;t uploaded any photos yet. Start capturing and sharing
          your pet&apos;s moments!
        </Text>
      </View>
    </View>
  );
};
