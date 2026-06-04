import { Module } from '@nestjs/common';
import { MedicalRecordsModule } from '../medical-records/medical-records.module';
import { PetsModule } from '../pets/pets.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { IAiConversationsRepository } from '@app/interfaces/ai-conversations-repository.interface';
import { IAiMessagesRepository } from '@app/interfaces/ai-messages-repository.interface';
import { IAiUsageLogsRepository } from '@app/interfaces/ai-usage-logs-repository.interface';
import { AiController } from './ai.controller';
import { AiConversationsRepository } from './ai-conversations.repository';
import { AiMessagesRepository } from './ai-messages.repository';
import { AiProviderService } from './ai-provider.service';
import { AiSafetyService } from './ai-safety.service';
import { AiService } from './ai.service';
import { AiUsageLogsRepository } from './ai-usage-logs.repository';

@Module({
  imports: [PetsModule, MedicalRecordsModule, SubscriptionModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiProviderService,
    AiSafetyService,
    AiConversationsRepository,
    {
      provide: IAiConversationsRepository,
      useExisting: AiConversationsRepository,
    },
    AiMessagesRepository,
    {
      provide: IAiMessagesRepository,
      useExisting: AiMessagesRepository,
    },
    AiUsageLogsRepository,
    {
      provide: IAiUsageLogsRepository,
      useExisting: AiUsageLogsRepository,
    },
  ],
})
export class AiModule {}
