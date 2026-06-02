import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { ThemeToggle } from "@/features/settings/components/ThemeToggle";
import { useLogout } from "@/hooks/useLogout";

export default function TabTwoScreen() {
  const { loading, logout } = useLogout();
  return (
    <ScreenContainer>
      <Text>setting</Text>
      <Button onPress={logout} loading={loading}>
        Logout
      </Button>
      <ThemeToggle />
    </ScreenContainer>
  );
}
