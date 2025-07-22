import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useUserInfoStore } from "@/stores/user-info";

export default function TabTwoScreen() {
  const { logout } = useUserInfoStore();
  return (
    <ScreenContainer>
      <Text>setting</Text>
      <Button onPress={logout}>Logout</Button>
      <ThemeToggle />
    </ScreenContainer>
  );
}
