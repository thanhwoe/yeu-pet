import { Skeleton } from "@/components/Skeleton";
import { StateView } from "@/components/ui/StateView";
import {
  GRID_COLUMNS,
  GRID_GAP,
  GRID_ITEM_RADIUS,
  ITEM_WIDTH,
} from "@/features/photos/utils";
import { View } from "react-native";

interface IProps {
  isLoading: boolean;
  isError?: boolean;
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const EmptyPhotos = ({
  isLoading,
  isError,
  title = "No photos yet",
  description = "Start capturing and sharing your pet's moments.",
  onRetry,
}: IProps) => {
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

  if (isError) {
    return (
      <StateView
        variant="error"
        title="Photos could not load"
        description="Try again to refresh these pet moments."
        actionLabel="Retry"
        onAction={onRetry}
        className="mt-32"
      />
    );
  }

  return (
    <StateView
      variant="empty"
      title={title}
      description={description}
      className="mt-32"
    />
  );
};
