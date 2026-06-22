import {
  account_devices,
  accounts,
  notifications,
  notifications_status,
  reminders,
  sitter_bookings_status,
} from '@app/generated/prisma/client';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import { NotificationsRepository } from './notifications.repository';
import { UserDevicesRepository } from '../user-devices/user-devices.repository';
import { CaslAbilityFactory } from '../casl/casl-ability.factory';
import { assertAbility } from '../casl/casl.helper';
import { Action } from '../casl/casl.types';
import { NotificationDeliveriesRepository } from './notification-deliveries.repository';
import { jsonValueToStringMap } from '@app/utils/transform';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { paginate } from '@app/utils/pagination';
import { UserSettingsRepository } from '../user-settings/user-settings.repository';

type NotificationPreference =
  | 'reminder_notifications'
  | 'booking_notifications';

type CreateAndDeliverNotificationParams = {
  accountId: string;
  title: string;
  body: string;
  deepLink: string;
  data: Record<string, string | null>;
  preference: NotificationPreference;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationDeliveriesRepository: NotificationDeliveriesRepository,
    private readonly userDevicesRepository: UserDevicesRepository,
    private readonly userSettingsRepository: UserSettingsRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {
    if (!admin.apps.length) {
      const creds = this.configService.getOrThrow<string>(
        'GOOGLE_APPLICATION_CREDENTIALS',
      );

      let serviceAccount: admin.ServiceAccount;
      if (creds.trim().startsWith('{')) {
        try {
          serviceAccount = JSON.parse(creds) as admin.ServiceAccount;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          throw new Error(
            `Failed to parse GOOGLE_APPLICATION_CREDENTIALS JSON: ${message}`,
          );
        }
      } else {
        const absolutePath = path.resolve(process.cwd(), creds);

        // Check if file exists
        if (!fs.existsSync(absolutePath)) {
          throw new Error(`Service account file not found: ${absolutePath}`);
        }

        try {
          serviceAccount = JSON.parse(
            fs.readFileSync(absolutePath, 'utf8'),
          ) as admin.ServiceAccount;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          throw new Error(
            `Failed to parse Firebase credentials file: ${message}`,
          );
        }
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  async sendReminderDueNotification(reminder: reminders) {
    const reminderType = reminder.type.toLowerCase();
    return this.createAndDeliverNotification({
      accountId: reminder.account_id,
      body:
        reminder.description?.trim() ||
        `Your ${reminderType} care task is due now.`,
      data: {
        reminderId: reminder.id,
        reminderType,
        petId: reminder.pet_id,
        notificationType: 'reminder_due',
      },
      title: `Reminder due: ${reminder.title}`,
      deepLink: '/(tabs)/(reminder)',
      preference: 'reminder_notifications',
    });
  }

  async sendSitterBookingMessageNotification(params: {
    recipientAccountId: string;
    bookingId: string;
  }) {
    await this.sendBookingNotification({
      recipientAccountId: params.recipientAccountId,
      title: 'New sitter message',
      body: 'You have a new message about your booking.',
      deepLink: `/sitter-bookings/${params.bookingId}/chat`,
      data: {
        bookingId: params.bookingId,
        notificationType: 'sitter_booking_message',
      },
    });
  }

  async sendSitterBookingRequestNotification(params: {
    recipientAccountId: string;
    bookingId: string;
    petName: string;
  }) {
    await this.sendBookingNotification({
      recipientAccountId: params.recipientAccountId,
      title: 'New booking request',
      body: `You have a new booking request for ${params.petName}.`,
      deepLink: `/sitter?tab=bookings&role=sitter&bookingId=${encodeURIComponent(params.bookingId)}`,
      data: {
        bookingId: params.bookingId,
        notificationType: 'sitter_booking_request',
      },
    });
  }

  async sendSitterBookingStatusNotification(params: {
    recipientAccountId: string;
    bookingId: string;
    petName: string;
    status: 'confirmed' | 'rejected' | 'completed' | 'cancelled' | 'expired';
  }) {
    const copy = {
      [sitter_bookings_status.confirmed]: {
        title: 'Booking confirmed',
        body: `${params.petName}'s booking request was accepted.`,
      },
      [sitter_bookings_status.rejected]: {
        title: 'Booking request declined',
        body: `${params.petName}'s booking request was declined.`,
      },
      [sitter_bookings_status.completed]: {
        title: 'Booking completed',
        body: `${params.petName}'s booking was marked as completed.`,
      },
      [sitter_bookings_status.cancelled]: {
        title: 'Booking cancelled',
        body: `${params.petName}'s booking was cancelled by the sitter.`,
      },
      expired: {
        title: 'Booking request expired',
        body: `${params.petName}'s booking request expired before it was accepted.`,
      },
    }[params.status];

    await this.sendBookingNotification({
      recipientAccountId: params.recipientAccountId,
      title: copy.title,
      body: copy.body,
      deepLink: `/sitter?tab=bookings&role=owner&bookingId=${encodeURIComponent(params.bookingId)}`,
      data: {
        bookingId: params.bookingId,
        bookingStatus: params.status,
        notificationType: 'sitter_booking_status',
      },
    });
  }

  private async sendBookingNotification(params: {
    recipientAccountId: string;
    title: string;
    body: string;
    deepLink: string;
    data: Record<string, string>;
  }) {
    return this.createAndDeliverNotification({
      accountId: params.recipientAccountId,
      title: params.title,
      body: params.body,
      deepLink: params.deepLink,
      data: params.data,
      preference: 'booking_notifications',
    });
  }

  private async createAndDeliverNotification(
    params: CreateAndDeliverNotificationParams,
  ) {
    const notification = await this.notificationsRepository.create({
      account_id: params.accountId,
      body: params.body,
      data: params.data,
      title: params.title,
      deep_link: params.deepLink,
      image_url: null,
      image_id: null,
    });

    const settings = await this.userSettingsRepository.findById(
      params.accountId,
    );
    if (
      settings &&
      (!settings.notification_enable || !settings[params.preference])
    ) {
      return notification;
    }

    await this.deliverPushToAccountSafely(notification);

    return notification;
  }

  private async deliverPushToAccountSafely(notification: notifications) {
    try {
      await this.deliverPushToAccount(notification);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to dispatch notification ${notification.id}: ${message}`,
      );
    }
  }

  private async deliverPushToAccount(notification: notifications) {
    const [devices] = await this.userDevicesRepository.findAll({
      account_id: notification.account_id,
    });
    const activeDevices = devices.filter(
      (device) => device.is_active !== false,
    );

    if (!activeDevices.length) {
      return;
    }

    const badge = await this.notificationsRepository.countBadge(
      notification.account_id,
    );

    await Promise.allSettled(
      activeDevices.map((device) =>
        this.deliverFirebaseNotification(device, notification, badge),
      ),
    );
  }

  private async deliverFirebaseNotification(
    device: account_devices,
    notification: notifications,
    badge: number,
  ) {
    try {
      const message: admin.messaging.Message = {
        token: device.push_token,
        notification: {
          title: notification.title,
          body: notification.body ?? '',

          // android only
          imageUrl: notification.image_url ?? undefined,
        },
        data: {
          deepLink: notification.deep_link ?? '',
          ...jsonValueToStringMap(notification.data),
          notificationId: notification.id,
        },
        android: {
          // behavior: show immediately or delay
          priority: 'high',
          notification: {
            channelId: this.configService.getOrThrow<string>(
              'NOTIFICATION_CHANNEL',
            ),
            // behavior: how notification show on device: with sound or silent
            priority: 'max',
            notificationCount: badge,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge,
              interruptionLevel: 'time-sensitive',
              'mutable-content': 1,
            },
          },
          fcmOptions: {
            imageUrl: notification.image_url ?? undefined,
          },
        },
      };

      await admin.messaging().send(message);

      await this.notificationDeliveriesRepository.create({
        device_id: device.id,
        notification_id: notification.id,
        push_token: device.push_token,
        sent_at: new Date(),
        status: notifications_status.sent,
        error: null,
      });
    } catch (err: unknown) {
      const error = err as admin.FirebaseError;

      await this.notificationDeliveriesRepository.create({
        device_id: device.id,
        notification_id: notification.id,
        push_token: device.push_token,
        sent_at: new Date(),
        status: notifications_status.failed,
        error: error.message ?? JSON.stringify(error),
      });

      // Deactivate invalid/unregistered tokens
      if (
        error?.code === 'messaging/registration-token-not-registered' ||
        error?.code === 'messaging/invalid-registration-token'
      ) {
        await this.userDevicesRepository.update(device.id, {
          is_active: false,
        });
      }
    }
  }

  async findAll(account_id: string, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await this.notificationsRepository.findAll({
      account_id,
      skip,
      take: limit,
    });

    return paginate(data, total, page, limit);
  }

  async getBadge(account_id: string) {
    const count = await this.notificationsRepository.countBadge(account_id);
    return {
      count,
    };
  }

  async markNotificationAsRead(user: accounts, id: string) {
    await this.assertAbility(user, id, Action.Update);

    await this.notificationsRepository.update(id, {
      is_read: true,
      read_at: new Date(),
    });
  }

  async markAllNotificationsAsRead(user: accounts) {
    await this.notificationsRepository.updateManyUnRead(user.id, {
      is_read: true,
      read_at: new Date(),
    });
  }

  async delete(user: accounts, id: string) {
    await this.assertAbility(user, id, Action.Delete);
    await this.notificationsRepository.delete(id);
  }

  private async assertAbility(user: accounts, id: string, action: Action) {
    const record = await this.notificationsRepository.findById(id);

    if (!record)
      throw new NotFoundException(`Notification with ID ${id} not found`);

    const ability = this.caslAbilityFactory.createForUser(user);

    assertAbility(ability, action, 'Notifications', record);

    return record;
  }
}
