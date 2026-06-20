import type { ISitterBookingMessage } from "@/interfaces";

export type SitterChatConnectionState =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "offline";

export type LocalChatMessage = ISitterBookingMessage & {
  localStatus?: "pending" | "sent" | "failed";
  isOptimistic?: boolean;
};

export interface SitterChatError {
  code:
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "VALIDATION_ERROR"
    | "BOOKING_NOT_FOUND"
    | "MESSAGE_SEND_FAILED"
    | "RATE_LIMITED";
  message: string;
  bookingId?: string;
  clientMessageId?: string;
}

export interface SitterChatServerEvents {
  "sitterChat:joined": (payload: { bookingId: string; room: string }) => void;
  "sitterChat:newMessage": (payload: {
    message: ISitterBookingMessage;
  }) => void;
  "sitterChat:messageAck": (payload: {
    bookingId: string;
    clientMessageId: string;
    message: ISitterBookingMessage;
  }) => void;
  "sitterChat:error": (payload: SitterChatError) => void;
}

export interface SitterChatClientEvents {
  "sitterChat:join": (payload: { bookingId: string }) => void;
  "sitterChat:leave": (payload: { bookingId: string }) => void;
  "sitterChat:sendMessage": (payload: {
    bookingId: string;
    clientMessageId: string;
    content: string;
  }) => void;
}
