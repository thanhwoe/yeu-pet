import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { IEventBusService } from '@app/interfaces/event-bus.interface';
import { IPetSittersRepository } from '@app/interfaces/pet-sitters-repository.interface';
import { IPetsRepository } from '@app/interfaces/pets-repository.interface';
import { ISitterBookingsRepository } from '@app/interfaces/sitter-bookings-repository.interface';
import {
  accounts,
  sitter_bookings_status,
  sitter_bookings_type,
} from '@app/generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/client';
import { SitterBookingsService } from './sitter-bookings.service';
import { SITTER_BOOKING_EVENT_CHANNELS } from './sitter-booking.events';
import { QUEUE_EVENT_CHANNELS } from '../../shared/queue/queue.events';

const accountId = '123e4567-e89b-42d3-a456-426614174000';
const sitterAccountId = '123e4567-e89b-42d3-a456-426614174001';
const sitterId = '123e4567-e89b-42d3-a456-426614174002';
const petId = '123e4567-e89b-42d3-a456-426614174003';
const bookingId = '123e4567-e89b-42d3-a456-426614174004';

const user = { id: accountId } as accounts;

const dto = {
  idempotencyKey: 'booking-request-1',
  petId,
  sitterId,
  startTime: '2026-06-02T10:00:00.000Z',
  endTime: '2026-06-02T12:00:00.000Z',
  type: sitter_bookings_type.hourly,
};

const sitter = {
  id: sitterId,
  account_id: sitterAccountId,
  hourly_rate: new Decimal(20),
  daily_rate: new Decimal(100),
  is_available: true,
  max_concurrent_bookings: 2,
};

const lockedSitter = {
  id: sitterId,
  account_id: sitterAccountId,
  is_available: true,
  max_concurrent_bookings: 2,
};

const pet = {
  id: petId,
};

const booking = {
  id: bookingId,
  account_id: accountId,
  sitter_id: sitterId,
  pet_id: petId,
  idempotency_key: dto.idempotencyKey,
  type: sitter_bookings_type.hourly,
  status: sitter_bookings_status.pending,
  start_time: new Date(dto.startTime),
  end_time: new Date(dto.endTime),
  expires_at: new Date('2026-06-02T10:15:00.000Z'),
};

const expiredBooking = {
  ...booking,
  status: sitter_bookings_status.cancelled,
  accounts: {
    email: 'owner@example.com',
    first_name: 'Owner',
  },
  pets: {
    name: 'Mochi',
  },
  pet_sitters: {
    accounts: {
      email: 'sitter@example.com',
      first_name: 'Sitter',
      last_name: 'One',
    },
  },
};

const createSitterBookingsRepository = () =>
  ({
    activeDue: jest.fn(),
    cancel: jest.fn(),
    confirmInTx: jest.fn(),
    countHeldOverlappingInTx: jest.fn(),
    create: jest.fn(),
    createInTx: jest.fn(),
    expirePending: jest.fn(),
    findAllBySitter: jest.fn(),
    findAllByUser: jest.fn(),
    findById: jest.fn(),
    findByIdempotencyKey: jest.fn(),
    findByIdempotencyKeyInTx: jest.fn(),
    findOverlappingInTx: jest.fn(),
    runSerializable: jest.fn((callback) => callback({} as never)),
    update: jest.fn(),
  }) as jest.Mocked<ISitterBookingsRepository>;

const createPetSittersRepository = () =>
  ({
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    lock: jest.fn(),
    update: jest.fn(),
  }) as jest.Mocked<IPetSittersRepository>;

const createPetsRepository = () =>
  ({
    findByUser: jest.fn(),
  }) as unknown as jest.Mocked<IPetsRepository>;

const createEventBus = () =>
  ({
    publish: jest.fn(() => Promise.resolve()),
    subscribe: jest.fn(),
  }) as unknown as jest.Mocked<IEventBusService>;

