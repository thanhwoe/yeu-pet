import { API_ROUTES } from "@/constants/api-routes";
import {
  IPagination,
  IPetSitter,
  IPetSitterForm,
  ISitterBooking,
  ISitterBookingCancelForm,
  ISitterBookingForm,
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
}

interface ISitterBookingQuery {
  limit?: number;
  page?: number;
  status?: SitterBookingStatus;
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
  APIs.post<IPetSitter>(API_ROUTES.REGISTER_SITTER, { data: params });

export const updateSitterMutation = ({
  id,
  ...params
}: IPetSitterForm & { id: string }) =>
  APIs.patch<IPetSitter>(API_ROUTES.SITTER_DETAIL(id), { data: params });

export const createSitterBookingMutation = (params: ISitterBookingForm) =>
  APIs.post<ISitterBooking>(API_ROUTES.SITTER_BOOKINGS, { data: params });

export const getSitterBookingsQuery = (params?: ISitterBookingQuery) =>
  APIs.get<IPagination<ISitterBooking>>(API_ROUTES.SITTER_BOOKINGS, {
    params,
    paramsSerializer: parseQueryParams,
  });

export const getSitterBookingsForSitterQuery = (
  params?: ISitterBookingQuery,
) =>
  APIs.get<IPagination<ISitterBooking>>(
    API_ROUTES.SITTER_BOOKINGS_FOR_SITTER,
    {
      params,
      paramsSerializer: parseQueryParams,
    },
  );

export const getSitterBookingDetailQuery = (id: string) =>
  APIs.get<ISitterBooking>(API_ROUTES.SITTER_BOOKING_DETAIL(id));

export const confirmSitterBookingMutation = (id: string) =>
  APIs.patch<ISitterBooking>(API_ROUTES.CONFIRM_SITTER_BOOKING(id));

export const rejectSitterBookingMutation = (id: string) =>
  APIs.patch<ISitterBooking>(API_ROUTES.REJECT_SITTER_BOOKING(id));

export const completeSitterBookingMutation = (id: string) =>
  APIs.patch<ISitterBooking>(API_ROUTES.COMPLETE_SITTER_BOOKING(id));

export const cancelSitterBookingMutation = ({
  id,
  ...params
}: ISitterBookingCancelForm & { id: string }) =>
  APIs.patch<ISitterBooking>(API_ROUTES.CANCEL_SITTER_BOOKING(id), {
    data: params,
  });

export const createSitterReviewMutation = (params: ISitterReviewForm) =>
  APIs.post<ISitterReview>(API_ROUTES.SITTER_REVIEWS, { data: params });

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
