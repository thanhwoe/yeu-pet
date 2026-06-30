import { cn } from "@/utils";
import { useHeaderHeight } from "expo-router/react-navigation";
import { LinearGradient, LinearGradientProps } from "expo-linear-gradient";
import { cssInterop } from "nativewind";
import { KeyboardAvoidingView, Platform, UIManager } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";

const AnimatedLinearGradient = cssInterop(
  Animated.createAnimatedComponent(LinearGradient),
  {
    className: {
      target: "style",
    },
  }
);

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const BottomActionWrapper = ({
  children,
  className,
  ...props
}: Omit<LinearGradientProps, "colors">) => {
  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={headerHeight}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="absolute left-0 right-0 bottom-0"
    >
      <AnimatedLinearGradient
        colors={["#FFE4CC", "#FFF1E2", "#FFE4CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        layout={LinearTransition}
        exiting={FadeOutDown}
        entering={FadeInDown}
        className={cn("flex-1 pb-safe-offset-0 pt-3 gap-3 px-5", className)}
        {...props}
      >
        {children}
      </AnimatedLinearGradient>
    </KeyboardAvoidingView>
  );
};
