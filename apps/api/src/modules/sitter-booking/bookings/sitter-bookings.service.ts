import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSitterBookingDto } from './dto/create-sitter-booking.dto';
import {
  accounts,
  pet_sitters,
  sitter_bookings_status,
  sitter_bookings_type,
} from '@app/generated/prisma/client';
import dayjs from 'dayjs';
import { Decimal } from '@prisma/client/runtime/client';
import { CancelSitterBookingDto } from './dto/cancel-sitter-booking.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { IPetSittersRepository } from '@app/interfaces/pet-sitters-repository.interface';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { ISitterBookingsRepository } from '@app/interfaces/sitter-bookings-repository.interface';

@Injectable()
export class SitterBookingsService {
  constructor(
    @Inject(ISitterBookingsRepository)
    private readonly sitterBookingsRepository: ISitterBookingsRepository,
    @Inject(IPetsRepository)
    private readonly petsRepository: IPetsRepository,
    @Inject(IPetSittersRepository)
    private readonly petSittersRepository: IPetSittersRepository,
  ) {}
  async create(user: accounts, createSitterBookingDto: CreateSitterBookingDto) {
    const startTime = dayjs(createSitterBookingDto.startTime).toDate();
    const endTime = dayjs(createSitterBookingDto.endTime).toDate();

    const sitter = await this.petSittersRepository.findById(
      createSitterBookingDto.sitterId,
    );

    if (!sitter) {
      throw new NotFoundException(
        `Pet sitter with ID ${createSitterBookingDto.sitterId} not found`,
      );
    }
    if (sitter.account_id === user.id) {
      throw new BadRequestException('You cannot book yourself as a sitter');
    }
    if (!sitter.is_available) {
      throw new BadRequestException(
        'This pet sitter is currently not available',
      );
    }

    const pet = await this.petsRepository.findByUser(
      user.id,
      createSitterBookingDto.petId,
    );
    if (!pet) {
      throw new NotFoundException(
        `Pet with ID ${createSitterBookingDto.petId} not found or does not belong to you`,
      );
    }

    return this.sitterBookingsRepository.create({
      accounts: {
        connect: {
          id: user.id,
        },
      },
      pet_sitters: {
        connect: {
          id: sitter.id,
        },
      },
      pets: {
        connect: {
          id: pet.id,
        },
      },
      type: createSitterBookingDto.type,
      status: sitter_bookings_status.pending,
      start_time: startTime,
      end_time: endTime,
      total_price: this.calculatePrice(
        sitter,
        createSitterBookingDto.type,
        startTime,
        endTime,
      ),
    });
  }

  async confirm(user: accounts, id: string) {
    const booking = await this.findBookingAsSitter(user, id);
    if (booking.status !== sitter_bookings_status.pending) {
      throw new BadRequestException('Only PENDING bookings can be confirmed');
    }
    return this.sitterBookingsRepository.runSerializable(async (tx) => {
      // Lock sitter row
      const sitter = await this.petSittersRepository.lock(
        tx,
        booking.sitter_id,
      );

      if (!sitter) {
        throw new NotFoundException(
          `Pet sitter with ID ${booking.sitter_id} not found`,
        );
      }

      // Re-check slot count with fresh locked value
      if (sitter.active_bookings_count >= sitter.max_concurrent_bookings) {
        throw new BadRequestException(
          `You have reached your maximum concurrent bookings (${sitter.max_concurrent_bookings})`,
        );
      }

      // Re-check overlap — PENDING from other owners does NOT block
      // const overlapping =
      //   await this.sitterBookingsRepository.findOverlappingInTx(
      //     tx,
      //     booking.sitter_id,
      //     booking.start_time,
      //     booking.end_time,
      //     id,
      //   );
      // if (overlapping) {
      //   throw new BadRequestException(
      //     'This time slot has already been confirmed for another booking.',
      //   );
      // }

      return this.sitterBookingsRepository.confirmInTx(tx, id);
    });
  }

  async reject(user: accounts, id: string) {
    const booking = await this.findBookingAsSitter(user, id);
    if (booking.status !== sitter_bookings_status.pending) {
      throw new BadRequestException('Only PENDING bookings can be reject');
    }

    return this.sitterBookingsRepository.update(id, {
      status: sitter_bookings_status.rejected,
    });
  }

