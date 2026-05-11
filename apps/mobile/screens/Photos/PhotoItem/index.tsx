import { Modal } from "@/components/Modal";
import { Image } from "@/components/ui/Image";
import { IPhoto } from "@/interfaces";
import { useState } from "react";
import { Pressable } from "react-native";
import { PhotoView } from "../PhotoView";
import { GAP, ITEM_WIDTH } from "../util";

interface PhotoItemProps {
  data: IPhoto;
  index: number;
  deleteAble?: boolean;
}
export const PhotoItem = ({ data, index, deleteAble }: PhotoItemProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Pressable onPress={() => setShowModal(true)}>
        <Image
          style={{
            height: ITEM_WIDTH,
            width: ITEM_WIDTH,
            marginBottom: GAP,
            marginLeft: index % 3 === 0 ? GAP : GAP / 2,
            marginRight: index % 3 === 2 ? GAP : GAP / 2,
            borderRadius: 10,
          }}
          source={{ uri: data.url }}
        />
      </Pressable>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        thumbnailFrame={{
          x: GAP + (index % 3) * (ITEM_WIDTH + GAP),
          y: GAP + Math.floor(index / 3) * (ITEM_WIDTH + GAP),
          width: ITEM_WIDTH,
          height: ITEM_WIDTH,
        }}
      >
        <PhotoView
          data={data}
          deleteAble={deleteAble}
          onDismiss={() => setShowModal(false)}
        />
      </Modal>
    </>
  );
};
