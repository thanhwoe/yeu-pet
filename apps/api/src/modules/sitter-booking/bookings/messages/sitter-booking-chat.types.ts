import type { booking_message_type } from '@app/generated/prisma/client';

export interface SitterChatMessageDto {
  id: string;
  bookingId: string;
  senderAccountId: string;
  type: booking_message_type;
  content: string | null;
  imageUrl: string | null;
  clientMessageId: string | null;
  createdAt: string;
  readAt: string | null;
  sender: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

export type SitterChatErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'BOOKING_NOT_FOUND'
  | 'MESSAGE_SEND_FAILED'
  | 'RATE_LIMITED';

export interface SitterChatErrorDto {
  code: SitterChatErrorCode;
  message: string;
  bookingId?: string;
  clientMessageId?: string;
}
