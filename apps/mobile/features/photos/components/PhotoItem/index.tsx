import { Modal } from "@/components/Modal";
import { Image } from "@/components/ui/Image";
import { PhotoView } from "@/features/photos/components/PhotoView";
import {
  GRID_COLUMNS,
  GRID_GAP,
  GRID_ITEM_RADIUS,
  ITEM_WIDTH,
  SCREEN_HORIZONTAL_PADDING,
} from "@/features/photos/utils";
import { IPhoto } from "@/interfaces";
import { memo, useCallback, useMemo, useState } from "react";
import { ImageStyle, Pressable } from "react-native";

interface PhotoItemProps {
  data: IPhoto;
  index: number;
  deleteAble?: boolean;
}
export const PhotoItem = memo(({ data, index, deleteAble }: PhotoItemProps) => {
  const [showModal, setShowModal] = useState(false);
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

  const thumbnailFrame = useMemo(
    () => ({
      x: SCREEN_HORIZONTAL_PADDING + columnIndex * (ITEM_WIDTH + GRID_GAP),
      y: Math.floor(index / GRID_COLUMNS) * (ITEM_WIDTH + GRID_GAP),
      width: ITEM_WIDTH,
      height: ITEM_WIDTH,
    }),
    [columnIndex, index],
  );

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  return (
    <>
      <Pressable
        accessibilityLabel="Open photo"
        accessibilityRole="button"
        hitSlop={4}
        onPress={openModal}
      >
        <Image
          style={thumbnailStyle}
          source={{ uri: data.url }}
          transition={120}
        />
      </Pressable>

      <Modal
        visible={showModal}
        onClose={closeModal}
        thumbnailFrame={thumbnailFrame}
        presentation="fullscreen"
      >
        <PhotoView
          data={data}
          deleteAble={deleteAble}
          onDismiss={closeModal}
        />
      </Modal>
    </>
  );
});

PhotoItem.displayName = "PhotoItem";
