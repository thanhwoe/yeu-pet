import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, View } from "react-native";

export function AppLoader() {
  const animation = useRef(new Animated.Value(1));

  useEffect(() => {
    Animated.timing(animation.current, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "#F97E1F",
            opacity: animation.current,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Animated.Image
          style={{ width: 115, height: 115, resizeMode: "cover" }}
          source={require("@/assets/images/splash-icon.png")}
          fadeDuration={0}
        />
        <View className="absolute top-[60%]">
          <ActivityIndicator />
        </View>
      </Animated.View>
    </View>
  );
}
