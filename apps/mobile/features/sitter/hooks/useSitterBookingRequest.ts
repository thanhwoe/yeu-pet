import {
  PET_KEY,
  SITTER_BOOKING_KEY,
  SITTER_KEY,
} from "@/constants/query-keys";
import { i18n } from "@/i18n";
import { type ISitterBookingForm } from "@/interfaces";
import { createSitterBookingMutation, getListPetQuery } from "@/services";
import { Toast } from "@/components/Toast";
import { getApiErrorToast } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useSitterDetail } from "./useSitterDetail";

const showRequestError = (error: unknown) => {
  Toast.error(
    getApiErrorToast(error, {
      titleKey: "sitter.toast.requestNotSent",
      textKey: "sitter.toast.defaultErrorText",
    }),
  );
};

export const useSitterBookingRequest = (sitterId?: string) => {
  const queryClient = useQueryClient();
  const sitterDetail = useSitterDetail(sitterId);

  const petsQuery = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const refreshSitterBookings = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: SITTER_BOOKING_KEY.all }),
      queryClient.invalidateQueries({ queryKey: SITTER_KEY.all }),
    ]);
  }, [queryClient]);

  const createBooking = useMutation({
    mutationFn: createSitterBookingMutation,
    onSuccess: async (booking) => {
      queryClient.setQueryData(SITTER_BOOKING_KEY.detail(booking.id), booking);
      Toast.success({
        title: i18n.t("sitter.toast.requestSentTitle"),
        text: i18n.t("sitter.toast.requestSentText"),
      });
      await refreshSitterBookings();
    },
    onError: showRequestError,
  });

  const refetch = useCallback(async () => {
    await Promise.all([sitterDetail.refetch(), petsQuery.refetch()]);
  }, [petsQuery, sitterDetail]);

  return {
    sitter: sitterDetail.sitter,
    pets: petsQuery.data?.data ?? [],
    isLoading: sitterDetail.isLoading || petsQuery.isLoading,
    isError: sitterDetail.isError || petsQuery.isError,
    isCreatingBooking: createBooking.isPending,
    refetch,
    createBooking: (data: ISitterBookingForm) =>
      createBooking.mutateAsync(data),
  };
};
