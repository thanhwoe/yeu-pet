import { EmailJobData } from '@app/interfaces/email-jobs.interface';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailLogsRepository } from './email-logs.repository';
import { RESEND_CLIENT, ResendEmailPayload } from './resend.client';
import type { ResendClient } from './resend.client';

export const EMAIL_LOG_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  SUPPRESSED: 'suppressed',
} as const;

@Injectable()
export class EmailService {
  constructor(
    private readonly emailLogsRepository: EmailLogsRepository,
    private readonly configService: ConfigService,
    @Inject(RESEND_CLIENT)
    private readonly resendClient: ResendClient,
  ) {}

  async sendEmail(input: EmailJobData) {
    const log = await this.emailLogsRepository.createLog(input);
    const suppression = await this.emailLogsRepository.findSuppression(
      input.to,
    );

    if (suppression) {
      return this.emailLogsRepository.updateStatus(log.id, {
        status: EMAIL_LOG_STATUS.SUPPRESSED,
        error: `Email suppressed: ${suppression.reason}`,
      });
    }

    try {
      const response = await this.resendClient.sendEmail(
        this.toResendPayload(input),
      );

      return this.emailLogsRepository.updateStatus(log.id, {
        resendEmailId: response.id,
        status: EMAIL_LOG_STATUS.SENT,
      });
    } catch (error) {
      return this.emailLogsRepository.updateStatus(log.id, {
        status: EMAIL_LOG_STATUS.FAILED,
        error: this.toErrorMessage(error),
      });
    }
  }

  suppressEmail(email: string, reason: string) {
    return this.emailLogsRepository.suppressEmail(email, reason);
  }

  private toResendPayload(input: EmailJobData): ResendEmailPayload {
    return {
      from:
        this.configService.get<string>('RESEND_FROM_EMAIL') ??
        'YeuPet <noreply@yeupet.com>',
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    };
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown email delivery error';
  }
}
