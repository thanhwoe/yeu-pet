import { sitter_bookings_type } from '@app/generated/prisma/client';

export const SITTER_BOOKING_EVENT_CHANNELS = {
  BOOKING_CREATED: 'sitter-booking.created',
} as const;

export interface SitterBookingCreatedEvent {
  accountId: string;
  bookingId: string;
  endTime: string;
  expiresAt: string;
  petId: string;
  sitterId: string;
  startTime: string;
  type: sitter_bookings_type;
}
