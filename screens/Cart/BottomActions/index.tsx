import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Text } from "@/components/ui/Text";
import { ICartResponse } from "@/interfaces";
import { Platform, UIManager, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";

interface IProps {
  loading?: boolean;
  cartSummary: ICartResponse["summary"];
  onToggleSelectAll: (value: boolean) => void;
}

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const BottomActions = ({
  loading,
  cartSummary,
  onToggleSelectAll,
}: IProps) => {
  return (
    <Animated.View
      layout={LinearTransition}
      exiting={FadeOutDown}
      entering={FadeInDown}
      className="absolute left-0 right-0 bottom-0 bg-background-white flex-1 flex-row items-center pb-safe-offset-0 pt-3 gap-3 px-5"
    >
      <Checkbox
        label="Select all"
        defaultValue={cartSummary.selected_all}
        key={String(cartSummary.selected_all)}
        onChange={onToggleSelectAll}
        labelClassName="text-text-secondary"
      />
      <View className="px-3">
        <Text className="font-bold text-text-link">
          {cartSummary.subtotal}đ
        </Text>
        <Text variant="body2" className="line-through text-text-secondary">
          {cartSummary.total}đ
        </Text>
      </View>
      <Button className="flex-1" loading={loading}>
        Checkout
      </Button>
    </Animated.View>
  );
};