  async complete(user: accounts, id: string) {
    const booking = await this.findBookingAsSitter(user, id);
    if (
      booking.status !== sitter_bookings_status.confirmed &&
      booking.status !== sitter_bookings_status.active
    ) {
      throw new BadRequestException(
        'Only CONFIRMED or ACTIVE bookings can be completed',
      );
    }

    return this.sitterBookingsRepository.update(id, {
      status: sitter_bookings_status.completed,
    });
  }

  async cancel(user: accounts, id: string, dto: CancelSitterBookingDto) {
    const booking = await this.sitterBookingsRepository.findById(id);
    if (!booking) {
      throw new NotFoundException(`Bookings with ID ${id} not found`);
    }

    const isSitter = booking.pet_sitters.account_id === user.id;
    const isOwner = booking.account_id === user.id;

    if (!isSitter && !isOwner) {
      throw new ForbiddenException(
        'You do not have permission to cancel this booking',
      );
    }

    const cancellable: sitter_bookings_status[] = [
      sitter_bookings_status.pending,
      sitter_bookings_status.confirmed,
    ];

    if (!cancellable.includes(booking.status)) {
      throw new BadRequestException(
        'This booking cannot be cancelled at its current status',
      );
    }

    return this.sitterBookingsRepository.cancel(id, user.id, dto.reason);
  }

  async findAll(
    user: accounts,
    pagination: PaginationDto,
    status?: sitter_bookings_status,
  ) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.sitterBookingsRepository.findAllByUser({
      skip,
      take: limit,
      account_id: user.id,
      status,
    });

    return paginate(data, total, page, limit);
  }

  async findAllBySitter(
    user: accounts,
    pagination: PaginationDto,
    status?: sitter_bookings_status,
  ) {
    const sitter = await this.petSittersRepository.findByUser(user.id);
    if (!sitter) {
      throw new NotFoundException('You are not registered as a pet sitter');
    }
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.sitterBookingsRepository.findAllBySitter({
      skip,
      take: limit,
      sitter_id: sitter.id,
      status,
    });

    return paginate(data, total, page, limit);
  }

  async findOne(user: accounts, id: string) {
    const booking = await this.checkActiveById(id);
    if (!booking) {
      throw new NotFoundException(`Bookings with ID ${id} not found`);
    }

    const isSitter = booking.pet_sitters.account_id === user.id;
    const isOwner = booking.account_id === user.id;

    if (!isSitter && !isOwner) {
      throw new ForbiddenException(
        'You do not have permission to view this booking',
      );
    }
    return booking;
  }

  active() {
    const now = dayjs().toDate();
    return this.sitterBookingsRepository.activeDue(now);
  }

  private async checkActiveById(id: string) {
    const booking = await this.sitterBookingsRepository.findById(id);
    if (!booking) return null;

    const now = dayjs().toDate();

    if (
      booking.status === sitter_bookings_status.confirmed &&
      dayjs(booking.start_time).isBefore(now)
    ) {
      return this.sitterBookingsRepository.update(id, {
        status: sitter_bookings_status.active,
      });
    }
    return booking;
  }

  private async findBookingAsSitter(user: accounts, id: string) {
    const sitter = await this.petSittersRepository.findByUser(user.id);
    if (!sitter)
      throw new NotFoundException('You are not registered as a pet sitter');

    const booking = await this.sitterBookingsRepository.findById(id);

    if (!booking || booking.sitter_id !== sitter.id) {
      throw new NotFoundException(`Bookings with ID ${id} not found`);
    }
    return booking;
  }

  private calculatePrice(
    sitter: pet_sitters,
    type: sitter_bookings_type,
    start: Date,
    end: Date,
  ): Decimal | null {
    const diffMs = end.getTime() - start.getTime();

    if (type === sitter_bookings_type.hourly && sitter.hourly_rate) {
      const hours = diffMs / (1000 * 60 * 60);
      return new Decimal(sitter.hourly_rate).mul(new Decimal(hours.toFixed(2)));
    }

    if (type === sitter_bookings_type.daily && sitter.daily_rate) {
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return new Decimal(sitter.daily_rate).mul(new Decimal(days));
    }

    return null;
  }
}
