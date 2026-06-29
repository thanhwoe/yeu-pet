import { Skeleton } from "@/components/Skeleton";
import { Text } from "@/components/ui/Text";
import { withIconClassName } from "@/hocs/withIconClassName";
import { ChatCircleTextIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

const CommentIcon = withIconClassName(ChatCircleTextIcon);

export const CommentEmptyState = ({ isLoading }: { isLoading: boolean }) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <View className="gap-12 py-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-72 rounded-18" />
        ))}
      </View>
    );
  }

  return (
    <View
      style={styles.emptyState}
      className="items-center justify-center gap-10 px-24"
    >
      <View className="h-52 w-52 items-center justify-center rounded-full bg-background-card">
        <CommentIcon size={26} className="text-icon-secondary" />
      </View>
      <Text variant="heading" className="text-center font-medium">
        {t("photos.comments.emptyTitle")}
      </Text>
      <Text variant="body2" color="tertiary" className="text-center">
        {t("photos.comments.emptyDescription")}
      </Text>
    </View>
  );
};

export const CommentErrorState = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-10 px-24">
      <CommentIcon size={32} className="text-icon-secondary" />
      <Text variant="heading" className="text-center font-medium">
        {t("photos.comments.errorTitle")}
      </Text>
      <Text variant="body2" color="tertiary" className="text-center">
        {t("photos.comments.errorDescription")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    minHeight: 360,
  },
});
