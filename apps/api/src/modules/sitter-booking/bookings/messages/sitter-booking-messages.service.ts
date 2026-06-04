import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  accounts,
  booking_message_type,
  sitter_bookings_status,
} from '@app/generated/prisma/client';
import { ISitterBookingMessagesRepository } from '@app/interfaces/sitter-booking-messages-repository.interface';
import { PaginationDto } from '../../../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { SitterBookingsService } from '../sitter-bookings.service';
import { CreateSitterBookingMessageDto } from './dto/create-sitter-booking-message.dto';

@Injectable()
export class SitterBookingMessagesService {
  constructor(
    @Inject(ISitterBookingMessagesRepository)
    private readonly messagesRepository: ISitterBookingMessagesRepository,
    private readonly sitterBookingsService: SitterBookingsService,
  ) {}

  async create(
    user: accounts,
    bookingId: string,
    createMessageDto: CreateSitterBookingMessageDto,
  ) {
    const booking = await this.sitterBookingsService.findOne(user, bookingId);
    this.assertCanMessage(booking.status);

    const type = createMessageDto.type ?? booking_message_type.text;
    this.validateMessagePayload(type, createMessageDto);

    return this.messagesRepository.create({
      sitter_bookings: {
        connect: {
          id: bookingId,
        },
      },
      sender: {
        connect: {
          id: user.id,
        },
      },
      type,
      content: createMessageDto.content?.trim(),
      image_url: createMessageDto.imageUrl,
    });
  }

  async findAll(user: accounts, bookingId: string, pagination: PaginationDto) {
    await this.sitterBookingsService.findOne(user, bookingId);

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.messagesRepository.findAll({
      booking_id: bookingId,
      skip,
      take: limit,
    });

    return paginate(data, total, page, limit);
  }

  private assertCanMessage(status: sitter_bookings_status) {
    if (
      status === sitter_bookings_status.cancelled ||
      status === sitter_bookings_status.rejected
    ) {
      throw new NotFoundException('Booking message thread is not available');
    }
  }

  private validateMessagePayload(
    type: booking_message_type,
    createMessageDto: CreateSitterBookingMessageDto,
  ) {
    if (
      type === booking_message_type.text &&
      !createMessageDto.content?.trim()
    ) {
      throw new BadRequestException('Text messages require content');
    }

    if (type === booking_message_type.image && !createMessageDto.imageUrl) {
      throw new BadRequestException('Image messages require imageUrl');
    }
  }
}
