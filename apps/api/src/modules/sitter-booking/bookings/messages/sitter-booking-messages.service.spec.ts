import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  booking_message_type,
  sitter_bookings_status,
} from '@app/generated/prisma/client';
import { ISitterBookingMessagesRepository } from '@app/interfaces/sitter-booking-messages-repository.interface';
import { Test } from '@nestjs/testing';
import { SitterBookingsService } from '../sitter-bookings.service';
import { SitterBookingMessagesService } from './sitter-booking-messages.service';

describe('SitterBookingMessagesService', () => {
  const messagesRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
  };
  const sitterBookingsService = {
    findOne: jest.fn(),
  };

  let service: SitterBookingMessagesService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        SitterBookingMessagesService,
        {
          provide: ISitterBookingMessagesRepository,
          useValue: messagesRepository,
        },
        {
          provide: SitterBookingsService,
          useValue: sitterBookingsService,
        },
      ],
    }).compile();

    service = moduleRef.get(SitterBookingMessagesService);
  });

  it('creates text messages for booking participants', async () => {
    sitterBookingsService.findOne.mockResolvedValue({
      id: 'booking-1',
      status: sitter_bookings_status.confirmed,
    });
    messagesRepository.create.mockResolvedValue({ id: 'message-1' });

    await service.create({ id: 'account-1' } as never, 'booking-1', {
      content: 'I will bring food.',
    });

    expect(sitterBookingsService.findOne).toHaveBeenCalledWith(
      { id: 'account-1' },
      'booking-1',
    );
    expect(messagesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'I will bring food.',
        type: booking_message_type.text,
      }),
    );
  });

  it('rejects empty text messages', async () => {
    sitterBookingsService.findOne.mockResolvedValue({
      id: 'booking-1',
      status: sitter_bookings_status.confirmed,
    });

    await expect(
      service.create({ id: 'account-1' } as never, 'booking-1', {
        content: ' ',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not allow messages on rejected or cancelled bookings', async () => {
    sitterBookingsService.findOne.mockResolvedValue({
      id: 'booking-1',
      status: sitter_bookings_status.cancelled,
    });

    await expect(
      service.create({ id: 'account-1' } as never, 'booking-1', {
        content: 'Hello?',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists booking messages after participant checks', async () => {
    sitterBookingsService.findOne.mockResolvedValue({
      id: 'booking-1',
      status: sitter_bookings_status.confirmed,
    });
    messagesRepository.findAll.mockResolvedValue([[{ id: 'message-1' }], 1]);

    const result = await service.findAll(
      { id: 'account-1' } as never,
      'booking-1',
      { page: 2, limit: 5 },
    );

    expect(messagesRepository.findAll).toHaveBeenCalledWith({
      booking_id: 'booking-1',
      skip: 5,
      take: 5,
    });
    expect(result.meta.total).toBe(1);
  });
});
