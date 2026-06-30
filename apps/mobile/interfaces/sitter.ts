import { IPet } from "./pet";
import { IUser } from "./user";

export type SitterBookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "rejected";

export type SitterBookingType = "hourly" | "daily";

export type SitterMinimumRating = 4 | 3 | 5 | 2 | 1;

export interface SitterFilters {
  city?: string;
  minRating?: SitterMinimumRating;
  maxPrice?: number;
}

export interface ISitterBookingParty {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

export interface IPetSitter {
  id: string;
  accountId: string;
  displayName?: string | null;
  bio: string | null;
  address: string;
  city?: string | null;
  district?: string | null;
  ward?: string | null;
  experience?: string | null;
  serviceNotes?: string | null;
  hourlyRate: string | number;
  dailyRate: string | number;
  maxConcurrentBookings: number;
  activeBookingsCount: number;
  completedBookingsCount: number;
  avgRating: string | number;
  totalReviews: number;
  isAvailable: boolean;
  isVerified?: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  account?: IUser;
}

export interface IPetSitterForm {
  displayName?: string;
  bio?: string;
  city?: string;
  district?: string;
  ward?: string;
  experience?: string;
  serviceNotes?: string;
  hourlyRate: string | number;
  dailyRate: string | number;
  maxConcurrentBookings?: string | number;
  isAvailable?: boolean;
}

export interface ISitterBooking {
  id: string;
  accountId: string;
  sitterId: string;
  petId: string;
  idempotencyKey: string | null;
  type: SitterBookingType;
  status: SitterBookingStatus;
  startTime: string;
  endTime: string;
  totalPrice: string | number | null;
  ownerNotes?: string | null;
  sitterNotes?: string | null;
  careInstructions?: string | null;
  paymentNote?: string | null;
  payment?: {
    inApp?: boolean;
    note?: string | null;
  } | null;
  hasReview?: boolean;
  expiresAt: string | null;
  confirmedAt: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  pet?: IPet;
  sitter?: IPetSitter;
  owner?: ISitterBookingParty | null;
}

export interface ISitterBookingForm {
  idempotencyKey: string;
  petId: string;
  type: SitterBookingType;
  sitterId: string;
  startTime: string;
  endTime: string;
  ownerNotes?: string;
  careInstructions?: string;
}

export interface ISitterBookingCancelForm {
  reason?: string;
}

export type SitterBookingMessageType = "text" | "image" | "system";

export interface ISitterBookingMessage {
  id: string;
  bookingId: string;
  senderAccountId: string;
  type: SitterBookingMessageType;
  content: string | null;
  imageUrl: string | null;
  clientMessageId: string | null;
  createdAt: string;
  readAt: string | null;
  sender?: {
    id: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
}

export interface ISitterBookingMessageForm {
  content?: string;
  imageUrl?: string;
  type?: SitterBookingMessageType;
  clientMessageId?: string;
}

export interface ISitterReview {
  id: string;
  accountId: string;
  bookingId: string;
  sitterId: string;
  rating: number;
  comment: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  accounts?: IUser;
}

export interface ISitterReviewForm {
  sitterId: string;
  bookingId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}
