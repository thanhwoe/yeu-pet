import { PrismaService } from '@app/database/prisma/prisma.service';
import { sitter_booking_messagesCreateInput } from '@app/generated/prisma/models';
import { ISitterBookingMessagesRepository } from '@app/interfaces/sitter-booking-messages-repository.interface';
import { Injectable } from '@nestjs/common';

const MESSAGE_SENDER_INCLUDE = {
  sender: {
    select: {
      id: true,
      first_name: true,
      last_name: true,
      avatar_url: true,
    },
  },
} as const;

@Injectable()
export class SitterBookingMessagesRepository implements ISitterBookingMessagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: sitter_booking_messagesCreateInput) {
    return this.prisma.sitter_booking_messages.create({
      data,
      include: MESSAGE_SENDER_INCLUDE,
    });
  }

  findByClientMessageId(params: {
    booking_id: string;
    sender_id: string;
    client_message_id: string;
  }) {
    return this.prisma.sitter_booking_messages.findFirst({
      where: params,
      include: MESSAGE_SENDER_INCLUDE,
    });
  }

  findAll(params: { booking_id: string; skip?: number; take?: number }) {
    const where = {
      booking_id: params.booking_id,
    };

    return this.prisma.$transaction([
      this.prisma.sitter_booking_messages.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        include: MESSAGE_SENDER_INCLUDE,
      }),
      this.prisma.sitter_booking_messages.count({ where }),
    ]);
  }
}
