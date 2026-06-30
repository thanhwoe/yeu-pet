import { Heading } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import type { DrawerHeaderProps } from "expo-router/drawer";
import { DrawerActions } from "expo-router/react-navigation";
import { SlidersHorizontalIcon } from "phosphor-react-native";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

const FilterIcon = withIconClassName(SlidersHorizontalIcon);

export const ReminderHeader = ({ navigation }: DrawerHeaderProps) => {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-start justify-between gap-12 bg-background px-20 pb-16 pt-safe-offset-20">
      <View className="flex-1">
        <Heading variant="h4" weight="bold" className="text-text-primary">
          {t("reminders.screen.title")}
        </Heading>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("reminders.filters.title")}
        className="h-44 w-44 items-center justify-center rounded-full border border-line-subtle bg-background-surface"
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <FilterIcon size={20} className="text-icon-primary" />
      </Pressable>
    </View>
  );
};
