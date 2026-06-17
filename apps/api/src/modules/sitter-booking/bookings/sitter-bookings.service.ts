import {
  accounts,
  pet_sitters,
  sitter_bookings,
  sitter_bookings_status,
  sitter_bookings_type,
} from '@app/generated/prisma/client';
import { IEventBusService } from '@app/interfaces/event-bus.interface';
import type { EmailJobParams } from '@app/interfaces/email-jobs.interface';
import { IPetSittersRepository } from '@app/interfaces/pet-sitters-repository.interface';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import {
  ExpiredSitterBooking,
  ISitterBookingsRepository,
  SitterBookingWithRelations,
} from '@app/interfaces/sitter-bookings-repository.interface';
import { paginate } from '@app/utils/pagination';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Decimal,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/client';
import dayjs from 'dayjs';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { CancelSitterBookingDto } from './dto/cancel-sitter-booking.dto';
import { CreateSitterBookingDto } from './dto/create-sitter-booking.dto';
import {
  SITTER_BOOKING_EVENT_CHANNELS,
  SitterBookingCreatedEvent,
  SitterBookingExpiredEvent,
} from './sitter-booking.events';
import { QUEUE_EVENT_CHANNELS } from '../../shared/queue/queue.events';

const BOOKING_HOLD_MINUTES = 15;
const EXTERNAL_PAYMENT_NOTE =
  'Payment is handled outside YeuPet in Phase 1. Coordinate directly with the sitter.';

type SitterBookingRelationSource = sitter_bookings &
  Partial<SitterBookingWithRelations>;

type SitterBookingResponse<T extends sitter_bookings = sitter_bookings> =
  Omit<T, 'accounts' | 'pets' | 'pet_sitters'> & {
  payment: {
    inApp: false;
    note: string;
  };
  owner?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
  pet?: {
    id: string;
    name: string;
    age: number | null;
    birthdate: Date | null;
    breed: string | null;
    weight: string | null;
    weightValue: Decimal | null;
    weightUnit: string | null;
    color: string | null;
    avatarUrl: string | null;
    gender: string | null;
    species: string | null;
    notes: string | null;
  };
  sitter?: {
    id: string;
    accountId: string;
    displayName: string | null;
    bio: string | null;
    address: string;
    city: string | null;
    district: string | null;
    ward: string | null;
    experience: string | null;
    serviceNotes: string | null;
    hourlyRate: Decimal;
    dailyRate: Decimal;
    maxConcurrentBookings: number;
    activeBookingsCount: number;
    completedBookingsCount: number;
    avgRating: Decimal;
    totalReviews: number;
    isAvailable: boolean;
    isVerified: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
    account: {
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    };
  };
};

@Injectable()
export class SitterBookingsService {
  private readonly logger = new Logger(SitterBookingsService.name);

  constructor(
    @Inject(ISitterBookingsRepository)
    private readonly sitterBookingsRepository: ISitterBookingsRepository,
    @Inject(IPetsRepository)
    private readonly petsRepository: IPetsRepository,
    @Inject(IPetSittersRepository)
    private readonly petSittersRepository: IPetSittersRepository,
    @Inject(IEventBusService)
    private readonly eventBusService: IEventBusService,
  ) {}
  async create(user: accounts, createSitterBookingDto: CreateSitterBookingDto) {
    const idempotencyKey = createSitterBookingDto.idempotencyKey.trim();
    const startTime = dayjs(createSitterBookingDto.startTime).toDate();
    const endTime = dayjs(createSitterBookingDto.endTime).toDate();

    const existingBooking =
      await this.sitterBookingsRepository.findByIdempotencyKey(
        user.id,
        idempotencyKey,
      );

    if (existingBooking) {
      return this.toBookingResponse(existingBooking);
    }

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

    const result = await this.sitterBookingsRepository
      .runSerializable(async (tx) => {
        const existingBookingInTx =
          await this.sitterBookingsRepository.findByIdempotencyKeyInTx(
            tx,
            user.id,
            idempotencyKey,
          );

        if (existingBookingInTx) {
          return {
            booking: existingBookingInTx,
            created: false,
          };
        }

        const lockedSitter = await this.petSittersRepository.lock(
          tx,
          sitter.id,
        );

        if (!lockedSitter) {
          throw new NotFoundException(
            `Pet sitter with ID ${sitter.id} not found`,
          );
        }

        if (!lockedSitter.is_available) {
          throw new BadRequestException(
            'This pet sitter is currently not available',
          );
        }

        const heldOverlappingBookings =
          await this.sitterBookingsRepository.countHeldOverlappingInTx(
            tx,
            lockedSitter.id,
            startTime,
            endTime,
            new Date(),
          );

        if (heldOverlappingBookings >= lockedSitter.max_concurrent_bookings) {
          throw new ConflictException(
            `This pet sitter is fully booked for the selected timeframe`,
          );
        }

        const expiresAt = dayjs().add(BOOKING_HOLD_MINUTES, 'minute').toDate();

        const booking = await this.sitterBookingsRepository.createInTx(tx, {
          accounts: {
            connect: {
              id: user.id,
            },
          },
          pet_sitters: {
            connect: {
              id: lockedSitter.id,
            },
          },
          pets: {
            connect: {
              id: pet.id,
            },
          },
          idempotency_key: idempotencyKey,
          type: createSitterBookingDto.type,
          status: sitter_bookings_status.pending,
          start_time: startTime,
          end_time: endTime,
          expires_at: expiresAt,
          owner_notes: createSitterBookingDto.ownerNotes,
          sitter_notes: createSitterBookingDto.sitterNotes,
          care_instructions: createSitterBookingDto.careInstructions,
          payment_note: EXTERNAL_PAYMENT_NOTE,
          total_price: this.calculatePrice(
            sitter,
            createSitterBookingDto.type,
            startTime,
            endTime,
          ),
        });

        return {
          booking,
          created: true,
        };
      })
      .catch((error: unknown) =>
        this.handleIdempotentCreateConflict(user.id, idempotencyKey, error),
      );

    if (result.created) {
      this.publishBookingCreated({
        accountId: user.id,
        bookingId: result.booking.id,
        endTime: result.booking.end_time.toISOString(),
        expiresAt: result.booking.expires_at?.toISOString() ?? '',
        petId: result.booking.pet_id,
        sitterId: result.booking.sitter_id,
        startTime: result.booking.start_time.toISOString(),
        type: result.booking.type,
      });
    }

    return this.toBookingResponse(result.booking);
  }

