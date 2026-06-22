import { Heading } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import type { DrawerHeaderProps } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { SlidersHorizontalIcon } from "phosphor-react-native";
import { Pressable, View } from "react-native";

const FilterIcon = withIconClassName(SlidersHorizontalIcon);

export const ReminderHeader = ({ navigation }: DrawerHeaderProps) => {
  return (
    <View className="flex-row items-start justify-between gap-12 bg-background px-20 pb-16 pt-safe-offset-20">
      <View className="flex-1">
        <Heading variant="h4" weight="bold" className="text-text-primary">
          My Reminders
        </Heading>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Filter reminders"
        className="h-44 w-44 items-center justify-center rounded-full border border-line-subtle bg-background-surface"
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <FilterIcon size={20} className="text-icon-primary" />
      </Pressable>
    </View>
  );
};
