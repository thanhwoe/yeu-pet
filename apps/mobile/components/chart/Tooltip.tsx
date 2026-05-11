import { cn } from "@/utils";
import { SCREEN_WIDTH } from "@gorhom/bottom-sheet";
import { LayoutChangeEvent, TextInput } from "react-native";
import Animated, {
  setNativeProps,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { ChartPressState } from "victory-native";

const AnimatedText = Animated.createAnimatedComponent(TextInput);

interface IProps {
  pressState: ChartPressState<{
    x: string;
    y: {
      value: number;
    };
  }>;
  isPressActive?: boolean;
}

const PADDING = 10;

export const Tooltip = ({ isPressActive, pressState }: IProps) => {
  const tooltipWidth = useSharedValue(0);
  const dateValueRef = useAnimatedRef<TextInput>();
  const valueRef = useAnimatedRef<TextInput>();

  useAnimatedReaction(
    () => pressState?.matchedIndex.value ?? 0,
    (matchedIndex, prevIndex) => {
      if (matchedIndex !== prevIndex) {
        const isDefault =
          pressState.x.value.value === "start" ||
          pressState.x.value.value === "end";
        const label = isDefault
          ? ""
          : new Date(pressState.x.value.value).toLocaleDateString();
        const value = isDefault
          ? ""
          : pressState.y.value.value.value.toLocaleString();

        setNativeProps(dateValueRef, {
          text: label,
          display: label ? "flex" : "none",
        });
        setNativeProps(valueRef, {
          text: value,
          display: label ? "flex" : "none",
        });
      }
    },
  );

  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    tooltipWidth.value = width;
  };

  const animatedStyle = useAnimatedStyle(() => {
    const rawX = pressState.x.position.value;
    const w = tooltipWidth.value;

    const clampedX = Math.max(
      PADDING,
      Math.min(rawX - w / 2, SCREEN_WIDTH - w - PADDING),
    );

    return {
      transform: [{ translateX: clampedX }, { translateY: 0 }],
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      onLayout={onLayout}
      className={cn(
        "absolute px-12 py-4 gap-4 bg-background-card-highlight rounded-8 invisible",
        {
          visible: isPressActive,
        },
      )}
      pointerEvents="none"
    >
      <AnimatedText
        ref={dateValueRef}
        defaultValue="0"
        maxFontSizeMultiplier={24 / 12}
        className="font-normal font- text-text-primary text-[12px] font-semiBold"
      />
      <AnimatedText
        ref={valueRef}
        defaultValue="0"
        maxFontSizeMultiplier={24 / 12}
        className="font-normal text-text-secondary text-center text-[12px] font-bold"
      />
    </Animated.View>
  );
};
