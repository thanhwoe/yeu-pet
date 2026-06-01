import { Module } from '@nestjs/common';
import { EmailLogsRepository } from './email-logs.repository';
import { EmailProcessor } from './email.processor';
import { EmailService } from './email.service';
import { resendClientProvider } from './resend.client';

@Module({
  providers: [
    EmailLogsRepository,
    EmailProcessor,
    EmailService,
    resendClientProvider,
  ],
  exports: [EmailService],
})
export class EmailModule {}