  private async handleIdempotentCreateConflict(
    accountId: string,
    idempotencyKey: string,
    error: unknown,
  ): Promise<{ booking: SitterBookingWithRelations; created: false }> {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const existingBooking =
        await this.sitterBookingsRepository.findByIdempotencyKey(
          accountId,
          idempotencyKey,
        );

      if (existingBooking) {
        return {
          booking: existingBooking,
          created: false,
        };
      }
    }

    throw error;
  }

  private publishBookingCreated(event: SitterBookingCreatedEvent): void {
    this.eventBusService
      .publish(SITTER_BOOKING_EVENT_CHANNELS.BOOKING_CREATED, event)
      .catch((error) => {
        this.logger.error(
          `Failed to publish booking created event: ${(error as Error).message}`,
        );
      });
  }

  private publishBookingExpired(event: SitterBookingExpiredEvent): void {
    this.eventBusService
      .publish(SITTER_BOOKING_EVENT_CHANNELS.BOOKING_EXPIRED, event)
      .catch((error) => {
        this.logger.error(
          `Failed to publish booking expired event: ${(error as Error).message}`,
        );
      });
  }

  private dispatchEmail(params: EmailJobParams): void {
    this.eventBusService
      .publish(QUEUE_EVENT_CHANNELS.EMAIL_REQUESTED, params)
      .catch((error) => {
        this.logger.error(
          `Failed to dispatch booking expiry email: ${(error as Error).message}`,
        );
      });
  }

  async confirm(user: accounts, id: string) {
    const booking = await this.findBookingAsSitter(user, id);
    if (booking.status !== sitter_bookings_status.pending) {
      throw new BadRequestException('Only PENDING bookings can be confirmed');
    }

    if (booking.expires_at && dayjs(booking.expires_at).isBefore(dayjs())) {
      throw new BadRequestException('This booking hold has expired');
    }

    return this.sitterBookingsRepository.runSerializable(async (tx) => {
      const sitter = await this.petSittersRepository.lock(
        tx,
        booking.sitter_id,
      );

      if (!sitter) {
        throw new NotFoundException(
          `Pet sitter with ID ${booking.sitter_id} not found`,
        );
      }

      if (!sitter.is_available) {
        throw new BadRequestException(
          'This pet sitter is currently not available',
        );
      }

      const heldOverlappingBookings =
        await this.sitterBookingsRepository.countHeldOverlappingInTx(
          tx,
          sitter.id,
          booking.start_time,
          booking.end_time,
          new Date(),
          id,
        );

      if (heldOverlappingBookings >= sitter.max_concurrent_bookings) {
        throw new ConflictException(
          `This pet sitter is fully booked for the selected timeframe`,
        );
      }

      return this.toBookingResponse(
        await this.sitterBookingsRepository.confirmInTx(tx, id),
      );
    });
  }

  async reject(user: accounts, id: string) {
    const booking = await this.findBookingAsSitter(user, id);
    if (booking.status !== sitter_bookings_status.pending) {
      throw new BadRequestException('Only PENDING bookings can be reject');
    }

    return this.toBookingResponse(
      await this.sitterBookingsRepository.update(id, {
        status: sitter_bookings_status.rejected,
      }),
    );
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

    return this.toBookingResponse(
      await this.sitterBookingsRepository.update(id, {
        status: sitter_bookings_status.completed,
      }),
    );
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

    return this.toBookingResponse(
      await this.sitterBookingsRepository.cancel(id, user.id, dto.reason),
    );
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

    return paginate(
      data.map((booking) => this.toBookingResponse(booking)),
      total,
      page,
      limit,
    );
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

    return paginate(
      data.map((booking) => this.toBookingResponse(booking)),
      total,
      page,
      limit,
    );
  }

  async findAllMe(
    user: accounts,
    pagination: PaginationDto,
    role: string | undefined,
    status?: sitter_bookings_status,
  ) {
    if (!role || role === 'owner') {
      return this.findAll(user, pagination, status);
    }

    if (role === 'sitter') {
      return this.findAllBySitter(user, pagination, status);
    }

    throw new BadRequestException('role must be one of: owner, sitter');
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
    return this.toBookingResponse(booking);
  }

  active() {
    const now = dayjs().toDate();
    return this.sitterBookingsRepository.activeDue(now);
  }

  async expirePending() {
    const now = dayjs().toDate();
    const expiredBookings =
      await this.sitterBookingsRepository.expirePending(now);

    for (const booking of expiredBookings) {
      this.publishBookingExpired({
        accountId: booking.account_id,
        bookingId: booking.id,
        expiredAt: now.toISOString(),
        petId: booking.pet_id,
        sitterId: booking.sitter_id,
      });

      this.dispatchExpiryEmails(booking);
    }

    return {
      count: expiredBookings.length,
    };
  }

  private dispatchExpiryEmails(booking: ExpiredSitterBooking): void {
    const ownerEmail = booking.accounts.email;
    const sitterEmail = booking.pet_sitters.accounts.email;
    const ownerFirstName = booking.accounts.first_name ?? 'there';

    if (ownerEmail) {
      this.dispatchEmail({
        accountId: booking.account_id,
        bookingId: booking.id,
        to: ownerEmail,
        subject: 'Your YeuPet booking hold expired',
        text: `Hi ${ownerFirstName}, your booking hold for ${booking.pets.name} has expired because it was not confirmed in time.`,
      });
    }

    if (sitterEmail && sitterEmail !== ownerEmail) {
      this.dispatchEmail({
        bookingId: booking.id,
        to: sitterEmail,
        subject: 'A YeuPet booking hold expired',
        text: `A pending booking hold for ${booking.pets.name} has expired and no longer reserves capacity.`,
      });
    }
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

  private toBookingResponse<T extends sitter_bookings>(
    booking: T | SitterBookingWithRelations,
  ): SitterBookingResponse<T> {
    const {
      accounts: owner,
      pet_sitters: sitter,
      pets: pet,
      ...baseBooking
    } = booking as SitterBookingRelationSource;

    return {
      ...baseBooking,
      payment: {
        inApp: false as const,
        note: baseBooking.payment_note ?? EXTERNAL_PAYMENT_NOTE,
      },
      owner: owner
        ? {
            id: owner.id,
            firstName: owner.first_name,
            lastName: owner.last_name,
            avatarUrl: owner.avatar_url,
          }
        : undefined,
      pet: pet
        ? {
            id: pet.id,
            name: pet.name,
            age: pet.age,
            birthdate: pet.birthdate,
            breed: pet.breed,
            weight: pet.weight,
            weightValue: pet.weight_value,
            weightUnit: pet.weight_unit,
            color: pet.color,
            avatarUrl: pet.avatar_url,
            gender: pet.gender,
            species: pet.species,
            notes: pet.notes,
          }
        : undefined,
      sitter: sitter
        ? {
            id: sitter.id,
            accountId: sitter.account_id,
            displayName: sitter.display_name,
            bio: sitter.bio,
            address: sitter.address,
            city: sitter.city,
            district: sitter.district,
            ward: sitter.ward,
            experience: sitter.experience,
            serviceNotes: sitter.service_notes,
            hourlyRate: sitter.hourly_rate,
            dailyRate: sitter.daily_rate,
            maxConcurrentBookings: sitter.max_concurrent_bookings,
            activeBookingsCount: sitter.active_bookings_count,
            completedBookingsCount: sitter.completed_bookings_count,
            avgRating: sitter.avg_rating,
            totalReviews: sitter.total_reviews,
            isAvailable: sitter.is_available,
            isVerified: sitter.is_verified,
            createdAt: sitter.created_at,
            updatedAt: sitter.updated_at,
            account: {
              firstName: sitter.accounts.first_name,
              lastName: sitter.accounts.last_name,
              avatarUrl: sitter.accounts.avatar_url,
            },
          }
        : undefined,
    } as SitterBookingResponse<T>;
  }
}
