import { Toast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { Text } from "@/components/ui/Text";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { signOutMutation } from "@/services";
import { useUserInfoStore } from "@/stores/user-info";
import { useMutation } from "@tanstack/react-query";

export default function TabTwoScreen() {
  const { logout } = useUserInfoStore();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: signOutMutation,
    onSuccess: () => {
      logout();
    },
    onError: (e) => {
      Toast.error({ text: e.errors?.[0].message });
    },
  });
  const handleLogout = () => {
    mutateAsync();
  };
  return (
    <ScreenContainer>
      <Text>setting</Text>
      <Button onPress={handleLogout} loading={isPending}>
        Logout
      </Button>
      <ThemeToggle />
    </ScreenContainer>
  );
}
