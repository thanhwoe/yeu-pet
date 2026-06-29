import { Toast } from "@/components/Toast";
import { signOutMutation } from "@/services";
import { useUserInfoStore } from "@/stores";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { logout, tokens, deviceInfo } = useUserInfoStore();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: signOutMutation,
    onSuccess: () => {
      logout();
      queryClient.resetQueries();
    },
    onError: (e) => {
      Toast.error({
        title: t("auth.toast.signOutFailedTitle"),
        text: e.message || t("auth.toast.signOutFailedText"),
      });
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
