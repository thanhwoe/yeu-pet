import { Skeleton } from "@/components/Skeleton";
import { StateView } from "@/components/ui/StateView";
import {
  GRID_COLUMNS,
  GRID_GAP,
  GRID_ITEM_RADIUS,
  ITEM_WIDTH,
} from "@/features/photos/utils";
import { useTranslation } from "react-i18next";
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
  title,
  description,
  onRetry,
}: IProps) => {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("photos.empty.defaultTitle");
  const resolvedDescription =
    description ?? t("photos.empty.defaultDescription");

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
        title={t("photos.empty.loadErrorTitle")}
        description={t("photos.empty.loadErrorDescription")}
        actionLabel={t("common.retry")}
        onAction={onRetry}
        className="mt-32"
      />
    );
  }

  return (
    <StateView
      variant="empty"
      title={resolvedTitle}
      description={resolvedDescription}
      className="mt-32"
    />
  );
};
