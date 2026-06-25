import { SwipeableWrapper } from "@/components/SwipeableWrapper";
import { Body } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IBudgetTransaction } from "@/interfaces";
import { hexToRgba } from "@/utils";
import { formatBudgetCurrency } from "@/utils/budget";
import { PencilSimpleIcon, TrashIcon } from "phosphor-react-native";
import { memo, useMemo } from "react";
import { View } from "react-native";

const EditIcon = withIconClassName(PencilSimpleIcon);
const DeleteIcon = withIconClassName(TrashIcon);
const HEX_COLOR_REGEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const ACTION_WIDTH = 68;

interface IProps {
  data: IBudgetTransaction;
  onEdit?: (data: IBudgetTransaction) => void;
  onDelete?: (data: IBudgetTransaction) => void;
  deleting?: boolean;
  editing?: boolean;
}

export const TransactionItem = memo(
  ({ data, onDelete, onEdit, deleting, editing }: IProps) => {
    const description = data.description?.trim() || "Pet-care expense";
    const categoryName = data.budgetCategories.name?.trim();
    const petName = data.pets?.name?.trim();
    const amountLabel = formatBudgetCurrency(data.amount, { expense: true });

    const metadata = useMemo(
      () => [categoryName, petName].filter(Boolean).join(" · "),
      [categoryName, petName],
    );

    const categoryTint = useMemo(() => {
      const color = data.budgetCategories.color?.trim();

      if (!color || !HEX_COLOR_REGEX.test(color)) {
        return undefined;
      }

      return hexToRgba(color, 0.16);
    }, [data.budgetCategories.color]);

    return (
      <SwipeableWrapper
        disabled={!onEdit && !onDelete}
        className="overflow-hidden rounded-20 border border-line-subtle bg-background-surface shadow-sm"
        leftAction={
          onEdit
            ? {
                textClassName: "text-status-info-text",
                icon: (
                  <EditIcon
                    className="text-status-info-icon"
                    size={18}
                    weight="bold"
                  />
                ),
                onPress: () => onEdit(data),
                width: ACTION_WIDTH,
                loading: editing,
                disabled: deleting,
                className:
                  "border-r border-status-info-border bg-status-info-surface",
                contentClassName: "gap-4",
                accessibilityLabel: `Edit ${description}`,
              }
            : undefined
        }
        rightAction={
          onDelete
            ? {
                textClassName: "text-status-danger-text",
                icon: (
                  <DeleteIcon
                    className="text-status-danger-icon"
                    size={18}
                    weight="bold"
                  />
                ),
                onPress: () => onDelete(data),
                width: ACTION_WIDTH,
                loading: deleting,
                disabled: editing,
                className:
                  "border-l border-status-danger-border bg-status-danger-surface",
                contentClassName: "gap-4",
                accessibilityLabel: `Delete ${description}`,
              }
            : undefined
        }
        swipeThreshold={72}
        springConfig={{ damping: 18, stiffness: 180, mass: 0.9 }}
      >
        <View className="min-h-72 flex-row items-center gap-12 bg-background-surface px-14 py-12">
          <View
            className="size-44 items-center justify-center rounded-14 bg-feature-budget-surface"
            style={categoryTint ? { backgroundColor: categoryTint } : undefined}
          >
            <Body variant="body2">{data.budgetCategories.emoji}</Body>
          </View>
          <View className="min-w-0 flex-1 gap-2">
            <Body
              variant="body3"
              weight="semiBold"
              numberOfLines={1}
              className="text-text-primary"
            >
              {description}
            </Body>
            {!!metadata && (
              <Body
                variant="body5"
                numberOfLines={1}
                className="text-text-muted"
              >
                {metadata}
              </Body>
            )}
          </View>
          <View className="min-w-88 items-end" style={{ maxWidth: 136 }}>
            <Body
              variant="body4"
              weight="bold"
              numberOfLines={1}
              adjustsFontSizeToFit
              className="text-right text-status-danger-text"
            >
              {amountLabel}
            </Body>
          </View>
        </View>
      </SwipeableWrapper>
    );
  },
);

TransactionItem.displayName = "TransactionItem";
