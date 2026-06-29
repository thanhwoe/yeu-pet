import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { OtpService } from './otp.service';
import { OtpTokensRepository } from './otp-tokens.repository';
import { CleanupTokensTask } from './tasks/cleanup-tokens.task';
import { OtpProcessor } from './otp.processor';
import {
  InfobipService,
  infobipHttpClientProvider,
} from './infobip/infobip.service';

@Module({
  imports: [EmailModule],
  providers: [
    infobipHttpClientProvider,
    InfobipService,
    OtpService,
    OtpTokensRepository,
    OtpProcessor,
    CleanupTokensTask,
  ],
  exports: [OtpService],
})
export class OtpModule {}
