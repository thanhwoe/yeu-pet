import { Toast } from "@/components/Toast";
import { deleteDeviceInfoMutation, signOutMutation } from "@/services";
import { useUserInfoStore } from "@/stores";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useLogout = () => {
  const queryClient = useQueryClient();

  const { logout, tokens, updateDeviceInfo, deviceInfo } = useUserInfoStore();

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

  const { mutateAsync: deleteDevice, isPending: isDeletingDevice } =
    useMutation({
      mutationFn: deleteDeviceInfoMutation,
      onSuccess: () => {
        updateDeviceInfo(null);
      },
      onError: (e) => {
        Toast.error({ text: e.message });
      },
    });

  const handleLogout = () => {
    mutateAsync({ refreshToken: tokens?.refreshToken });
    if (deviceInfo?.id) {
      deleteDevice(deviceInfo.id);
    }
  };

  return {
    logout: handleLogout,
    loading: isPending || isDeletingDevice,
  };
};
