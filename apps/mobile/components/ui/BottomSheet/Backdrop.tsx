import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { StyleSheet, TouchableWithoutFeedback } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

export const Backdrop = ({
  animatedIndex,
  onPress,
}: BottomSheetBackdropProps & { onPress?: () => void }) => {
  const fadeAnim = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [-1, 0],
      [0, 0.7],
      Extrapolation.CLAMP
    ),
  }));
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <Animated.View
        style={[
          { backgroundColor: "black", ...StyleSheet.absoluteFillObject },
          fadeAnim,
        ]}
      />
    </TouchableWithoutFeedback>
  );
};
