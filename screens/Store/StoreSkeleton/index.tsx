import { Skeleton } from "@/components/Skeleton";
import { View } from "react-native";

export const StoreSkeleton = () => {
  return (
    <View className="flex-row flex-wrap gap-4 py-4 px-5">
      {[...Array(6)].map((_, index) => (
        <Skeleton
          className="rounded-xl w-[46%]"
          key={index}
          style={{
            height: 236,
          }}
        />
      ))}
    </View>
  );
};
