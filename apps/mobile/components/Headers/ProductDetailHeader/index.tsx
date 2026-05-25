import { CartButton } from "@/components/CartButton";
import { CART_KEY } from "@/constants/query-keys";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useColorScheme } from "@/hooks/useColorScheme";
import { getCartCountQuery } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { cssInterop } from "nativewind";
import { ArrowLeftIcon } from "phosphor-react-native";
import { useEffect, useMemo } from "react";
import { ColorValue, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const AnimatedLinearGradient = cssInterop(
  Animated.createAnimatedComponent(LinearGradient),
  {
    className: {
      target: "style",
    },
  },
);

const BackIcon = withIconClassName(ArrowLeftIcon);

interface ProductDetailHeaderProps {
  navigation: {
    goBack: () => void;
  };
}

export const ProductDetailHeader = ({
  navigation,
}: ProductDetailHeaderProps) => {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const translateX = useSharedValue(-400);
  const { data } = useQuery({
    queryKey: CART_KEY.count(),
    queryFn: getCartCountQuery,
  });

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(400, {
          duration: 2000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Easing mượt hơn
        }),
        withTiming(-400, {
          duration: 0,
        }),
      ),
      -1,
      false,
    );
  }, []);

  const { base, overlay } = useMemo(() => {
    const light: Record<
      string,
      readonly [ColorValue, ColorValue, ...ColorValue[]]
    > = {
      base: ["#FFF1E2", "#FFE4CC"],
      overlay: ["#FFF1E2", "#FFD4B3", "#FFC299", "#FFE4CC"],
    };
    const dark: Record<
      string,
      readonly [ColorValue, ColorValue, ...ColorValue[]]
    > = {
      base: ["#1a1625", "#5a5278"],
      overlay: ["#1a1625", "#2d2540", "#433a5c", "#5a5278"],
    };

    return colorScheme === "dark" ? dark : light;
  }, [colorScheme]);

  return (
    <View className="pb-safe-offset-4">
      <View style={StyleSheet.absoluteFill}>
        <AnimatedLinearGradient
          colors={base}
          style={[StyleSheet.absoluteFill]}
        />
        <AnimatedLinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={overlay}
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ translateX }, { skewX: "-20deg" }],
              opacity: 0.7,
            },
          ]}
        />
      </View>
      <View className="absolute left-0 right-0 flex-row justify-between items-center pt-safe-offset-2 px-5">
        <TouchableOpacity
          onPress={navigation.goBack}
          className="bg-white p-2 rounded-full self-start"
        >
          <BackIcon
            size={20}
            weight="bold"
            className="text-icon-primary-foreground"
          />
        </TouchableOpacity>
        <CartButton
          variant="circle"
          size={20}
          badge={data?.data.count}
          onPress={() => router.navigate("/cart")}
        />
      </View>
    </View>
  );
};
