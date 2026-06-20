import { notifications_status } from '@app/generated/prisma/client';
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
    findAll: jest.fn(),
    update: jest.fn(),
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
    userDevicesRepository.findAll.mockResolvedValue([
      [
        {
          id: 'device-id',
          account_id: recipientAccountId,
          push_token: pushToken,
          is_active: true,
        },
      ],
      1,
    ]);
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
    expect(userDevicesRepository.update).toHaveBeenCalledWith('device-id', {
      is_active: false,
    });
  });

  it('does not send Expo tokens through Firebase Admin', async () => {
    userDevicesRepository.findAll.mockResolvedValue([
      [
        {
          id: 'expo-device-id',
          account_id: recipientAccountId,
          push_token: 'ExponentPushToken[test-token]',
          is_active: true,
        },
      ],
      1,
    ]);

    await service.sendSitterBookingRequestNotification({
      recipientAccountId,
      bookingId,
      petName: 'Mochi',
    });

    expect(mockFirebaseSend).not.toHaveBeenCalled();
    expect(notificationDeliveriesRepository.create).not.toHaveBeenCalled();
  });
});
