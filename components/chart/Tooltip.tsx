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
    x: number;
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
        setNativeProps(dateValueRef, {
          text: `${pressState.x.value.value} December, 2025`,
        });
        setNativeProps(valueRef, {
          text: `120.000đ`,
        });
      }
    }
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
      Math.min(rawX - w / 2, SCREEN_WIDTH - w - PADDING)
    );

    return {
      transform: [{ translateX: clampedX }, { translateY: 0 }],
    };
  });

  return (
    <Animated.View
      style={animatedStyle}
      onLayout={onLayout}
      className={cn("absolute px-3 py-2 gap-2 bg-grey-5 rounded-xl invisible", {
        visible: isPressActive,
      })}
      pointerEvents="none"
    >
      <AnimatedText
        ref={dateValueRef}
        defaultValue="0"
        maxFontSizeMultiplier={24 / 12}
        className="font-normal text-text-secondary text-[12px]"
      />
      <AnimatedText
        ref={valueRef}
        defaultValue="0"
        maxFontSizeMultiplier={24 / 12}
        className="font-normal text-text-primary text-center text-[12px]"
      />
    </Animated.View>
  );
};
