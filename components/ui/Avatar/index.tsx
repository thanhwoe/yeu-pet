import { cn } from "@/utils";
import { Image as ExpoImage, ImageProps } from "expo-image";
import { cssInterop } from "nativewind";
import { TouchableOpacity } from "react-native";
import { avatarStyles, AvatarVariants, imageStyles } from "./styles";

const ImageStyleable = cssInterop(ExpoImage, {
  className: {
    target: "style",
  },
});

interface AvatarProps extends ImageProps, AvatarVariants {}
export const Avatar = ({
  variant,
  size,
  source,
  className,
  ...props
}: AvatarProps) => {
  return (
    <TouchableOpacity
      className={cn(avatarStyles({ variant, size, className }))}
    >
      <ImageStyleable
        className={cn(imageStyles({ size }))}
        cachePolicy="disk"
        contentFit="cover"
        transition={300}
        source={source}
        {...props}
      />
    </TouchableOpacity>
  );
};
