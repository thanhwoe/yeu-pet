import { ReminderIcons } from "@/components/ReminderIcons";
import { SwipeableWrapper } from "@/components/SwipeableWrapper";
import { Text } from "@/components/ui/Text";
import { IBudgetTransaction } from "@/interfaces";
import { View } from "react-native";

interface IProps {
  data: IBudgetTransaction;
  onEdit?: (data: IBudgetTransaction) => void;
  onDelete?: (data: IBudgetTransaction) => void;
}

export const TransactionItem = ({ data, onDelete, onEdit }: IProps) => {
  return (
    <SwipeableWrapper
      leftAction={{
        text: "Edit",
        onPress: () => onEdit?.(data),
        width: 80,
      }}
      rightAction={{
        text: "Delete",
        onPress: () => onDelete?.(data),
        width: 80,
      }}
      swipeThreshold={60}
    >
      <View className="flex-row bg-background-white px-4 py-6 items-center justify-between">
        <View className="flex-row items-center gap-3 flex-shrink">
          <ReminderIcons type={data.type} />
          <Text className="flex-shrink" numberOfLines={2}>
            {data.content}
          </Text>
        </View>
        <Text className="text-text-negative font-semibold">-{data.amount}</Text>
      </View>
    </SwipeableWrapper>
  );
};
