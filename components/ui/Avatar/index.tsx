import { cn } from "@/utils";
import { ImageProps } from "expo-image";
import { TouchableOpacity } from "react-native";
import { Image } from "../Image";
import { avatarStyles, AvatarVariants, imageStyles } from "./styles";

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
      disabled={!onPress}
    >
      <Image
        className={cn(imageStyles({ size, variant }))}
        source={source}
        {...props}
      />
    </TouchableOpacity>
  );
};
