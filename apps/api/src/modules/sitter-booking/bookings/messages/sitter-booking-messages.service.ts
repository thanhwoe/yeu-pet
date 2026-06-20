import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  accounts,
  booking_message_type,
  sitter_bookings_status,
} from '@app/generated/prisma/client';
import {
  ISitterBookingMessagesRepository,
  SitterBookingMessageWithSender,
} from '@app/interfaces/sitter-booking-messages-repository.interface';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { SitterBookingsService } from '../sitter-bookings.service';
import { CreateSitterBookingMessageDto } from './dto/create-sitter-booking-message.dto';
import { SitterChatMessageDto } from './sitter-booking-chat.types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { NotificationsService } from '@app/modules/notifications/notifications.service';

const MAX_MESSAGE_LENGTH = 2000;

@Injectable()
export class SitterBookingMessagesService {
  private readonly logger = new Logger(SitterBookingMessagesService.name);

  constructor(
    @Inject(ISitterBookingMessagesRepository)
    private readonly messagesRepository: ISitterBookingMessagesRepository,
    private readonly sitterBookingsService: SitterBookingsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    user: accounts,
    bookingId: string,
    createMessageDto: CreateSitterBookingMessageDto,
  ) {
    return this.createMessage({
      bookingId,
      senderAccountId: user.id,
      content: createMessageDto.content,
      imageUrl: createMessageDto.imageUrl,
      type: createMessageDto.type,
      clientMessageId: createMessageDto.clientMessageId,
      source: 'http',
    });
  }

  async assertBookingParticipant(params: {
    bookingId: string;
    accountId: string;
  }) {
    const booking = await this.sitterBookingsService.findOne(
      { id: params.accountId },
      params.bookingId,
    );

    const recipientAccountId =
      booking.account_id === params.accountId
        ? booking.sitter?.accountId
        : booking.account_id;

    return { booking, recipientAccountId };
  }

  async createMessage(params: {
    bookingId: string;
    senderAccountId: string;
    content?: string;
    imageUrl?: string;
    type?: booking_message_type;
    clientMessageId?: string;
    source: 'http' | 'websocket';
  }): Promise<SitterChatMessageDto> {
    const { booking, recipientAccountId } = await this.assertBookingParticipant(
      {
        bookingId: params.bookingId,
        accountId: params.senderAccountId,
      },
    );
    this.assertCanMessage(booking.status);

    const type = params.type ?? booking_message_type.text;
    const content = params.content?.trim();
    const clientMessageId = params.clientMessageId?.trim();
    this.validateMessagePayload(type, {
      content,
      imageUrl: params.imageUrl,
      clientMessageId,
    });

    if (clientMessageId) {
      const existing = await this.messagesRepository.findByClientMessageId({
        booking_id: params.bookingId,
        sender_id: params.senderAccountId,
        client_message_id: clientMessageId,
      });
      if (existing) return this.toMessageDto(existing);
    }

    let created: SitterBookingMessageWithSender;
    try {
      created = await this.messagesRepository.create({
        sitter_bookings: { connect: { id: params.bookingId } },
        sender: { connect: { id: params.senderAccountId } },
        type,
        content,
        image_url: params.imageUrl,
        client_message_id: clientMessageId,
      });
    } catch (error) {
      if (
        clientMessageId &&
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existing = await this.messagesRepository.findByClientMessageId({
          booking_id: params.bookingId,
          sender_id: params.senderAccountId,
          client_message_id: clientMessageId,
        });
        if (existing) return this.toMessageDto(existing);
      }
      throw error;
    }

    if (recipientAccountId) {
      this.notificationsService
        .sendSitterBookingMessageNotification({
          recipientAccountId,
          bookingId: params.bookingId,
        })
        .catch((error: unknown) => {
          this.logger.error(
            `Failed to dispatch sitter message notification: ${(error as Error).message}`,
          );
        });
    }

    return this.toMessageDto(created);
  }

  async findAll(user: accounts, bookingId: string, pagination: PaginationDto) {
    await this.assertBookingParticipant({ bookingId, accountId: user.id });

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const [data, total] = await this.messagesRepository.findAll({
      booking_id: bookingId,
      skip,
      take: limit,
    });

    return paginate(
      data.reverse().map((message) => this.toMessageDto(message)),
      total,
      page,
      limit,
    );
  }

  private assertCanMessage(status: sitter_bookings_status) {
    const canMessage =
      status === sitter_bookings_status.confirmed ||
      status === sitter_bookings_status.active ||
      status === sitter_bookings_status.completed;

    if (!canMessage) {
      throw new NotFoundException('Booking message thread is not available');
    }
  }

  private validateMessagePayload(
    type: booking_message_type,
    payload: {
      content?: string;
      imageUrl?: string;
      clientMessageId?: string;
    },
  ) {
    if (type === booking_message_type.system) {
      throw new BadRequestException('System messages cannot be sent by users');
    }
    if (payload.clientMessageId !== undefined && !payload.clientMessageId) {
      throw new BadRequestException('clientMessageId cannot be empty');
    }
    if ((payload.clientMessageId?.length ?? 0) > 128) {
      throw new BadRequestException('clientMessageId is too long');
    }
    if (type === booking_message_type.text && !payload.content) {
      throw new BadRequestException('Text messages require content');
    }
    if ((payload.content?.length ?? 0) > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(
        `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
      );
    }
    if (type === booking_message_type.image && !payload.imageUrl) {
      throw new BadRequestException('Image messages require imageUrl');
    }
  }

  private toMessageDto(
    message: SitterBookingMessageWithSender,
  ): SitterChatMessageDto {
    const displayName = [message.sender.first_name, message.sender.last_name]
      .filter(Boolean)
      .join(' ');

    return {
      id: message.id,
      bookingId: message.booking_id,
      senderAccountId: message.sender_id,
      type: message.type,
      content: message.content,
      imageUrl: message.image_url,
      clientMessageId: message.client_message_id,
      createdAt: (message.created_at ?? new Date()).toISOString(),
      readAt: message.read_at?.toISOString() ?? null,
      sender: {
        id: message.sender.id,
        displayName: displayName || null,
        avatarUrl: message.sender.avatar_url,
      },
    };
  }
}