describe('SitterBookingsService', () => {
  let sitterBookingsRepository: ReturnType<
    typeof createSitterBookingsRepository
  >;
  let petSittersRepository: ReturnType<typeof createPetSittersRepository>;
  let petsRepository: ReturnType<typeof createPetsRepository>;
  let eventBus: ReturnType<typeof createEventBus>;
  let service: SitterBookingsService;

  beforeEach(() => {
    sitterBookingsRepository = createSitterBookingsRepository();
    petSittersRepository = createPetSittersRepository();
    petsRepository = createPetsRepository();
    eventBus = createEventBus();
    service = new SitterBookingsService(
      sitterBookingsRepository,
      petsRepository,
      petSittersRepository,
      eventBus,
    );

    sitterBookingsRepository.findByIdempotencyKey.mockResolvedValue(null);
    sitterBookingsRepository.findByIdempotencyKeyInTx.mockResolvedValue(null);
    sitterBookingsRepository.countHeldOverlappingInTx.mockResolvedValue(0);
    sitterBookingsRepository.createInTx.mockResolvedValue(booking as never);
    sitterBookingsRepository.expirePending.mockResolvedValue([]);
    petSittersRepository.findById.mockResolvedValue(sitter as never);
    petSittersRepository.lock.mockResolvedValue(lockedSitter);
    petsRepository.findByUser.mockResolvedValue(pet as never);
  });

  it('returns an existing booking for a repeated idempotency key', async () => {
    sitterBookingsRepository.findByIdempotencyKey.mockResolvedValue(
      booking as never,
    );

    const result = await service.create(user, dto);

    expect(result).toMatchObject({
      id: booking.id,
      payment: {
        inApp: false,
      },
    });
    expect(sitterBookingsRepository.runSerializable.mock.calls).toHaveLength(0);
    expect(eventBus.publish.mock.calls).toHaveLength(0);
  });

  it('creates a pending hold under a sitter row lock and publishes a domain event', async () => {
    const result = await service.create(user, dto);

    expect(result).toMatchObject({
      id: booking.id,
      payment: {
        inApp: false,
        note: expect.stringContaining('outside YeuPet') as string,
      },
    });
    expect(petSittersRepository.lock.mock.calls).toEqual([[{}, sitterId]]);
    expect(
      sitterBookingsRepository.countHeldOverlappingInTx.mock.calls[0].slice(
        1,
        4,
      ),
    ).toEqual([sitterId, new Date(dto.startTime), new Date(dto.endTime)]);
    const createData = sitterBookingsRepository.createInTx.mock.calls[0][1];
    expect(createData.expires_at).toBeInstanceOf(Date);
    expect(createData).toMatchObject({
      idempotency_key: dto.idempotencyKey,
      owner_notes: undefined,
      status: sitter_bookings_status.pending,
    });
    expect(String(createData.payment_note)).toContain('outside YeuPet');
    expect(eventBus.publish.mock.calls).toEqual([
      [
        SITTER_BOOKING_EVENT_CHANNELS.BOOKING_CREATED,
        expect.objectContaining({
          accountId,
          bookingId,
          petId,
          sitterId,
        }),
      ],
    ]);
  });

  it('rejects creation when overlapping held bookings reach sitter capacity', async () => {
    sitterBookingsRepository.countHeldOverlappingInTx.mockResolvedValue(2);

    await expect(service.create(user, dto)).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(sitterBookingsRepository.createInTx.mock.calls).toHaveLength(0);
    expect(eventBus.publish.mock.calls).toHaveLength(0);
  });

  it('rejects self-booking before opening a transaction', async () => {
    petSittersRepository.findById.mockResolvedValue({
      ...sitter,
      account_id: accountId,
    } as never);

    await expect(service.create(user, dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(sitterBookingsRepository.runSerializable.mock.calls).toHaveLength(0);
  });

  it('rejects confirmation after the pending hold expires', async () => {
    petSittersRepository.findByUser.mockResolvedValue({
      id: sitterId,
    } as never);
    sitterBookingsRepository.findById.mockResolvedValue({
      ...booking,
      expires_at: new Date('2020-01-01T00:00:00.000Z'),
      pet_sitters: {
        account_id: sitterAccountId,
      },
    } as never);

    await expect(
      service.confirm({ id: sitterAccountId } as accounts, bookingId),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(sitterBookingsRepository.runSerializable.mock.calls).toHaveLength(0);
  });

  it('returns not found when the booking sitter is missing on confirmation', async () => {
    petSittersRepository.findByUser.mockResolvedValue(null);

    await expect(
      service.confirm({ id: sitterAccountId } as accounts, bookingId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('expires pending holds and dispatches expiry notifications', async () => {
    sitterBookingsRepository.expirePending.mockResolvedValue([
      expiredBooking as never,
    ]);

    const result = await service.expirePending();

    expect(result).toEqual({ count: 1 });
    expect(
      sitterBookingsRepository.expirePending.mock.calls[0][0],
    ).toBeInstanceOf(Date);
    expect(eventBus.publish.mock.calls).toEqual([
      [
        SITTER_BOOKING_EVENT_CHANNELS.BOOKING_EXPIRED,
        expect.objectContaining({
          accountId,
          bookingId,
          petId,
          sitterId,
        }),
      ],
      [
        QUEUE_EVENT_CHANNELS.EMAIL_REQUESTED,
        expect.objectContaining({
          accountId,
          bookingId,
          subject: 'Your YeuPet booking hold expired',
          to: 'owner@example.com',
        }),
      ],
      [
        QUEUE_EVENT_CHANNELS.EMAIL_REQUESTED,
        expect.objectContaining({
          bookingId,
          subject: 'A YeuPet booking hold expired',
          to: 'sitter@example.com',
        }),
      ],
    ]);
  });

  it('does not publish expiry side effects when no holds expire', async () => {
    const result = await service.expirePending();

    expect(result).toEqual({ count: 0 });
    expect(eventBus.publish.mock.calls).toHaveLength(0);
  });

  it('lists current user bookings by owner or sitter role', async () => {
    sitterBookingsRepository.findAllByUser.mockResolvedValue([
      [booking as never],
      1,
    ]);
    sitterBookingsRepository.findAllBySitter.mockResolvedValue([
      [booking as never],
      1,
    ]);
    petSittersRepository.findByUser.mockResolvedValue({
      id: sitterId,
    } as never);

    await service.findAllMe(user, { page: 1, limit: 10 }, 'owner');
    await service.findAllMe(
      { id: sitterAccountId } as accounts,
      { page: 1, limit: 10 },
      'sitter',
    );

    expect(sitterBookingsRepository.findAllByUser.mock.calls).toEqual([
      [
        expect.objectContaining({
          account_id: accountId,
        }),
      ],
    ]);
    expect(sitterBookingsRepository.findAllBySitter.mock.calls).toEqual([
      [
        expect.objectContaining({
          sitter_id: sitterId,
        }),
      ],
    ]);
  });
});
