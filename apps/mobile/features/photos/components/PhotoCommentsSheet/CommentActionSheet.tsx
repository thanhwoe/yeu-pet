import { BottomSheet } from "@/components/ui/BottomSheet";
import { Spinner } from "@/components/ui/Spinner";
import { Text } from "@/components/ui/Text";
import { Body } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { ChatCircleTextIcon, TrashIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";

const CommentIcon = withIconClassName(ChatCircleTextIcon);
const Trash = withIconClassName(TrashIcon);

interface CommentActionSheetProps {
  visible: boolean;
  canDelete: boolean;
  disabled: boolean;
  onDismiss: () => void;
  onDelete: () => void;
}

export const CommentActionSheet = ({
  visible,
  canDelete,
  disabled,
  onDismiss,
  onDelete,
}: CommentActionSheetProps) => {
  const { t } = useTranslation();

  return (
    <BottomSheet
      visible={visible}
      onDismiss={onDismiss}
      titleElement={
        <Body weight="semiBold">{t("photos.comments.actionSheetTitle")}</Body>
      }
      enableDynamicSizing
      stackBehavior="push"
    >
      <View className="gap-8 px-20 pb-8">
        {canDelete ? (
          <TouchableOpacity
            accessibilityLabel={t("photos.comments.deleteAccessibility")}
            accessibilityRole="button"
            activeOpacity={0.82}
            className="min-h-56 flex-row items-center gap-12 rounded-18 bg-status-danger-surface px-14 py-12"
            disabled={disabled}
            onPress={onDelete}
          >
            <View className="h-36 w-36 items-center justify-center rounded-full bg-background-surface">
              <Trash
                size={18}
                weight="bold"
                className="text-status-danger-icon"
              />
            </View>
            <View className="flex-1">
              <Text
                variant="body2"
                className="font-semibold text-status-danger-text"
              >
                {t("photos.comments.delete")}
              </Text>
            </View>
            {disabled && <Spinner size={18} />}
          </TouchableOpacity>
        ) : (
          <View className="items-center gap-8 px-16 py-20">
            <CommentIcon size={28} className="text-icon-secondary" />
            <Text variant="body2" color="tertiary" className="text-center">
              {t("photos.comments.noActions")}
            </Text>
          </View>
        )}
      </View>
    </BottomSheet>
  );
};
