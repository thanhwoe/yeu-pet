import { Module } from '@nestjs/common';
import { EmailLogsRepository } from './email-logs.repository';
import { EmailProcessor } from './email.processor';
import { EmailService } from './email.service';
import { ResendWebhookController } from './resend-webhook.controller';
import { ResendWebhookService } from './resend-webhook.service';
import { resendClientProvider } from './resend.client';

@Module({
  controllers: [ResendWebhookController],
  providers: [
    EmailLogsRepository,
    EmailProcessor,
    EmailService,
    ResendWebhookService,
    resendClientProvider,
  ],
  exports: [EmailService],
})
export class EmailModule {}
