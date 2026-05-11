import { withIconClassName } from "@/hocs/withIconClassName";
import { TrashIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";
import { Image } from "../ui/Image";
import { Body } from "../ui/Typography";

const RemoveIcon = withIconClassName(TrashIcon);

interface FileItemProps {
  name: string;
  uri: string;
  onRemove: () => void;
}

export const FileItem = ({ name, uri, onRemove }: FileItemProps) => (
  <View className="flex-row items-center gap-12 px-16 py-12 bg-background-secondary-pressed rounded-16">
    <Image source={{ uri }} className="size-40" />

    <View className="flex-1">
      <Body variant="body3" weight="semiBold" numberOfLines={1}>
        {name}
      </Body>
    </View>

    <TouchableOpacity
      onPress={onRemove}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      className="p-4"
    >
      <RemoveIcon size={24} weight="fill" className="text-icon-negative" />
    </TouchableOpacity>
  </View>
);
