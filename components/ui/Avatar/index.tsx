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

interface AvatarProps extends ImageProps, AvatarVariants {
  onPress?: () => void;
}
export const Avatar = ({
  variant,
  size,
  source,
  className,
  onPress,
  ...props
}: AvatarProps) => {
  return (
    <TouchableOpacity
      className={cn(avatarStyles({ variant, size, className }))}
      onPress={onPress}
    >
      <ImageStyleable
        className={cn(imageStyles({ size, variant }))}
        cachePolicy="disk"
        contentFit="cover"
        transition={300}
        source={source}
        {...props}
      />
    </TouchableOpacity>
  );
};
