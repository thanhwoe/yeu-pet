import { Toast } from "@/components/Toast";
import {
  SITTER_BOOKING_KEY,
  SITTER_KEY,
  SITTER_REVIEW_KEY,
} from "@/constants/query-keys";
import { i18n } from "@/i18n";
import {
  type ISitterBooking,
  type ISitterBookingCancelForm,
  type ISitterReviewForm,
} from "@/interfaces";
import {
  cancelSitterBookingMutation,
  completeSitterBookingMutation,
  confirmSitterBookingMutation,
  createSitterReviewMutation,
  getSitterBookingDetailQuery,
  rejectSitterBookingMutation,
} from "@/services";
import { getApiErrorToast } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const showError = (titleKey: string) => (error: unknown) => {
  Toast.error(
    getApiErrorToast(error, {
      titleKey,
      textKey: "sitter.toast.defaultErrorText",
    }),
  );
};

export const useSitterBookingDetailRoute = (bookingId?: string) => {
  const queryClient = useQueryClient();

  const bookingQuery = useQuery({
    queryKey: SITTER_BOOKING_KEY.detail(bookingId),
    queryFn: () => getSitterBookingDetailQuery(bookingId ?? ""),
    enabled: Boolean(bookingId),
  });

  const refreshBookingData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: SITTER_BOOKING_KEY.all }),
      queryClient.invalidateQueries({ queryKey: SITTER_KEY.all }),
    ]);
  }, [queryClient]);

  const handleBookingSuccess = useCallback(
    async ({
      booking,
      textKey,
      titleKey,
    }: {
      booking: ISitterBooking;
      textKey: string;
      titleKey: string;
    }) => {
      queryClient.setQueryData(SITTER_BOOKING_KEY.detail(booking.id), booking);
      Toast.success({
        title: i18n.t(titleKey),
        text: i18n.t(textKey),
      });
      await refreshBookingData();
    },
    [queryClient, refreshBookingData],
  );

  const acceptBooking = useMutation({
    mutationFn: confirmSitterBookingMutation,
    onSuccess: (booking) =>
      handleBookingSuccess({
        booking,
        titleKey: "sitter.toast.bookingConfirmedTitle",
        textKey: "sitter.toast.bookingConfirmedText",
      }),
    onError: showError("sitter.toast.bookingNotConfirmed"),
  });

  const rejectBooking = useMutation({
    mutationFn: rejectSitterBookingMutation,
    onSuccess: (booking) =>
      handleBookingSuccess({
        booking,
        titleKey: "sitter.toast.bookingDeclinedTitle",
        textKey: "sitter.toast.bookingDeclinedText",
      }),
    onError: showError("sitter.toast.bookingNotDeclined"),
  });

  const completeBooking = useMutation({
    mutationFn: completeSitterBookingMutation,
    onSuccess: (booking) =>
      handleBookingSuccess({
        booking,
        titleKey: "sitter.toast.bookingCompletedTitle",
        textKey: "sitter.toast.bookingCompletedText",
      }),
    onError: showError("sitter.toast.bookingNotCompleted"),
  });

  const cancelBooking = useMutation({
    mutationFn: cancelSitterBookingMutation,
    onSuccess: (booking) =>
      handleBookingSuccess({
        booking,
        titleKey: "sitter.toast.bookingCancelledTitle",
        textKey: "sitter.toast.bookingCancelledText",
      }),
    onError: showError("sitter.toast.bookingNotCancelled"),
  });

  const createReview = useMutation({
    mutationFn: createSitterReviewMutation,
    onSuccess: async (_review, variables) => {
      queryClient.setQueryData<ISitterBooking>(
        SITTER_BOOKING_KEY.detail(variables.bookingId),
        (booking) => (booking ? { ...booking, hasReview: true } : booking),
      );
      Toast.success({
        title: i18n.t("sitter.toast.reviewSubmittedTitle"),
        text: i18n.t("sitter.toast.reviewSubmittedText"),
      });
      await Promise.all([
        refreshBookingData(),
        queryClient.invalidateQueries({ queryKey: SITTER_REVIEW_KEY.all }),
      ]);
    },
    onError: showError("sitter.toast.reviewNotSubmitted"),
  });

  return {
    booking: bookingQuery.data ?? null,
    isLoading: bookingQuery.isLoading,
    isError: bookingQuery.isError,
    isRefreshing: bookingQuery.isRefetching,
    refetch: bookingQuery.refetch,
    acceptBooking: (id: string) => acceptBooking.mutateAsync(id),
    rejectBooking: (id: string) => rejectBooking.mutateAsync(id),
    completeBooking: (id: string) => completeBooking.mutateAsync(id),
    cancelBooking: (data: ISitterBookingCancelForm & { id: string }) =>
      cancelBooking.mutateAsync(data),
    createReview: (data: ISitterReviewForm) => createReview.mutateAsync(data),
    isMutatingBooking:
      acceptBooking.isPending ||
      rejectBooking.isPending ||
      completeBooking.isPending ||
      cancelBooking.isPending,
    isCreatingReview: createReview.isPending,
  };
};
