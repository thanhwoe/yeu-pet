import { Body } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IBudgetCategory } from "@/interfaces";
import { hexToRgba } from "@/utils";
import { PencilSimpleIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";

const EditIcon = withIconClassName(PencilSimpleIcon);
interface IProps {
  data: IBudgetCategory;
  onEdit?: (item: IBudgetCategory) => void;
}

export const CategoryItem = ({ data, onEdit }: IProps) => {
  return (
    <View className="bg-background-card px-16 rounded-14 flex-row py-16 gap-16 items-center">
      <View
        className="size-44 items-center justify-center rounded-12"
        style={{
          backgroundColor: hexToRgba(data.color, 0.5),
        }}
      >
        <Body>{data.emoji}</Body>
      </View>
      <Body className="flex-1">{data.name}</Body>
      <TouchableOpacity
        className="p-8 rounded-8 bg-background-card-highlight"
        onPress={() => onEdit?.(data)}
      >
        <EditIcon className="text-icon-primary" />
      </TouchableOpacity>
    </View>
  );
};
