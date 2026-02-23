import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MedicalRecordsService } from '../medical-records.service';

@Injectable()
export class CleanupAttachmentsTask {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanup() {
    await this.medicalRecordsService.destroyDeletedAttachments();
  }
}
