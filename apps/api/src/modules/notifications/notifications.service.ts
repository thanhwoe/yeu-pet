import {
  account_devices,
  accounts,
  notifications,
  notifications_status,
  reminders,
} from '@app/generated/prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class NotificationsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsRepository: NotificationsRepository,
    private readonly notificationDeliveriesRepository: NotificationDeliveriesRepository,
    private readonly userDevicesRepository: UserDevicesRepository,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {
    if (!admin.apps.length) {
      const serviceAccountPath = this.configService.getOrThrow<string>(
        'GOOGLE_APPLICATION_CREDENTIALS',
      );
      const absolutePath = path.resolve(process.cwd(), serviceAccountPath);

      // Check if file exists
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Service account file not found: ${absolutePath}`);
      }

      const serviceAccount = JSON.parse(
        fs.readFileSync(absolutePath, 'utf8'),
      ) as string;

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  async sendNotification(reminder: reminders) {
    const notification = await this.notificationsRepository.create({
      account_id: reminder.account_id,
      body: reminder.description ?? 'You have a notification!',
      data: {
        reminderId: reminder.id,
      },
      title: reminder.title,
      // TODO: add logic generate deep link
      deep_link: null,
      // TODO: generate image url
      image_url: null,
      image_id: null,
    });

    const [devices] = await this.userDevicesRepository.findAll({
      account_id: reminder.account_id,
    });

    if (!devices.length) {
      return;
    }

    await Promise.allSettled(
      devices.map((pt) => this.processNotification(pt, notification)),
    );
  }

  private async processNotification(
    device: account_devices,
    notification: notifications,
  ) {
    const badge = await this.notificationsRepository.countBadge(
      notification.account_id,
    );

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
            notificationCount: badge + 1,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: badge + 1,
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

  async maskNotificationAsRead(user: accounts, id: string) {
    await this.assertAbility(user, id, Action.Update);

    await this.notificationsRepository.update(id, {
      is_read: true,
      read_at: new Date(),
    });
  }

  async maskAllNotificationAsRead(user: accounts) {
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
