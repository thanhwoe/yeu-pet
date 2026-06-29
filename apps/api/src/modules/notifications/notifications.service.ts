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
import { LocalizationService } from '../shared/localization/localization.service';
import {
  SupportedLanguage,
  TranslationParams,
} from '../shared/localization/localization.types';

type NotificationPreference =
  | 'reminder_notifications'
  | 'booking_notifications'
  | 'social_notifications'
  | 'ai_notifications';

type CreateAndDeliverNotificationParams = {
  accountId: string;
  titleKey: string;
  bodyKey: string;
  titleParams?: TranslationParams;
  bodyParams?: TranslationParams;
  deepLink: string;
  data: Record<string, string | null>;
  preference: NotificationPreference;
};

type LocalizedNotificationCopy = {
  title: string;
  body: string;
  language: SupportedLanguage;
};

type PushNotificationSoundProfile = {
  androidChannelId: string;
  androidSound: string;
  iosSound: string;
};

const CARE_REMINDER_PUSH_PROFILE: PushNotificationSoundProfile = {
  androidChannelId: 'care-reminders-v1',
  androidSound: 'notification',
  iosSound: 'notification.wav',
};

const GENERAL_PUSH_PROFILE: PushNotificationSoundProfile = {
  androidChannelId: 'general-notifications-v1',
  androidSound: 'fallback_notification',
  iosSound: 'fallback_notification.wav',
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
    private readonly localizationService: LocalizationService,
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
    const description = reminder.description?.trim();
    return this.createAndDeliverNotification({
      accountId: reminder.account_id,
      bodyKey: description
        ? 'notifications.reminder.due.bodyWithDescription'
        : 'notifications.reminder.due.body',
      bodyParams: description
        ? { description }
        : {
            title: reminder.title,
          },
      data: {
        reminderId: reminder.id,
        reminderType: reminder.type.toLowerCase(),
        petId: reminder.pet_id,
        notificationType: 'reminder_due',
      },
      titleKey: 'notifications.reminder.due.title',
      titleParams: {
        title: reminder.title,
      },
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
      titleKey: 'notifications.booking.message.title',
      bodyKey: 'notifications.booking.message.body',
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
      titleKey: 'notifications.booking.request.title',
      bodyKey: 'notifications.booking.request.body',
      bodyParams: {
        petName: params.petName,
      },
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
    const keyByStatus = {
      [sitter_bookings_status.confirmed]: {
        titleKey: 'notifications.booking.confirmed.title',
        bodyKey: 'notifications.booking.confirmed.body',
      },
      [sitter_bookings_status.rejected]: {
        titleKey: 'notifications.booking.rejected.title',
        bodyKey: 'notifications.booking.rejected.body',
      },
      [sitter_bookings_status.completed]: {
        titleKey: 'notifications.booking.completed.title',
        bodyKey: 'notifications.booking.completed.body',
      },
      [sitter_bookings_status.cancelled]: {
        titleKey: 'notifications.booking.cancelled.title',
        bodyKey: 'notifications.booking.cancelled.body',
      },
      expired: {
        titleKey: 'notifications.booking.expired.title',
        bodyKey: 'notifications.booking.expired.body',
      },
    }[params.status];

    await this.sendBookingNotification({
      recipientAccountId: params.recipientAccountId,
      titleKey: keyByStatus.titleKey,
      bodyKey: keyByStatus.bodyKey,
      bodyParams: {
        petName: params.petName,
      },
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
    titleKey: string;
    bodyKey: string;
    titleParams?: TranslationParams;
    bodyParams?: TranslationParams;
    deepLink: string;
    data: Record<string, string>;
  }) {
    return this.createAndDeliverNotification({
      accountId: params.recipientAccountId,
      titleKey: params.titleKey,
      bodyKey: params.bodyKey,
      titleParams: params.titleParams,
      bodyParams: params.bodyParams,
      deepLink: params.deepLink,
      data: params.data,
      preference: 'booking_notifications',
    });
  }

  private async createAndDeliverNotification(
    params: CreateAndDeliverNotificationParams,
  ) {
    const settings = await this.userSettingsRepository.findById(
      params.accountId,
    );
    const copy = this.toLocalizedNotificationCopy(
      params,
      this.localizationService.normalizeLanguage(settings?.language),
    );
    const notification = await this.notificationsRepository.create({
      account_id: params.accountId,
      body: copy.body,
      data: {
        ...params.data,
        bodyKey: params.bodyKey,
        language: copy.language,
        titleKey: params.titleKey,
      },
      title: copy.title,
      deep_link: params.deepLink,
      image_url: null,
      image_id: null,
    });

    if (
      settings &&
      (!settings.notification_enable || !settings[params.preference])
    ) {
      return notification;
    }

    await this.deliverPushToAccountSafely(notification);

    return notification;
  }

  private toLocalizedNotificationCopy(
    params: CreateAndDeliverNotificationParams,
    language: SupportedLanguage,
  ): LocalizedNotificationCopy {
    return {
      body: this.localizationService.translate(
        params.bodyKey,
        language,
        params.bodyParams,
      ),
      language,
      title: this.localizationService.translate(
        params.titleKey,
        language,
        params.titleParams,
      ),
    };
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
    const activeDevices =
      await this.userDevicesRepository.findActiveByAccountId(
        notification.account_id,
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
    const currentDevice =
      await this.userDevicesRepository.findActiveOwnedDevice({
        id: device.id,
        accountId: notification.account_id,
        pushToken: device.push_token,
      });

    if (!currentDevice) {
      return;
    }

    try {
      const notificationData = jsonValueToStringMap(notification.data);
      const data: Record<string, string> = {
        deepLink: notification.deep_link ?? '',
        ...notificationData,
        notificationId: notification.id,
      };
      const soundProfile = this.getPushNotificationSoundProfile(
        notificationData.notificationType,
      );
      const message: admin.messaging.Message = {
        token: device.push_token,
        notification: {
          title: notification.title,
          body: notification.body ?? '',

          // android only
          imageUrl: notification.image_url ?? undefined,
        },
        data,
        android: {
          // behavior: show immediately or delay
          priority: 'high',
          notification: {
            channelId: soundProfile.androidChannelId,
            // behavior: how notification show on device: with sound or silent
            priority: 'max',
            sound: soundProfile.androidSound,
            notificationCount: badge,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: soundProfile.iosSound,
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
        account_id: notification.account_id,
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
        account_id: notification.account_id,
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
        await this.userDevicesRepository.deactivateIfTokenMatches(
          device.id,
          device.push_token,
        );
      }
    }
  }

  private getPushNotificationSoundProfile(
    notificationType?: string,
  ): PushNotificationSoundProfile {
    if (notificationType === 'reminder_due') {
      return CARE_REMINDER_PUSH_PROFILE;
    }

    return GENERAL_PUSH_PROFILE;
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
