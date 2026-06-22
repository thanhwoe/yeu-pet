import {
  notifications_status,
  reminder_repeat_frequency,
  reminder_status,
  reminder_type,
} from '@app/generated/prisma/client';
import { NotificationsService } from './notifications.service';

const mockFirebaseSend = jest.fn();

jest.mock('firebase-admin', () => ({
  apps: [{}],
  messaging: jest.fn(() => ({ send: mockFirebaseSend })),
}));

const recipientAccountId = '123e4567-e89b-42d3-a456-426614174001';
const bookingId = '123e4567-e89b-42d3-a456-426614174004';
const pushToken = 'fcm-registration-token';

describe('NotificationsService booking notifications', () => {
  const configService = {
    getOrThrow: jest.fn(() => 'yeu-pet'),
  };
  const notificationsRepository = {
    create: jest.fn(),
    countBadge: jest.fn(),
  };
  const notificationDeliveriesRepository = {
    create: jest.fn(),
  };
  const userDevicesRepository = {
    deactivateIfTokenMatches: jest.fn(),
    findActiveByAccountId: jest.fn(),
    findActiveOwnedDevice: jest.fn(),
  };
  const userSettingsRepository = {
    findById: jest.fn(),
  };
  const caslAbilityFactory = {};
  let service: NotificationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationsService(
      configService as never,
      notificationsRepository as never,
      notificationDeliveriesRepository as never,
      userDevicesRepository as never,
      userSettingsRepository as never,
      caslAbilityFactory as never,
    );

    notificationsRepository.create.mockResolvedValue({
      id: 'notification-id',
      account_id: recipientAccountId,
      title: 'New booking request',
      body: 'You have a new booking request for Mochi.',
      data: { bookingId, notificationType: 'sitter_booking_request' },
      deep_link: `/sitter?tab=bookings&role=sitter&bookingId=${bookingId}`,
      image_url: null,
    });
    notificationsRepository.countBadge.mockResolvedValue(1);
    userSettingsRepository.findById.mockResolvedValue(null);
    const activeDevice = {
      id: 'device-id',
      account_id: recipientAccountId,
      push_token: pushToken,
      is_active: true,
    };
    userDevicesRepository.findActiveByAccountId.mockResolvedValue([
      activeDevice,
    ]);
    userDevicesRepository.findActiveOwnedDevice.mockResolvedValue(activeDevice);
  });

  it('stores and sends a booking request through Firebase Admin', async () => {
    mockFirebaseSend.mockResolvedValue('firebase-message-id');

    await service.sendSitterBookingRequestNotification({
      recipientAccountId,
      bookingId,
      petName: 'Mochi',
    });

    expect(notificationsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: recipientAccountId,
        title: 'New booking request',
        body: 'You have a new booking request for Mochi.',
        deep_link: `/sitter?tab=bookings&role=sitter&bookingId=${bookingId}`,
      }),
    );
    expect(mockFirebaseSend).toHaveBeenCalledWith(
      expect.objectContaining({
        token: pushToken,
        notification: expect.objectContaining({
          title: 'New booking request',
          body: 'You have a new booking request for Mochi.',
        }) as { title: string; body: string },
        data: expect.objectContaining({
          bookingId,
          notificationType: 'sitter_booking_request',
        }) as Record<string, string>,
      }),
    );
    expect(notificationDeliveriesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: recipientAccountId,
        status: notifications_status.sent,
        push_token: pushToken,
      }),
    );
  });

  it('deactivates an invalid Firebase registration token', async () => {
    mockFirebaseSend.mockRejectedValue({
      code: 'messaging/registration-token-not-registered',
      message: 'Device is not registered',
    });

    await service.sendSitterBookingRequestNotification({
      recipientAccountId,
      bookingId,
      petName: 'Mochi',
    });

    expect(notificationDeliveriesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: notifications_status.failed }),
    );
    expect(userDevicesRepository.deactivateIfTokenMatches).toHaveBeenCalledWith(
      'device-id',
      pushToken,
    );
  });

  it('creates a deep-linked reminder notification and sends it', async () => {
    mockFirebaseSend.mockResolvedValue('firebase-message-id');
    notificationsRepository.create.mockResolvedValueOnce({
      id: 'reminder-notification-id',
      account_id: recipientAccountId,
      title: 'Reminder due: Give medication',
      body: 'Your medication care task is due now.',
      data: {
        reminderId: 'reminder-id',
        reminderType: 'medication',
        petId: null,
        notificationType: 'reminder_due',
      },
      deep_link: '/(tabs)/(reminder)',
      image_url: null,
    });

    await service.sendReminderDueNotification({
      id: 'reminder-id',
      account_id: recipientAccountId,
      pet_id: null,
      title: 'Give medication',
      description: null,
      type: reminder_type.medication,
      custom_type: null,
      status: reminder_status.pending,
      scheduled_at: new Date(),
      timezone: 'UTC',
      repeat_frequency: reminder_repeat_frequency.none,
      repeat_interval: null,
      repeat_until: null,
      parent_reminder_id: null,
      notification_provider_id: null,
      completed_at: null,
      cancelled_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    expect(notificationsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Reminder due: Give medication',
        body: 'Your medication care task is due now.',
        deep_link: '/(tabs)/(reminder)',
        data: expect.objectContaining({
          reminderId: 'reminder-id',
          notificationType: 'reminder_due',
        }) as Record<string, string>,
      }),
    );
    expect(mockFirebaseSend).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          notificationId: 'reminder-notification-id',
          reminderId: 'reminder-id',
          notificationType: 'reminder_due',
          deepLink: '/(tabs)/(reminder)',
        }) as Record<string, string>,
      }),
    );
  });

  it('keeps reminder notifications in-app when reminder push is muted', async () => {
    userSettingsRepository.findById.mockResolvedValueOnce({
      notification_enable: true,
      reminder_notifications: false,
    });

    await service.sendReminderDueNotification({
      id: 'reminder-id',
      account_id: recipientAccountId,
      pet_id: null,
      title: 'Give medication',
      description: null,
      type: reminder_type.medication,
    } as never);

    expect(notificationsRepository.create).toHaveBeenCalled();
    expect(userDevicesRepository.findActiveByAccountId).not.toHaveBeenCalled();
    expect(mockFirebaseSend).not.toHaveBeenCalled();
  });

  it('creates an owner status notification with an owner booking deep link', async () => {
    mockFirebaseSend.mockResolvedValue('firebase-message-id');
    notificationsRepository.create.mockResolvedValueOnce({
      id: 'status-notification-id',
      account_id: recipientAccountId,
      title: 'Booking confirmed',
      body: "Mochi's booking request was accepted.",
      data: {
        bookingId,
        bookingStatus: 'confirmed',
        notificationType: 'sitter_booking_status',
      },
      deep_link: `/sitter?tab=bookings&role=owner&bookingId=${bookingId}`,
      image_url: null,
    });

    await service.sendSitterBookingStatusNotification({
      recipientAccountId,
      bookingId,
      petName: 'Mochi',
      status: 'confirmed',
    });

    expect(notificationsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        account_id: recipientAccountId,
        title: 'Booking confirmed',
        body: "Mochi's booking request was accepted.",
        deep_link: `/sitter?tab=bookings&role=owner&bookingId=${bookingId}`,
        data: {
          bookingId,
          bookingStatus: 'confirmed',
          notificationType: 'sitter_booking_status',
        },
      }),
    );
    expect(mockFirebaseSend).toHaveBeenCalledWith(
      expect.objectContaining({
        token: pushToken,
        data: expect.objectContaining({
          bookingStatus: 'confirmed',
          notificationType: 'sitter_booking_status',
        }) as Record<string, string>,
      }),
    );
  });

  it('skips a device that was reassigned before the final send check', async () => {
    userDevicesRepository.findActiveOwnedDevice.mockResolvedValueOnce(null);

    await service.sendSitterBookingRequestNotification({
      recipientAccountId,
      bookingId,
      petName: 'Mochi',
    });

    expect(mockFirebaseSend).not.toHaveBeenCalled();
    expect(notificationDeliveriesRepository.create).not.toHaveBeenCalled();
  });
});
