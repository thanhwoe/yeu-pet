import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RemindersService } from '../reminders.service';

@Injectable()
export class ScheduleRemindersTask {
  constructor(private remindersService: RemindersService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDueReminders() {
    await this.remindersService.processReminders();
  }
}
