import { Skeleton } from "@/components/Skeleton";
import { View } from "react-native";

export const SectionSkeleton = () => {
  return (
    <View className="-mx-5">
      <Skeleton className="h-96 w-full" />
      <View className="gap-4 py-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </View>
    </View>
  );
};
