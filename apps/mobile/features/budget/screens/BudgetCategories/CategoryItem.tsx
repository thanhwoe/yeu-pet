import { SwipeableWrapper } from "@/components/SwipeableWrapper";
import { Body } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { IBudgetCategory } from "@/interfaces";
import { hexToRgba } from "@/utils";
import { PencilSimpleIcon, TrashIcon } from "phosphor-react-native";
import { View } from "react-native";

const EditIcon = withIconClassName(PencilSimpleIcon);
const DeleteIcon = withIconClassName(TrashIcon);
const ACTION_WIDTH = 68;

interface IProps {
  data: IBudgetCategory;
  onEdit?: (item: IBudgetCategory) => void;
  onDelete?: (item: IBudgetCategory) => void;
}

export const CategoryItem = ({ data, onEdit, onDelete }: IProps) => {
  const accessibilityHint =
    onEdit && onDelete
      ? "Swipe right to edit or left to delete"
      : onEdit
        ? "Swipe right to edit"
        : onDelete
          ? "Swipe left to delete"
          : undefined;

  return (
    <SwipeableWrapper
      disabled={!onEdit && !onDelete}
      className="overflow-hidden rounded-20 border border-line-subtle bg-background-surface shadow-sm"
      leftAction={
        onEdit
          ? {
              icon: (
                <EditIcon
                  className="text-status-info-icon"
                  size={18}
                  weight="bold"
                />
              ),
              onPress: () => onEdit(data),
              width: ACTION_WIDTH,
              disabled: !onEdit,
              className:
                "border-r border-status-info-border bg-status-info-surface",
              contentClassName: "gap-4",
              accessibilityLabel: `Edit ${data.name} category`,
            }
          : undefined
      }
      rightAction={
        onDelete
          ? {
              icon: (
                <DeleteIcon
                  className="text-status-danger-icon"
                  size={18}
                  weight="bold"
                />
              ),
              onPress: () => onDelete(data),
              width: ACTION_WIDTH,
              disabled: !onDelete,
              className:
                "border-l border-status-danger-border bg-status-danger-surface",
              contentClassName: "gap-4",
              accessibilityLabel: `Delete ${data.name} category`,
            }
          : undefined
      }
      swipeThreshold={72}
      springConfig={{ damping: 18, stiffness: 180, mass: 0.9 }}
    >
      <View
        accessible
        accessibilityLabel={`${data.name} budget category`}
        accessibilityHint={accessibilityHint}
        className="min-h-72 flex-row items-center gap-12 bg-background-surface px-14 py-12"
      >
        <View
          className="size-44 items-center justify-center rounded-14 bg-feature-budget-surface"
          style={{
            backgroundColor: hexToRgba(data.color, 0.16),
          }}
        >
          <Body variant="body2">{data.emoji}</Body>
        </View>
        <Body
          variant="body3"
          weight="semiBold"
          numberOfLines={1}
          className="min-w-0 flex-1 text-text-primary"
        >
          {data.name}
        </Body>
      </View>
    </SwipeableWrapper>
  );
};
