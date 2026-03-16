import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSitterReviewDto } from './dto/create-sitter-review.dto';
import { SitterBookingsRepository } from '../sitter-bookings/sitter-bookings.repository';
import { accounts, sitter_bookings_status } from '@app/generated/prisma/client';
import { SitterReviewsRepository } from './sitter-reviews.repository';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';

@Injectable()
export class SitterReviewsService {
  constructor(
    private readonly sitterReviewsRepository: SitterReviewsRepository,
    private readonly sitterBookingsRepository: SitterBookingsRepository,
  ) {}
  async create(user: accounts, createSitterReviewDto: CreateSitterReviewDto) {
    const booking = await this.sitterBookingsRepository.findById(
      createSitterReviewDto.bookingId,
    );
    if (!booking || booking.sitter_id !== createSitterReviewDto.sitterId) {
      throw new NotFoundException(
        `Bookings with ID ${createSitterReviewDto.bookingId} not found`,
      );
    }

    if (booking.account_id !== user.id) {
      throw new ForbiddenException('You can only review your own bookings');
    }

    if (booking.status !== sitter_bookings_status.completed) {
      throw new BadRequestException('You can only review completed bookings');
    }

    const existing = await this.sitterReviewsRepository.findByBooking(
      booking.id,
    );
    if (existing) {
      throw new ConflictException('You have already reviewed this booking');
    }

    return this.sitterReviewsRepository.create({
      accounts: {
        connect: {
          id: user.id,
        },
      },
      sitter_bookings: {
        connect: {
          id: createSitterReviewDto.bookingId,
        },
      },
      pet_sitters: {
        connect: {
          id: createSitterReviewDto.sitterId,
        },
      },
      rating: createSitterReviewDto.rating,
      comment: createSitterReviewDto.comment,
    });
  }

  async findAll(id: string, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.sitterReviewsRepository.findAll({
      skip,
      take: limit,
      sitter_id: id,
    });

    return paginate(data, total, page, limit);
  }
}
