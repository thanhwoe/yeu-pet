import React, { ReactNode, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");

const AnimatedView = Animated.createAnimatedComponent(View);

interface IProps {
  tabs: { title: string; content: () => ReactNode; priority?: boolean }[];
}

export const Tabs = ({ tabs }: IProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const translateX = useSharedValue(0);

  const tabWidth = (screenWidth - 50) / tabs.length;

  const handleTabPress = (index: number) => {
    setActiveTab(index);
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
    <View className="flex-1 py-8">
      {/* Tab Container */}
      <View className="bg-white rounded-3xl p-1 mb-4 ">
        {/* Animated Background */}
        <AnimatedView
          className="bg-tab-selected"
          style={[
            {
              width: tabWidth,
              height: 42,
              borderRadius: 24,
              position: "absolute",
              top: 6,
              left: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            },
            animatedStyle,
          ]}
        />

        {/* Tab Buttons */}
        <View className="flex-row">
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.title + index}
              onPress={() => handleTabPress(index)}
              className="flex-1 items-center justify-center h-12"
            >
              <Text
                className={`font-semibold text-base ${
                  activeTab === index
                    ? "text-text-tab-selected"
                    : "text-text-secondary"
                }`}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content Area */}
      <View className="flex-1">{tabs[activeTab].content()}</View>
    </View>
  );
};
