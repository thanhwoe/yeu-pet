import { SwipeableWrapper } from "@/components/SwipeableWrapper";
import { Body } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IBudgetTransaction } from "@/interfaces";
import { hexToRgba } from "@/utils";
import { PencilIcon, TrashIcon } from "phosphor-react-native";
import { Text, View } from "react-native";

const EditIcon = withIconClassName(PencilIcon);
const DeleteIcon = withIconClassName(TrashIcon);

interface IProps {
  data: IBudgetTransaction;
  onEdit?: (data: IBudgetTransaction) => void;
  onDelete?: (data: IBudgetTransaction) => void;
  deleting?: boolean;
  editing?: boolean;
}

export const TransactionItem = ({
  data,
  onDelete,
  onEdit,
  deleting,
  editing,
}: IProps) => {
  return (
    <SwipeableWrapper
      disabled={!onEdit && !onDelete}
      leftAction={{
        icon: <EditIcon className="text-grey-0" weight="bold" />,
        onPress: () => onEdit?.(data),
        width: 80,
        loading: editing,
        disabled: deleting,
      }}
      rightAction={{
        icon: <DeleteIcon className="text-grey-0" weight="bold" />,
        onPress: () => onDelete?.(data),
        width: 80,
        loading: deleting,
        disabled: editing,
      }}
      swipeThreshold={60}
    >
      <View className="flex-row bg-background-card min-h-80 px-16 py-12 gap-8 items-center">
        <View
          className="p-8 rounded-8"
          style={{
            backgroundColor: hexToRgba(data.budgetCategories.color, 0.5),
          }}
        >
          <Text>{data.budgetCategories.emoji}</Text>
        </View>
        <View className="flex-1 min-w-120">
          <Body numberOfLines={3}>{data.description}</Body>
        </View>
        <Body
          className="text-text-negative flex-shrink"
          numberOfLines={3}
          weight="bold"
        >
          -{Number(data.amount).toLocaleString()}
        </Body>
      </View>
    </SwipeableWrapper>
  );
};
