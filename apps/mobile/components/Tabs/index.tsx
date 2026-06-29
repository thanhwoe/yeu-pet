import { nativeShadows } from "@/theme/shadows";
import { cn } from "@/utils";
import React, { useEffect, useMemo, useState } from "react";
import { LayoutChangeEvent, Pressable, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Body } from "../ui/Typography";

const AnimatedView = Animated.createAnimatedComponent(View);

interface IProps {
  tabs: { title: string; value: number }[];
  active: number;
  onChange: (v: number) => void;
  className?: string;
  style?: ViewStyle;
}

const HORIZONTAL_PADDING = 4;
const ACTIVE_INSET = 4;

export const Tabs = ({ tabs, className, style, active, onChange }: IProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);

  const activeIndex = useMemo(() => {
    const index = tabs.findIndex((tab) => tab.value === active);
    return index >= 0 ? index : 0;
  }, [active, tabs]);

  const tabWidth =
    containerWidth > 0
      ? (containerWidth - HORIZONTAL_PADDING * 2) / tabs.length
      : 0;

  useEffect(() => {
    if (!tabWidth) return;

    translateX.value = withSpring(activeIndex * tabWidth, {
      damping: 20,
      stiffness: 120,
    });
  }, [activeIndex, tabWidth, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleLayout}
      className={cn(
        "w-full bg-background-foreground rounded-24 p-4 relative",
        className,
      )}
      style={style}
    >
      {tabWidth > 0 ? (
        <AnimatedView
          className="bg-background-primary"
          style={[
            {
              width: tabWidth,
              top: ACTIVE_INSET,
              bottom: ACTIVE_INSET,
              left: HORIZONTAL_PADDING,
              borderRadius: 24,
              position: "absolute",
              ...nativeShadows.floating,
            },
            animatedStyle,
          ]}
        />
      ) : null}

      <View className="flex-row">
        {tabs.map((tab) => {
          const isActive = active === tab.value;

          return (
            <Pressable
              key={tab.value}
              onPress={() => onChange(tab.value)}
              className="flex-1 items-center justify-center px-8 py-10"
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Body
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                className={cn("text-center", {
                  "text-text-primary-inverse": isActive,
                })}
              >
                {tab.title}
              </Body>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
