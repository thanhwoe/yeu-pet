import { useColorScheme } from "@/hooks/useColorScheme";
import { Button } from "../Button";

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();
  return (
    <Button
      wrapperClassName="mt-20"
      onPress={() => {
        setColorScheme(colorScheme === "dark" ? "light" : "dark");
      }}
    >
      {colorScheme}
    </Button>
  );
}
