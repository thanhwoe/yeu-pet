import {
  accounts,
  sitter_booking_messages,
} from '@app/generated/prisma/client';
import { sitter_booking_messagesCreateInput } from '@app/generated/prisma/models';

export const ISitterBookingMessagesRepository = Symbol(
  'ISitterBookingMessagesRepository',
);

export type SitterBookingMessageWithSender = sitter_booking_messages & {
  sender: Pick<accounts, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
};

export interface ISitterBookingMessagesRepository {
  create(
    data: sitter_booking_messagesCreateInput,
  ): Promise<SitterBookingMessageWithSender>;
  findAll(params: {
    booking_id: string;
    skip?: number;
    take?: number;
  }): Promise<[SitterBookingMessageWithSender[], number]>;
}
