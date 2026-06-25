import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { UserDevicesModule } from '../user-devices/user-devices.module';
import { CaslModule } from '../casl/casl.module';
import { NotificationDeliveriesRepository } from './notification-deliveries.repository';
import { UserSettingsModule } from '../user-settings/user-settings.module';
import { LocalizationModule } from '../shared/localization/localization.module';

@Module({
  imports: [
    CaslModule,
    LocalizationModule,
    UserDevicesModule,
    UserSettingsModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationDeliveriesRepository,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
