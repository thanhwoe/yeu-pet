import { Image } from "@/components/ui/Image";
import {
  GRID_COLUMNS,
  GRID_GAP,
  GRID_ITEM_RADIUS,
  ITEM_WIDTH,
} from "@/features/photos/utils";
import { IPhoto } from "@/interfaces";
import { memo, useCallback, useMemo } from "react";
import { ImageStyle, Pressable } from "react-native";

interface PhotoItemProps {
  data: IPhoto;
  index: number;
  onPress: (index: number) => void;
}
export const PhotoItem = memo(({ data, index, onPress }: PhotoItemProps) => {
  const columnIndex = index % GRID_COLUMNS;

  const thumbnailStyle = useMemo<ImageStyle>(
    () => ({
      height: ITEM_WIDTH,
      width: ITEM_WIDTH,
      marginBottom: GRID_GAP,
      marginRight: columnIndex === GRID_COLUMNS - 1 ? 0 : GRID_GAP,
      borderRadius: GRID_ITEM_RADIUS,
    }),
    [columnIndex],
  );

  const accessibilityLabel = useMemo(() => {
    const ownerFirstName =
      data.accounts.firstName ?? data.accounts.first_name ?? "";
    const ownerLastName =
      data.accounts.lastName ?? data.accounts.last_name ?? "";
    const ownerName = `${ownerFirstName} ${ownerLastName}`.trim();

    if (ownerName) {
      return `Open photo by ${ownerName}`;
    }

    return data.caption ? `Open photo: ${data.caption}` : "Open photo";
  }, [data.accounts, data.caption]);
  const handlePress = useCallback(() => onPress(index), [index, onPress]);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={4}
      onPress={handlePress}
    >
      <Image
        style={thumbnailStyle}
        source={{ uri: data.url }}
        transition={120}
      />
    </Pressable>
  );
});

PhotoItem.displayName = "PhotoItem";
