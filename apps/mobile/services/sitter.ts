import { API_ROUTES } from "@/constants/api-routes";
import {
  IPagination,
  IPetSitter,
  IPetSitterForm,
  ISitterBooking,
  ISitterBookingCancelForm,
  ISitterBookingForm,
  ISitterBookingMessage,
  ISitterBookingMessageForm,
  ISitterReview,
  ISitterReviewForm,
  SitterBookingStatus,
} from "@/interfaces";
import { parseQueryParams } from "@/utils";
import { APIs } from "./api-helper";

interface ISitterQuery {
  limit?: number;
  page?: number;
  address?: string;
  city?: string;
  minRating?: string | number;
  maxPrice?: string | number;
}

interface ISitterBookingQuery {
  limit?: number;
  page?: number;
  status?: SitterBookingStatus;
  role?: "owner" | "sitter";
}

export const getSittersQuery = (params?: ISitterQuery) =>
  APIs.get<IPagination<IPetSitter>>(API_ROUTES.SITTERS, {
    params,
    paramsSerializer: parseQueryParams,
  });

export const getSitterDetailQuery = (id: string) =>
  APIs.get<IPetSitter>(API_ROUTES.SITTER_DETAIL(id));

export const getMySitterProfileQuery = () =>
  APIs.get<IPetSitter | null>(API_ROUTES.MY_SITTER_PROFILE);

export const registerSitterMutation = (params: IPetSitterForm) =>
  APIs.post<IPetSitter>(API_ROUTES.CREATE_MY_SITTER_PROFILE, { data: params });

export const updateSitterMutation = (params: IPetSitterForm) =>
  APIs.patch<IPetSitter>(API_ROUTES.MY_SITTER_PROFILE, { data: params });

export const createSitterBookingMutation = (params: ISitterBookingForm) =>
  APIs.post<ISitterBooking>(API_ROUTES.SITTER_BOOKINGS, { data: params });

export const getSitterBookingsQuery = (params?: ISitterBookingQuery) =>
  APIs.get<IPagination<ISitterBooking>>(API_ROUTES.MY_SITTER_BOOKINGS, {
    params: { role: "owner", ...params },
    paramsSerializer: parseQueryParams,
  });

export const getSitterBookingsForSitterQuery = (
  params?: ISitterBookingQuery,
) =>
  APIs.get<IPagination<ISitterBooking>>(
    API_ROUTES.MY_SITTER_BOOKINGS,
    {
      params: { role: "sitter", ...params },
      paramsSerializer: parseQueryParams,
    },
  );

export const getSitterBookingDetailQuery = (id: string) =>
  APIs.get<ISitterBooking>(API_ROUTES.SITTER_BOOKING_DETAIL(id));

export const getSitterBookingMessagesQuery = ({
  bookingId,
  ...params
}: {
  bookingId: string;
  page?: number;
  limit?: number;
}) =>
  APIs.get<IPagination<ISitterBookingMessage>>(
    API_ROUTES.SITTER_BOOKING_MESSAGES(bookingId),
    {
      params,
      paramsSerializer: parseQueryParams,
    },
  );

export const createSitterBookingMessageMutation = ({
  bookingId,
  ...params
}: ISitterBookingMessageForm & { bookingId: string }) =>
  APIs.post<ISitterBookingMessage>(
    API_ROUTES.SITTER_BOOKING_MESSAGES(bookingId),
    { data: params },
  );

export const confirmSitterBookingMutation = (id: string) =>
  APIs.post<ISitterBooking>(API_ROUTES.ACCEPT_SITTER_BOOKING(id));

export const rejectSitterBookingMutation = (id: string) =>
  APIs.post<ISitterBooking>(API_ROUTES.REJECT_SITTER_BOOKING(id));

export const completeSitterBookingMutation = (id: string) =>
  APIs.post<ISitterBooking>(API_ROUTES.COMPLETE_SITTER_BOOKING(id));

export const cancelSitterBookingMutation = ({
  id,
  ...params
}: ISitterBookingCancelForm & { id: string }) =>
  APIs.post<ISitterBooking>(API_ROUTES.CANCEL_SITTER_BOOKING(id), {
    data: params,
  });

export const createSitterReviewMutation = ({
  bookingId,
  rating,
  comment,
}: ISitterReviewForm) =>
  APIs.post<ISitterReview>(API_ROUTES.REVIEW_SITTER_BOOKING(bookingId), {
    data: { rating, comment },
  });

export const getSitterReviewsQuery = ({
  sitterId,
  ...params
}: {
  sitterId: string;
  limit?: number;
  page?: number;
}) =>
  APIs.get<IPagination<ISitterReview>>(
    API_ROUTES.SITTER_REVIEWS_BY_SITTER(sitterId),
    {
      params,
      paramsSerializer: parseQueryParams,
    },
  );
