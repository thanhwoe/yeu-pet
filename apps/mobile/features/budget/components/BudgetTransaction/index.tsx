import { IBudgetTransaction } from "@/interfaces";
import { cn } from "@/utils";
import { IBudgetTransactionSection } from "@/utils/budget";
import { memo } from "react";
import { SectionList, SectionListProps, View } from "react-native";
import { Skeleton } from "@/components/Skeleton";
import { StateView } from "@/components/ui/StateView";
import { Body } from "@/components/ui/Typography";
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
  error?: boolean;
  onRetry?: () => void;
  onAdd?: () => void;
}

export const BudgetTransaction = memo<IProps>(
  ({
    loading,
    contentContainerClassName,
    onEdit,
    onDelete,
    editing,
    deleting,
    error,
    onRetry,
    onAdd,
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

          if (error) {
            return (
              <StateView
                variant="error"
                title="Transactions could not load"
                description="Try again to refresh your pet-care spending."
                actionLabel="Retry"
                onAction={onRetry}
                className="mt-20"
              />
            );
          }

          return (
            <StateView
              variant="empty"
              title="No transactions yet"
              description="Add your first pet-care expense to start tracking this budget."
              actionLabel={onAdd ? "Add transaction" : undefined}
              onAction={onAdd}
              className="mt-20"
            />
          );
        }}
        showsVerticalScrollIndicator={false}
        {...props}
      />
    );
  },
);

BudgetTransaction.displayName = "BudgetTransaction";
