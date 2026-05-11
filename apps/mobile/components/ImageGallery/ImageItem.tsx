import React, { useState } from "react";
import { useWindowDimensions } from "react-native";
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
} from "react-native-reanimated";
import { fitContainer } from "react-native-zoom-toolkit";
import { Image } from "../ui/Image";

type GalleryImageProps = {
  uri: string;
  index: number;
  activeIndex: SharedValue<number>;
};

export const ImageItem: React.FC<GalleryImageProps> = ({
  uri,
  index,
  activeIndex,
}) => {
  const { width, height } = useWindowDimensions();
  const [downScale, setDownScale] = useState<boolean>(true);

  const [resolution, setResolution] = useState<{
    width: number;
    height: number;
  }>({
    width: 1,
    height: 1,
  });

  const size = fitContainer(resolution.width / resolution.height, {
    width,
    height,
  });

  const wrapper = (active: number) => {
    if (index === active) setDownScale(false);
    if (index === active - 1 && !downScale) setDownScale(true);
    if (index === active + 1 && !downScale) setDownScale(true);
  };

  useAnimatedReaction(
    () => activeIndex.value,
    (value) => runOnJS(wrapper)(value),
    [activeIndex],
  );

  return (
    <Image
      source={{ uri }}
      style={size}
      allowDownscaling={downScale}
      onLoad={(e) => {
        setResolution({
          width: e.source.width,
          height: e.source.height,
        });
      }}
    />
  );
};
