import { Toast } from "@/components/Toast";
import {
  PET_KEY,
  SITTER_BOOKING_KEY,
  SITTER_KEY,
  SITTER_REVIEW_KEY,
} from "@/constants/query-keys";
import {
  IPetSitterForm,
  ISitterBookingCancelForm,
  ISitterBookingForm,
  ISitterBookingMessageForm,
  ISitterReviewForm,
  SitterBookingStatus,
} from "@/interfaces";
import {
  cancelSitterBookingMutation,
  completeSitterBookingMutation,
  confirmSitterBookingMutation,
  createSitterBookingMessageMutation,
  createSitterBookingMutation,
  createSitterReviewMutation,
  getListPetQuery,
  getMySitterProfileQuery,
  getSitterBookingDetailQuery,
  getSitterBookingMessagesQuery,
  getSitterBookingsForSitterQuery,
  getSitterBookingsQuery,
  getSitterReviewsQuery,
  getSittersQuery,
  registerSitterMutation,
  rejectSitterBookingMutation,
  updateSitterMutation,
} from "@/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const SITTER_LIMIT = 10;
const BOOKING_LIMIT = 20;
const MESSAGE_LIMIT = 30;
const REVIEW_LIMIT = 3;

export interface SitterFilters {
  city?: string;
  district?: string;
  minRating?: string;
  maxPrice?: string;
}

const showError = (error: Error) => {
  Toast.error({ text: error.message });
};

