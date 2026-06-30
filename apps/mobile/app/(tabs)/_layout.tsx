import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { GestureResponderEvent, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Body } from "@/components/ui/Typography";
import { withIconClassName } from "@/hocs/withIconClassName";
import { useColorScheme } from "@/hooks/useColorScheme";
import { darkColorTheme, lightColorTheme } from "@/theme/colors";
import { nativeShadows } from "@/theme/shadows";
import { getColors } from "@/theme/utils";
import { cn } from "@/utils";
import { BottomTabBarButtonProps } from "expo-router/js-tabs";
import {
  CalendarHeartIcon,
  GearSixIcon,
  HandHeartIcon,
  HouseIcon,
  IconWeight,
  PawPrintIcon,
} from "phosphor-react-native";

const Calendar = withIconClassName(CalendarHeartIcon);
const Settings = withIconClassName(GearSixIcon);
const Home = withIconClassName(HouseIcon);
const Service = withIconClassName(PawPrintIcon);
const Sitter = withIconClassName(HandHeartIcon);

const isTabFocused = (props: BottomTabBarButtonProps) =>
  props["aria-selected"] === true ||
  String(props["aria-selected"]) === "true" ||
  props.accessibilityState?.selected === true;

const AnimatedTabButton = ({
  children,
  focused,
  label,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  testID,
}: {
  children: React.ReactNode;
  focused: boolean;
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: ((e: GestureResponderEvent) => void) | null;
  onPressIn?: ((e: GestureResponderEvent) => void) | null;
  onPressOut?: ((e: GestureResponderEvent) => void) | null;
  testID?: string;
}) => {
  const scale = useSharedValue(focused ? 1.05 : 1);
  const labelOpacity = useSharedValue(focused ? 1 : 0);
  const labelWidth = useSharedValue(focused ? 1 : 0);
  const containerWidth = useSharedValue(focused ? 80 : 40);
  const iconTranslateX = useSharedValue(focused ? -10 : 0);
  const backgroundOpacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
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
  }, [
    backgroundOpacity,
    containerWidth,
    focused,
    iconTranslateX,
    labelOpacity,
    labelWidth,
    scale,
  ]);

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
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const handlePressIn = (e: GestureResponderEvent) => {
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    onPressOut?.(e);
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress ?? undefined}
      testID={testID}
      accessibilityLabel={`${label} tab`}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      className="flex-1 justify-center items-center py-8"
    >
      <Animated.View
        style={containerAnimatedStyle}
        className="h-40 items-center justify-center overflow-hidden rounded-16"
      >
        <Animated.View
          style={[backgroundAnimatedStyle]}
          className="absolute inset-0 bg-background-secondary-highlight rounded-16"
        />

        <Animated.View
          style={[iconAnimatedStyle]}
          className="absolute items-center justify-center"
        >
          {children}
        </Animated.View>

        <Animated.View
          style={[labelAnimatedStyle]}
          className="absolute h-full items-center justify-center overflow-hidden"
        >
          <Body
            weight="semiBold"
            variant="body4"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
            className="text-center text-text-secondary"
          >
            {label}
          </Body>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

const iconProps = (
  props: BottomTabBarButtonProps,
): {
  size: number;
  weight: IconWeight;
  className: string;
} => ({
  size: 24,
  weight: isTabFocused(props) ? "fill" : "regular",
  className: cn("text-icon-secondary", {
    "text-icon-tertiary": isTabFocused(props),
  }),
});

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const themeColors = getColors(
    colorScheme === "dark" ? darkColorTheme : lightColorTheme,
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors["--background-surface"],
          borderTopColor: themeColors["--line-subtle"],
          borderTopWidth: 1,
          paddingTop: 20,
          paddingHorizontal: 10,
          ...nativeShadows.tabBar,
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
              focused={isTabFocused(props)}
              label="Home"
            >
              <Home {...iconProps(props)} />
            </AnimatedTabButton>
          ),
        }}
      />

      <Tabs.Screen
        name="(reminder)"
        options={{
          tabBarButton: (props) => (
            <AnimatedTabButton
              {...props}
              focused={isTabFocused(props)}
              label="Reminder"
            >
              <Calendar {...iconProps(props)} />
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
              focused={isTabFocused(props)}
              label="Service"
            >
              <Service {...iconProps(props)} />
            </AnimatedTabButton>
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="sitter"
        options={{
          tabBarButton: (props) => (
            <AnimatedTabButton
              {...props}
              focused={isTabFocused(props)}
              label="Sitter"
            >
              <Sitter {...iconProps(props)} />
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
              focused={isTabFocused(props)}
              label="Settings"
            >
              <Settings {...iconProps(props)} />
            </AnimatedTabButton>
          ),
        }}
      />
    </Tabs>
  );
}
