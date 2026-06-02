import { nativeShadows } from "@/theme/shadows";
import { cn } from "@/utils";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Body } from "../ui/Typography";

const AnimatedView = Animated.createAnimatedComponent(View);

const SIZES = {
  medium: {
    width: 200,
  },
  large: {
    width: 300,
  },
};

interface IProps {
  tabs: { title: string; value: number }[];
  active: number;
  onChange: (v: number) => void;
  className?: string;
  size?: "medium" | "large";
}

export const Tabs = ({
  tabs,
  className,
  active,
  onChange,
  size = "medium",
}: IProps) => {
  const translateX = useSharedValue(0);

  const tabWidth = (SIZES[size].width - 8) / tabs.length;

  const handleTabPress = (v: number, index: number) => {
    onChange(v);
    translateX.value = withSpring(index * tabWidth, {
      damping: 20,
      stiffness: 100,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View
      className={cn(
        "bg-background-foreground rounded-24 p-4 relative",
        className,
      )}
      style={{
        width: SIZES[size].width,
      }}
    >
      <AnimatedView
        className="bg-background-primary"
        style={[
          {
            width: tabWidth,
            bottom: 6,
            borderRadius: 24,
            position: "absolute",
            top: 6,
            left: 4,
            ...nativeShadows.floating,
          },
          animatedStyle,
        ]}
      />

      {/* Tab Buttons */}
      <View className="flex-row">
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.title + index}
            onPress={() => handleTabPress(tab.value, index)}
            className="flex-1 items-center justify-center py-8"
          >
            <Body
              className={cn({
                "text-text-primary-inverse": active === tab.value,
              })}
            >
              {tab.title}
            </Body>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
