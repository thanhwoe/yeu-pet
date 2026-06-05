import { Module } from '@nestjs/common';
import { IModerationRepository } from '@app/interfaces/moderation-repository.interface';
import { ModerationRepository } from './moderation.repository';
import { ModerationService } from './moderation.service';
import { ReportsController } from './reports.controller';
import { UserBlocksController } from './user-blocks.controller';

@Module({
  controllers: [ReportsController, UserBlocksController],
  providers: [
    ModerationRepository,
    { provide: IModerationRepository, useExisting: ModerationRepository },
    ModerationService,
  ],
  exports: [ModerationRepository, IModerationRepository, ModerationService],
})
export class ModerationModule {}
