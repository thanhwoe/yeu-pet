import { Toast } from "@/components/Toast";
import { SITTER_BOOKING_KEY, SITTER_KEY } from "@/constants/query-keys";
import { i18n } from "@/i18n";
import { type IPetSitterForm } from "@/interfaces";
import {
  getMySitterProfileQuery,
  registerSitterMutation,
  updateSitterMutation,
} from "@/services";
import { getApiErrorToast } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const showError = (titleKey: string) => (error: unknown) => {
  Toast.error(
    getApiErrorToast(error, {
      titleKey,
      textKey: "sitter.toast.defaultErrorText",
    }),
  );
};

export const useSitterProfile = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: SITTER_KEY.me(),
    queryFn: getMySitterProfileQuery,
    retry: false,
  });

  const refreshSitterProfile = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: SITTER_KEY.all }),
      queryClient.invalidateQueries({ queryKey: SITTER_BOOKING_KEY.all }),
    ]);
  };

  const registerProfile = useMutation({
    mutationFn: registerSitterMutation,
    onSuccess: async (profile) => {
      queryClient.setQueryData(SITTER_KEY.me(), profile);
      Toast.success({
        title: i18n.t("sitter.toast.profileCreatedTitle"),
        text: i18n.t("sitter.toast.profileCreatedText"),
      });
      await refreshSitterProfile();
    },
    onError: showError("sitter.toast.profileNotCreated"),
  });

  const updateProfile = useMutation({
    mutationFn: updateSitterMutation,
    onSuccess: async (profile) => {
      queryClient.setQueryData(SITTER_KEY.me(), profile);
      Toast.success({
        title: i18n.t("sitter.toast.profileUpdatedTitle"),
        text: i18n.t("sitter.toast.profileUpdatedText"),
      });
      await refreshSitterProfile();
    },
    onError: showError("sitter.toast.profileNotUpdated"),
  });

  const profile = profileQuery.data ?? null;

  return {
    profile,
    hasProfile: Boolean(profile),
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    isSavingProfile: registerProfile.isPending || updateProfile.isPending,
    refetch: profileQuery.refetch,
    saveProfile: (data: IPetSitterForm) =>
      profile
        ? updateProfile.mutateAsync(data)
        : registerProfile.mutateAsync(data),
  };
};
