import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  booking_message_type,
  sitter_bookings_status,
} from '@app/generated/prisma/client';
import { ISitterBookingMessagesRepository } from '@app/interfaces/sitter-booking-messages-repository.interface';
import { Test } from '@nestjs/testing';
import { SitterBookingsService } from '../sitter-bookings.service';
import { SitterBookingMessagesService } from './sitter-booking-messages.service';
import { NotificationsService } from '@app/modules/notifications/notifications.service';

describe('SitterBookingMessagesService', () => {
  const messagesRepository = {
    create: jest.fn(),
    findByClientMessageId: jest.fn(),
    findAll: jest.fn(),
  };
  const sitterBookingsService = {
    findOne: jest.fn(),
  };
  const notificationsService = {
    sendSitterBookingMessageNotification: jest
      .fn()
      .mockResolvedValue(undefined),
  };

  const messageRecord = {
    id: 'message-1',
    booking_id: 'booking-1',
    sender_id: 'account-1',
    type: booking_message_type.text,
    content: 'I will bring food.',
    image_url: null,
    client_message_id: null,
    read_at: null,
    created_at: new Date('2026-06-20T10:00:00.000Z'),
    updated_at: new Date('2026-06-20T10:00:00.000Z'),
    sender: {
      id: 'account-1',
      first_name: 'Thanh',
      last_name: null,
      avatar_url: null,
    },
  };

  let service: SitterBookingMessagesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    messagesRepository.findByClientMessageId.mockResolvedValue(null);

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
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
      ],
    }).compile();

    service = moduleRef.get(SitterBookingMessagesService);
  });

  it('creates text messages for booking participants', async () => {
    sitterBookingsService.findOne.mockResolvedValue({
      id: 'booking-1',
      account_id: 'account-1',
      status: sitter_bookings_status.confirmed,
      sitter: { accountId: 'account-2' },
    });
    messagesRepository.create.mockResolvedValue(messageRecord);

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
    expect(
      notificationsService.sendSitterBookingMessageNotification,
    ).toHaveBeenCalledWith({
      recipientAccountId: 'account-2',
      bookingId: 'booking-1',
    });
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

  it('returns the persisted message for a duplicate client message id', async () => {
    sitterBookingsService.findOne.mockResolvedValue({
      id: 'booking-1',
      account_id: 'account-1',
      status: sitter_bookings_status.confirmed,
      sitter: { accountId: 'account-2' },
    });
    messagesRepository.findByClientMessageId.mockResolvedValue({
      ...messageRecord,
      client_message_id: 'client-1',
    });

    const result = await service.createMessage({
      bookingId: 'booking-1',
      senderAccountId: 'account-1',
      content: 'I will bring food.',
      clientMessageId: 'client-1',
      source: 'websocket',
    });

    expect(result.clientMessageId).toBe('client-1');
    expect(messagesRepository.create).not.toHaveBeenCalled();
    expect(
      notificationsService.sendSitterBookingMessageNotification,
    ).not.toHaveBeenCalled();
  });

  it('rejects messages over the configured maximum length', async () => {
    sitterBookingsService.findOne.mockResolvedValue({
      id: 'booking-1',
      account_id: 'account-1',
      status: sitter_bookings_status.confirmed,
      sitter: { accountId: 'account-2' },
    });

    await expect(
      service.createMessage({
        bookingId: 'booking-1',
        senderAccountId: 'account-1',
        content: 'a'.repeat(2001),
        clientMessageId: 'client-2',
        source: 'websocket',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each([
    sitter_bookings_status.pending,
    sitter_bookings_status.rejected,
    sitter_bookings_status.cancelled,
  ])('does not allow messages on %s bookings', async (status) => {
    sitterBookingsService.findOne.mockResolvedValue({
      id: 'booking-1',
      status,
    });

    await expect(
      service.create({ id: 'account-1' } as never, 'booking-1', {
        content: 'Hello?',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('does not allow clients to spoof system messages', async () => {
    sitterBookingsService.findOne.mockResolvedValue({
      id: 'booking-1',
      status: sitter_bookings_status.confirmed,
    });

    await expect(
      service.create({ id: 'account-1' } as never, 'booking-1', {
        type: booking_message_type.system,
        content: 'Booking confirmed',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(messagesRepository.create).not.toHaveBeenCalled();
  });

  it('lists booking messages after participant checks', async () => {
    sitterBookingsService.findOne.mockResolvedValue({
      id: 'booking-1',
      status: sitter_bookings_status.confirmed,
    });
    messagesRepository.findAll.mockResolvedValue([[messageRecord], 1]);

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

  it('returns the newest history page in chronological display order', async () => {
    sitterBookingsService.findOne.mockResolvedValue({
      id: 'booking-1',
      status: sitter_bookings_status.confirmed,
    });
    const earlier = {
      ...messageRecord,
      id: 'message-earlier',
      created_at: new Date('2026-06-20T09:00:00.000Z'),
    };
    const later = {
      ...messageRecord,
      id: 'message-later',
      created_at: new Date('2026-06-20T10:00:00.000Z'),
    };
    messagesRepository.findAll.mockResolvedValue([[later, earlier], 2]);

    const result = await service.findAll(
      { id: 'account-1' } as never,
      'booking-1',
      { page: 1, limit: 2 },
    );

    expect(result.data.map((message) => message.id)).toEqual([
      'message-earlier',
      'message-later',
    ]);
  });
});
