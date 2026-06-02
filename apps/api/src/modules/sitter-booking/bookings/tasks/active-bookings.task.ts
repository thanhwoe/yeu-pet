import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SitterBookingsService } from '../sitter-bookings.service';

@Injectable()
export class ActiveBookingsTask {
  constructor(private readonly sitterBookingsService: SitterBookingsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleActive() {
    await Promise.all([
      this.sitterBookingsService.active(),
      this.sitterBookingsService.expirePending(),
    ]);
  }
}
