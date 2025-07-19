import { useColorScheme } from "@/hooks/useColorScheme";
import { Pressable, View } from "react-native";
import { Text } from "../Text";

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();
  return (
    <View className="items-center justify-center" key={"toggle-" + colorScheme}>
      <Pressable
        onPress={() => {
          setColorScheme(colorScheme === "dark" ? "light" : "dark");
        }}
        className="opacity-80 bg-card"
      >
        <Text>{colorScheme}</Text>
      </Pressable>
    </View>
  );
}
