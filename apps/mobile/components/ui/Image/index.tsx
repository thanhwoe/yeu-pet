import { ImageProps, Image as OrgImage } from "expo-image";
import { cssInterop } from "nativewind";
const ExpoImage = cssInterop(OrgImage, {
  className: {
    target: "style",
  },
});

export const Image = (props: ImageProps) => {
  return (
    <ExpoImage
      cachePolicy="disk"
      contentFit="cover"
      transition={300}
      {...props}
    />
  );
};
