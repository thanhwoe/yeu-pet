import { SITTER_BOOKING_KEY, SITTER_REVIEW_KEY } from "@/constants/query-keys";
import {
  getSitterBookingDetailQuery,
  getSitterBookingMessagesQuery,
  getSitterReviewsQuery,
} from "@/services";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

const MESSAGE_LIMIT = 30;
const REVIEW_LIMIT = 3;

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
  return useInfiniteQuery({
    queryKey: SITTER_REVIEW_KEY.list({
      sitterId,
      limit: REVIEW_LIMIT,
    }),
    queryFn: ({ pageParam }) =>
      getSitterReviewsQuery({
        sitterId: sitterId ?? "",
        limit: REVIEW_LIMIT,
        page: pageParam,
      }),
    enabled: Boolean(sitterId),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
  });
};
