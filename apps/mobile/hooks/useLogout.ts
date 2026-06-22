import { Toast } from "@/components/Toast";
import { signOutMutation } from "@/services";
import { useUserInfoStore } from "@/stores";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
  const queryClient = useQueryClient();

  const { logout, tokens, deviceInfo } = useUserInfoStore();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: signOutMutation,
    onSuccess: () => {
      logout();
      queryClient.resetQueries();
    },
    onError: (e) => {
      Toast.error({ text: e.message });
    },
  });

  const handleLogout = () => {
    void mutateAsync({
      refreshToken: tokens?.refreshToken,
      deviceId: deviceInfo?.id,
    });
  };

  return {
    logout: handleLogout,
    loading: isPending,
  };
};
