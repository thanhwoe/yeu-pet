import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React from "react";
import { GestureResponderEvent, Pressable, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { withIconClassName } from "@/hocs/withIconClassName";
import { useColorScheme } from "@/hooks/useColorScheme";
import { cn } from "@/utils";
import {
  CalendarHeartIcon,
  GearSixIcon,
  HouseIcon,
  PawPrintIcon,
  ShoppingCartSimpleIcon,
} from "phosphor-react-native";

const Calendar = withIconClassName(CalendarHeartIcon);
const Settings = withIconClassName(GearSixIcon);
const Home = withIconClassName(HouseIcon);
const Service = withIconClassName(PawPrintIcon);
const Store = withIconClassName(ShoppingCartSimpleIcon);

// Custom animated tab button component
const AnimatedTabButton = ({
  children,
  focused,
  label,
  onPress,
}: {
  children: React.ReactNode;
  focused: boolean;
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
}) => {
  const scale = useSharedValue(focused ? 1.05 : 1);
  const labelOpacity = useSharedValue(focused ? 1 : 0);
  const labelWidth = useSharedValue(focused ? 1 : 0);
  const containerWidth = useSharedValue(focused ? 80 : 40);
  const iconTranslateX = useSharedValue(focused ? -10 : 0);
  const backgroundOpacity = useSharedValue(focused ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 0 : 1, {
      damping: 20,
      stiffness: 200,
    });

    labelOpacity.value = withTiming(focused ? 1 : 0, {
      duration: focused ? 300 : 150,
    });

    labelWidth.value = withSpring(focused ? 1 : 0, {
      damping: 15,
      stiffness: 120,
    });

    containerWidth.value = withSpring(focused ? 80 : 40, {
      damping: 15,
      stiffness: 120,
    });

    iconTranslateX.value = withSpring(focused ? -10 : 0, {
      damping: 20,
      stiffness: 150,
    });

    backgroundOpacity.value = withTiming(focused ? 1 : 0, {
      duration: 200,
    });
  }, [focused]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ scaleX: labelWidth.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    width: containerWidth.value,
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value * 0.12,
  }));

  const handlePress = (e: GestureResponderEvent) => {
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-1 justify-center items-center py-2"
    >
      <Animated.View
        style={[containerAnimatedStyle]}
        className="py-2 px-3 rounded-2xl h-10 items-center justify-center relative"
      >
        {/* Background highlight */}
        <Animated.View
          style={[backgroundAnimatedStyle]}
          className="absolute inset-0 bg-background-secondary rounded-2xl"
        />

        <View className="flex-row items-center justify-center h-full w-full relative">
          {/* Icon container - positioned absolutely for better control */}
          <Animated.View
            style={[iconAnimatedStyle]}
            className="absolute justify-center items-center z-10"
          >
            {children}
          </Animated.View>

          {/* Label container - positioned on the right */}
          <Animated.View
            style={[labelAnimatedStyle]}
            className="overflow-hidden absolute"
          >
            <Text
              className={`text-xs font-semibold whitespace-nowrap ${
                focused ? "text-text-link" : "text-text-secondary"
              }`}
            >
              {label}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export default function TabLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#1F2937" : "#FFFFFF",
          borderTopColor: colorScheme === "dark" ? "#374151" : "#E5E7EB",
          borderTopWidth: 1,
          paddingTop: 20,
          paddingHorizontal: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          tabBarButton: (props) => (
            <AnimatedTabButton
              {...props}
              focused={props["aria-selected"] || false}
              label="Home"
            >
              <Home
                weight={props["aria-selected"] ? "fill" : "regular"}
                className={cn("text-icon-secondary", {
                  "text-icon-primary": props["aria-selected"],
                })}
              />
            </AnimatedTabButton>
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          tabBarButton: (props) => (
            <AnimatedTabButton
              {...props}
              focused={props["aria-selected"] || false}
              label="Reminder"
            >
              <Calendar
                size={24}
                weight={props["aria-selected"] ? "fill" : "regular"}
                className={cn("text-icon-secondary", {
                  "text-icon-primary": props["aria-selected"],
                })}
              />
            </AnimatedTabButton>
          ),
        }}
      />

      <Tabs.Screen
        name="(service)"
        options={{
          tabBarButton: (props) => (
            <AnimatedTabButton
              {...props}
              focused={props["aria-selected"] || false}
              label="Service"
            >
              <Service
                size={24}
                weight={props["aria-selected"] ? "fill" : "regular"}
                className={cn("text-icon-secondary", {
                  "text-icon-primary": props["aria-selected"],
                })}
              />
            </AnimatedTabButton>
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          tabBarButton: (props) => (
            <AnimatedTabButton
              {...props}
              focused={props["aria-selected"] || false}
              label="Store"
            >
              <Store
                size={24}
                weight={props["aria-selected"] ? "fill" : "regular"}
                className={cn("text-icon-secondary", {
                  "text-icon-primary": props["aria-selected"],
                })}
              />
            </AnimatedTabButton>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarButton: (props) => (
            <AnimatedTabButton
              {...props}
              focused={props["aria-selected"] || false}
              label="Settings"
            >
              <Settings
                size={24}
                weight={props["aria-selected"] ? "fill" : "regular"}
                className={cn("text-icon-secondary", {
                  "text-icon-primary": props["aria-selected"],
                })}
              />
            </AnimatedTabButton>
          ),
        }}
      />
    </Tabs>
  );
}
