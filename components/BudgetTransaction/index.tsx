import { IBudgetTransaction } from "@/interfaces";
import { cn } from "@/utils";
import { IBudgetTransactionSection } from "@/utils/budget";
import { memo } from "react";
import { SectionList, SectionListProps, View } from "react-native";
import { Skeleton } from "../Skeleton";
import { Body } from "../ui/Typography";
import { TransactionItem } from "./TransactionItem";

interface IProps extends SectionListProps<
  IBudgetTransaction,
  IBudgetTransactionSection
> {
  loading?: boolean;
  onEdit?: (item: IBudgetTransaction) => void;
  onDelete?: (item: IBudgetTransaction) => void;
  deleting?: boolean;
  editing?: boolean;
}

export const BudgetTransaction = memo<IProps>(
  ({
    loading,
    contentContainerClassName,
    onEdit,
    onDelete,
    editing,
    deleting,
    ...props
  }) => {
    return (
      <SectionList
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View className="bg-background justify-between items-center flex-row">
            <Body
              variant="body2"
              className="text-text-link-disabled"
              weight="semiBold"
            >
              {section.date}
            </Body>
            <Body variant="body3" weight="bold" className="text-text-negative">
              Total: -{section.totalAmount.toLocaleString()}
            </Body>
          </View>
        )}
        contentContainerClassName={cn("gap-12", contentContainerClassName)}
        renderItem={({ item }) => (
          <TransactionItem
            data={item}
            onDelete={onDelete}
            onEdit={onEdit}
            deleting={deleting}
            editing={editing}
          />
        )}
        ListEmptyComponent={() => {
          if (loading) {
            return (
              <View className="gap-16 mt-20">
                <Skeleton
                  className="h-80"
                  backgroundClassName="bg-background-primary"
                />
                <Skeleton
                  className="h-80"
                  backgroundClassName="bg-background-primary"
                />
                <Skeleton
                  className="h-80"
                  backgroundClassName="bg-background-primary"
                />
              </View>
            );
          }
          return <Body center>No transaction added yet.</Body>;
        }}
        showsVerticalScrollIndicator={false}
        {...props}
      />
    );
  },
);

BudgetTransaction.displayName = "BudgetTransaction";
