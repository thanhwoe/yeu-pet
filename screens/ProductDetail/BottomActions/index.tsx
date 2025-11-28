import { QuantityInput } from "@/components/QuantityInput";
import { Button } from "@/components/ui/Button";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useHeaderHeight } from "@react-navigation/elements";
import { BlurView } from "expo-blur";
import { PlusIcon, ShoppingCartSimpleIcon } from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  UIManager,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";

const AnimatedLayout = Animated.createAnimatedComponent(KeyboardAvoidingView);

const Plus = withIconClassName(PlusIcon);
const Cart = withIconClassName(ShoppingCartSimpleIcon);

interface IProps {
  loading?: boolean;
}

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const BottomActions = ({ loading }: IProps) => {
  const headerHeight = useHeaderHeight();
  const { colorScheme } = useColorScheme();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (loading) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
    }
  }, [loading]);

  if (loading) return null;

  return (
    <AnimatedLayout
      layout={LinearTransition}
      exiting={FadeOutDown}
      entering={FadeInDown}
      keyboardVerticalOffset={headerHeight}
      className="absolute left-0 right-0 bottom-0"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        tint={colorScheme}
        className="flex-1 flex-row pb-safe-offset-0 pt-3 gap-3 px-5"
      >
        <QuantityInput onChange={setQuantity} value={quantity} />
        <Button variant="secondary" className="bg-option-selected">
          <View>
            <Cart className="text-icon-highlight" />
            <View className="absolute left-[8px] top-[5px]">
              <Plus size={12} weight="bold" className="text-icon-highlight" />
            </View>
          </View>
        </Button>
        <Button className="flex-1">Buy Now</Button>
      </BlurView>
    </AnimatedLayout>
  );
};
