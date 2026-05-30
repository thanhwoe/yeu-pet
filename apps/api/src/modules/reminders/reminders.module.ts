import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { RemindersRepository } from './reminders.repository';
import { CaslModule } from '../casl/casl.module';
import { ScheduleRemindersTask } from './tasks/schedule-reminders.task';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserSettingsModule } from '../user-settings/user-settings.module';

@Module({
  imports: [
    CaslModule,
    NotificationsModule,
    UserSettingsModule,
  ],
  controllers: [RemindersController],
  providers: [RemindersService, RemindersRepository, ScheduleRemindersTask],
})
export class RemindersModule {}
