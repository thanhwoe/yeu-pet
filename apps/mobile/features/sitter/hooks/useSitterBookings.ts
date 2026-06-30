import {
  PET_KEY,
  SITTER_BOOKING_KEY,
  SITTER_KEY,
} from "@/constants/query-keys";
import {
  type ISitterBooking,
  type SitterBookingStatus,
} from "@/interfaces";
import {
  getListPetQuery,
  getMySitterProfileQuery,
  getSitterBookingsForSitterQuery,
  getSitterBookingsQuery,
} from "@/services";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const BOOKING_LIMIT = 20;

export type SitterBookingRole = "owner" | "sitter";

export const useSitterBookings = (
  role: SitterBookingRole,
  status?: SitterBookingStatus,
) => {
  const petsQuery = useQuery({
    queryKey: PET_KEY.list(),
    queryFn: getListPetQuery,
  });

  const mySitterProfileQuery = useQuery({
    queryKey: SITTER_KEY.me(),
    queryFn: getMySitterProfileQuery,
    retry: false,
  });

  const hasSitterProfile = Boolean(mySitterProfileQuery.data);
  const shouldFetchBookings = role === "owner" || hasSitterProfile;

  const bookingsQuery = useQuery({
    queryKey:
      role === "owner"
        ? SITTER_BOOKING_KEY.list({
            limit: BOOKING_LIMIT,
            role,
            status,
          })
        : SITTER_BOOKING_KEY.sitterList({
            limit: BOOKING_LIMIT,
            role,
            status,
          }),
    queryFn: () =>
      role === "owner"
        ? getSitterBookingsQuery({
            limit: BOOKING_LIMIT,
            role,
            status,
          })
        : getSitterBookingsForSitterQuery({
            limit: BOOKING_LIMIT,
            role,
            status,
          }),
    enabled: shouldFetchBookings,
  });

  const petById = useMemo(
    () => new Map((petsQuery.data?.data ?? []).map((pet) => [pet.id, pet])),
    [petsQuery.data?.data],
  );

  const bookings = useMemo(
    () =>
      (bookingsQuery.data?.data ?? []).map(
        (booking): ISitterBooking => ({
          ...booking,
          pet: booking.pet ?? petById.get(booking.petId),
          sitter:
            booking.sitter ??
            (mySitterProfileQuery.data?.id === booking.sitterId
              ? mySitterProfileQuery.data
              : undefined),
        }),
      ),
    [bookingsQuery.data?.data, mySitterProfileQuery.data, petById],
  );

  const refetchAll = useCallback(async () => {
    await Promise.all([
      petsQuery.refetch(),
      mySitterProfileQuery.refetch(),
      shouldFetchBookings ? bookingsQuery.refetch() : Promise.resolve(),
    ]);
  }, [bookingsQuery, mySitterProfileQuery, petsQuery, shouldFetchBookings]);

  return {
    bookings,
    hasSitterProfile,
    isLoading:
      role === "sitter"
        ? mySitterProfileQuery.isLoading ||
          (hasSitterProfile && bookingsQuery.isLoading)
        : bookingsQuery.isLoading,
    isFetching:
      role === "sitter"
        ? mySitterProfileQuery.isFetching ||
          (hasSitterProfile && bookingsQuery.isFetching)
        : bookingsQuery.isFetching,
    isError: shouldFetchBookings && bookingsQuery.isError,
    isRefreshing:
      petsQuery.isRefetching ||
      mySitterProfileQuery.isRefetching ||
      bookingsQuery.isRefetching,
    refetchAll,
  };
};
