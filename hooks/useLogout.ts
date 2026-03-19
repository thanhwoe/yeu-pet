import { Toast } from "@/components/Toast";
import { signOutMutation } from "@/services";
import { useUserInfoStore } from "@/stores";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
  const queryClient = useQueryClient();

  const { logout, tokens } = useUserInfoStore();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: signOutMutation,
    onSuccess: () => {
      logout();
      queryClient.resetQueries();
    },
    onError: (e) => {
      Toast.error({ text: e.message.message });
    },
  });

  const handleLogout = () => {
    mutateAsync({ refreshToken: tokens?.refreshToken });
  };

  return {
    logout: handleLogout,
    loading: isPending,
  };
};
