import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { UserDevicesModule } from '../user-devices/user-devices.module';
import { CaslModule } from '../casl/casl.module';
import { NotificationDeliveriesRepository } from './notification-deliveries.repository';

@Module({
  imports: [CaslModule, UserDevicesModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    NotificationDeliveriesRepository,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