export const useSitters = (
  filters: SitterFilters = {},
  status?: SitterBookingStatus,
) => {
  const queryClient = useQueryClient();

  const sittersQuery = useQuery({
    queryKey: SITTER_KEY.list({ limit: SITTER_LIMIT, ...filters }),
    queryFn: () => getSittersQuery({ limit: SITTER_LIMIT, ...filters }),
  });

  const petsQuery = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const mySitterProfileQuery = useQuery({
    queryKey: SITTER_KEY.me(),
    queryFn: getMySitterProfileQuery,
    retry: false,
  });

  const ownerBookingsQuery = useQuery({
    queryKey: SITTER_BOOKING_KEY.list({
      limit: BOOKING_LIMIT,
      role: "owner",
      status,
    }),
    queryFn: () =>
      getSitterBookingsQuery({
        limit: BOOKING_LIMIT,
        role: "owner",
        status,
      }),
  });

  const sitterBookingsQuery = useQuery({
    queryKey: SITTER_BOOKING_KEY.sitterList({
      limit: BOOKING_LIMIT,
      role: "sitter",
      status,
    }),
    queryFn: () =>
      getSitterBookingsForSitterQuery({
        limit: BOOKING_LIMIT,
        role: "sitter",
        status,
      }),
    enabled: Boolean(mySitterProfileQuery.data),
  });

  const invalidateSitterData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: SITTER_KEY.all }),
      queryClient.invalidateQueries({ queryKey: SITTER_BOOKING_KEY.all }),
    ]);
  };

  const createBooking = useMutation({
    mutationFn: createSitterBookingMutation,
    onSuccess: async () => {
      Toast.success({ text: "Booking request sent." });
      await invalidateSitterData();
    },
    onError: showError,
  });

  const registerProfile = useMutation({
    mutationFn: registerSitterMutation,
    onSuccess: async () => {
      Toast.success({ text: "Sitter profile saved." });
      await invalidateSitterData();
    },
    onError: showError,
  });

  const updateProfile = useMutation({
    mutationFn: updateSitterMutation,
    onSuccess: async () => {
      Toast.success({ text: "Sitter profile updated." });
      await invalidateSitterData();
    },
    onError: showError,
  });

  const acceptBooking = useMutation({
    mutationFn: confirmSitterBookingMutation,
    onSuccess: async () => {
      Toast.success({ text: "Booking confirmed." });
      await invalidateSitterData();
    },
    onError: showError,
  });

  const rejectBooking = useMutation({
    mutationFn: rejectSitterBookingMutation,
    onSuccess: async () => {
      Toast.success({ text: "Booking rejected." });
      await invalidateSitterData();
    },
    onError: showError,
  });

  const completeBooking = useMutation({
    mutationFn: completeSitterBookingMutation,
    onSuccess: async () => {
      Toast.success({ text: "Booking completed." });
      await invalidateSitterData();
    },
    onError: showError,
  });

  const cancelBooking = useMutation({
    mutationFn: cancelSitterBookingMutation,
    onSuccess: async () => {
      Toast.success({ text: "Booking cancelled." });
      await invalidateSitterData();
    },
    onError: showError,
  });

  const sendMessage = useMutation({
    mutationFn: createSitterBookingMessageMutation,
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: SITTER_BOOKING_KEY.messages(variables.bookingId),
      });
    },
    onError: showError,
  });

  const createReview = useMutation({
    mutationFn: createSitterReviewMutation,
    onSuccess: async () => {
      Toast.success({ text: "Review submitted." });
      await invalidateSitterData();
    },
    onError: showError,
  });

  return {
    sitters: sittersQuery.data?.data ?? [],
    pets: petsQuery.data?.data ?? [],
    mySitterProfile: mySitterProfileQuery.data ?? null,
    ownerBookings: ownerBookingsQuery.data?.data ?? [],
    sitterBookings: sitterBookingsQuery.data?.data ?? [],
    isLoading: sittersQuery.isLoading,
    isError: sittersQuery.isError,
    isOwnerBookingsLoading: ownerBookingsQuery.isLoading,
    isSitterBookingsLoading:
      mySitterProfileQuery.isLoading ||
      (Boolean(mySitterProfileQuery.data) && sitterBookingsQuery.isLoading),
    isOwnerBookingsError: ownerBookingsQuery.isError,
    isSitterBookingsError:
      Boolean(mySitterProfileQuery.data) && sitterBookingsQuery.isError,
    hasSitterProfile: Boolean(mySitterProfileQuery.data),
    isRefreshing:
      sittersQuery.isRefetching ||
      petsQuery.isRefetching ||
      mySitterProfileQuery.isRefetching ||
      ownerBookingsQuery.isRefetching ||
      sitterBookingsQuery.isRefetching,
    refetch: sittersQuery.refetch,
    refetchAll: async () => {
      await Promise.all([
        sittersQuery.refetch(),
        petsQuery.refetch(),
        mySitterProfileQuery.refetch(),
        ownerBookingsQuery.refetch(),
        sitterBookingsQuery.refetch(),
      ]);
    },
    createBooking: (data: ISitterBookingForm) =>
      createBooking.mutateAsync(data),
    saveProfile: (data: IPetSitterForm) =>
      mySitterProfileQuery.data
        ? updateProfile.mutateAsync(data)
        : registerProfile.mutateAsync(data),
    acceptBooking: (id: string) => acceptBooking.mutateAsync(id),
    rejectBooking: (id: string) => rejectBooking.mutateAsync(id),
    completeBooking: (id: string) => completeBooking.mutateAsync(id),
    cancelBooking: (data: ISitterBookingCancelForm & { id: string }) =>
      cancelBooking.mutateAsync(data),
    sendMessage: (data: ISitterBookingMessageForm & { bookingId: string }) =>
      sendMessage.mutateAsync(data),
    createReview: (data: ISitterReviewForm) => createReview.mutateAsync(data),
    isCreatingBooking: createBooking.isPending,
    isSavingProfile: registerProfile.isPending || updateProfile.isPending,
    isMutatingBooking:
      acceptBooking.isPending ||
      rejectBooking.isPending ||
      completeBooking.isPending ||
      cancelBooking.isPending,
    isSendingMessage: sendMessage.isPending,
    isCreatingReview: createReview.isPending,
  };
};

export const useSitterBookingMessages = (bookingId?: string) => {
  return useQuery({
    queryKey: SITTER_BOOKING_KEY.messages(bookingId),
    queryFn: () =>
      getSitterBookingMessagesQuery({
        bookingId: bookingId ?? "",
        limit: MESSAGE_LIMIT,
      }),
    enabled: Boolean(bookingId),
  });
};

export const useSitterBookingDetail = (bookingId?: string) => {
  return useQuery({
    queryKey: SITTER_BOOKING_KEY.detail(bookingId),
    queryFn: () => getSitterBookingDetailQuery(bookingId ?? ""),
    enabled: Boolean(bookingId),
  });
};

export const useSitterReviews = (sitterId?: string) => {
  return useQuery({
    queryKey: SITTER_REVIEW_KEY.list({
      sitterId,
      limit: REVIEW_LIMIT,
    }),
    queryFn: () =>
      getSitterReviewsQuery({
        sitterId: sitterId ?? "",
        limit: REVIEW_LIMIT,
      }),
    enabled: Boolean(sitterId),
  });
};
