import { Modal } from "@/components/Modal";
import { Image } from "@/components/ui/Image";
import { IPhoto } from "@/interfaces";
import { memo, useCallback, useMemo, useState } from "react";
import { ImageStyle, Pressable } from "react-native";
import { PhotoView } from "../PhotoView";
import { GAP, ITEM_WIDTH } from "../util";

interface PhotoItemProps {
  data: IPhoto;
  index: number;
  deleteAble?: boolean;
}
export const PhotoItem = memo(({ data, index, deleteAble }: PhotoItemProps) => {
  const [showModal, setShowModal] = useState(false);
  const columnIndex = index % 3;

  const thumbnailStyle = useMemo<ImageStyle>(
    () => ({
      height: ITEM_WIDTH,
      width: ITEM_WIDTH,
      marginBottom: GAP,
      marginLeft: columnIndex === 0 ? GAP : GAP / 2,
      marginRight: columnIndex === 2 ? GAP : GAP / 2,
      borderRadius: 10,
    }),
    [columnIndex],
  );

  const thumbnailFrame = useMemo(
    () => ({
      x: GAP + columnIndex * (ITEM_WIDTH + GAP),
      y: GAP + Math.floor(index / 3) * (ITEM_WIDTH + GAP),
      width: ITEM_WIDTH,
      height: ITEM_WIDTH,
    }),
    [columnIndex, index],
  );

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  return (
    <>
      <Pressable onPress={openModal}>
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
