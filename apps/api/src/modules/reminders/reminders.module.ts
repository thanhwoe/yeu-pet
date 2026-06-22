import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { RemindersRepository } from './reminders.repository';
import { CaslModule } from '../casl/casl.module';
import { ScheduleRemindersTask } from './tasks/schedule-reminders.task';
import { NotificationsModule } from '../notifications/notifications.module';
import { IRemindersRepository } from '@app/interfaces/reminders-repository.interface';
import { PetsModule } from '../pets/pets.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [CaslModule, NotificationsModule, PetsModule, SubscriptionModule],
  controllers: [RemindersController],
  providers: [
    RemindersService,
    RemindersRepository,
    { provide: IRemindersRepository, useExisting: RemindersRepository },
    ScheduleRemindersTask,
  ],
})
export class RemindersModule {}
