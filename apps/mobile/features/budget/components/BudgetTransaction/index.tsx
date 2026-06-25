import { IBudgetTransaction } from "@/interfaces";
import { cn } from "@/utils";
import {
  formatBudgetCurrency,
  IBudgetTransactionSection,
} from "@/utils/budget";
import { memo } from "react";
import {
  SectionList,
  SectionListProps,
  TouchableOpacity,
  View,
} from "react-native";
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
  compactEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
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
    compactEmpty,
    emptyTitle = "No transactions yet",
    emptyDescription = "Add your first pet-care expense to start tracking this budget.",
    ...props
  }) => {
    return (
      <SectionList
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View className="mt-6 flex-row items-center justify-between gap-16 bg-background px-2 pt-4">
            <Body
              variant="body4"
              className="flex-1 text-text-muted"
              weight="semiBold"
              numberOfLines={1}
            >
              {section.date}
            </Body>
            <Body
              variant="body4"
              weight="semiBold"
              className="text-status-danger-text"
              numberOfLines={1}
            >
              {formatBudgetCurrency(section.totalAmount, { expense: true })}
            </Body>
          </View>
        )}
        contentContainerClassName={cn("gap-10", contentContainerClassName)}
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

          if (compactEmpty) {
            return (
              <TouchableOpacity
                activeOpacity={onAdd ? 0.82 : 1}
                disabled={!onAdd}
                accessibilityRole={onAdd ? "button" : undefined}
                accessibilityLabel={emptyTitle}
                onPress={onAdd}
                className="mt-4 rounded-20 border border-dashed border-line-subtle bg-background-surface px-16 py-14"
              >
                <Body weight="semiBold" className="text-text-primary">
                  {emptyTitle}
                </Body>
                <Body
                  variant="body4"
                  className="mt-4 text-text-muted"
                  numberOfLines={2}
                >
                  {emptyDescription}
                </Body>
              </TouchableOpacity>
            );
          }

          return (
            <StateView
              variant="empty"
              title={emptyTitle}
              description={emptyDescription}
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
