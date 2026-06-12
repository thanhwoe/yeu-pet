import { Heading } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import type { DrawerHeaderProps } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { SlidersHorizontalIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";

const FilterIcon = withIconClassName(SlidersHorizontalIcon);

export const ReminderHeader = ({ navigation }: DrawerHeaderProps) => {
  return (
    <View className="flex-row items-center justify-between bg-background px-20 pt-safe">
      <Heading variant="h4" weight="bold" className="text-text-primary">
        My Reminders
      </Heading>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Filter reminders"
        className="h-44 w-44 items-center justify-center rounded-14 bg-action-secondary"
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      >
        <FilterIcon
          className="text-action-secondary-foreground"
          weight="bold"
        />
      </TouchableOpacity>
    </View>
  );
};
