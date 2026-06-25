import { EmailJobData } from '@app/interfaces/email-jobs.interface';
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailLogsRepository } from './email-logs.repository';
import { RESEND_CLIENT, ResendEmailPayload } from './resend.client';
import type { ResendClient } from './resend.client';
import type { WebhookEventPayload } from 'resend';
import { LocalizationService } from '../localization/localization.service';
import type { SupportedLanguage } from '../localization/localization.types';

export const EMAIL_LOG_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  DELIVERY_DELAYED: 'delivery_delayed',
  BOUNCED: 'bounced',
  COMPLAINED: 'complained',
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
    private readonly localizationService: LocalizationService,
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
        {
          idempotencyKey:
            input.idempotencyKey ??
            this.toIdempotencyKey(input.subject, input.accountId, input.to),
        },
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

  async sendEmailChangeOtpEmail(params: {
    to: string;
    otp: string;
    expiresInMinutes: number;
    userName?: string;
    idempotencyKey: string;
    language?: SupportedLanguage;
  }) {
    const language = this.localizationService.normalizeLanguage(
      params.language,
    );
    const name =
      params.userName?.trim() || (language === 'vi' ? 'bạn' : 'there');
    const subject = this.localizationService.translate(
      'emails.emailChange.subject',
      language,
    );
    const heading = this.localizationService.translate(
      'emails.emailChange.heading',
      language,
    );
    const greeting = this.localizationService.translate(
      'emails.emailChange.greeting',
      language,
      { name },
    );
    const intro = this.localizationService.translate(
      'emails.emailChange.intro',
      language,
    );
    const expiry = this.localizationService.translate(
      'emails.emailChange.expiry',
      language,
      { minutes: params.expiresInMinutes },
    );
    const ignore = this.localizationService.translate(
      'emails.emailChange.ignore',
      language,
    );
    const text = [greeting, '', intro, params.otp, expiry, '', ignore].join(
      '\n',
    );
    const html = `
      <!doctype html>
      <html lang="${language}">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 0; background: #f8fafc;">
          <main style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.5; max-width: 520px; margin: 0 auto; padding: 32px 20px;">
            <h1 style="font-size: 22px; line-height: 1.25; margin: 0 0 20px;">${this.escapeHtml(heading)}</h1>
            <p style="margin: 0 0 16px;">${this.escapeHtml(greeting)}</p>
            <p style="margin: 0 0 16px;">${this.escapeHtml(intro)}</p>
            <p aria-label="Verification code ${params.otp}" style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 24px 0; color: #111827;">${params.otp}</p>
            <p style="margin: 0 0 16px;">${this.escapeHtml(expiry)}</p>
            <p style="margin: 0; color: #64748b;">${this.escapeHtml(ignore)}</p>
          </main>
        </body>
      </html>
    `;

    const log = await this.sendEmail({
      to: params.to,
      subject,
      html,
      text,
      idempotencyKey: params.idempotencyKey,
    });

    if (log.status !== EMAIL_LOG_STATUS.SENT) {
      throw new ServiceUnavailableException(
        'Could not send verification email. Please try again later.',
      );
    }

    return log;
  }

  suppressEmail(email: string, reason: string) {
    return this.emailLogsRepository.suppressEmail(email, reason);
  }

  async processResendWebhook(event: WebhookEventPayload) {
    const emailId = 'email_id' in event.data ? event.data.email_id : undefined;
    const toEmail = 'to' in event.data ? event.data.to?.[0] : undefined;

    if (!emailId) return;

    switch (event.type) {
      case 'email.delivered':
        await this.emailLogsRepository.updateStatusByResendEmailId(emailId, {
          status: EMAIL_LOG_STATUS.DELIVERED,
        });
        break;
      case 'email.delivery_delayed':
        await this.emailLogsRepository.updateStatusByResendEmailId(emailId, {
          status: EMAIL_LOG_STATUS.DELIVERY_DELAYED,
        });
        break;
      case 'email.bounced':
        await this.emailLogsRepository.updateStatusByResendEmailId(emailId, {
          status: EMAIL_LOG_STATUS.BOUNCED,
          error:
            'bounce' in event.data
              ? `${event.data.bounce.type}: ${event.data.bounce.message}`
              : 'Email bounced',
        });

        if (toEmail) {
          await this.suppressEmail(toEmail, 'hard_bounce');
        }
        break;
      case 'email.complained':
        await this.emailLogsRepository.updateStatusByResendEmailId(emailId, {
          status: EMAIL_LOG_STATUS.COMPLAINED,
          error: 'Recipient marked email as spam',
        });

        if (toEmail) {
          await this.suppressEmail(toEmail, 'complaint');
        }
        break;
      case 'email.failed':
        await this.emailLogsRepository.updateStatusByResendEmailId(emailId, {
          status: EMAIL_LOG_STATUS.FAILED,
          error:
            'failed' in event.data
              ? event.data.failed.reason
              : 'Email delivery failed',
        });
        break;
      case 'email.suppressed':
        await this.emailLogsRepository.updateStatusByResendEmailId(emailId, {
          status: EMAIL_LOG_STATUS.SUPPRESSED,
          error: 'Email suppressed by provider',
        });
        break;
      default:
        break;
    }
  }

  private toResendPayload(input: EmailJobData): ResendEmailPayload {
    const basePayload = {
      from: this.getFromAddress(),
      to: input.to,
      subject: input.subject,
    };

    if (input.html) {
      return {
        ...basePayload,
        html: input.html,
        text: input.text,
      };
    }

    if (input.text) {
      return {
        ...basePayload,
        text: input.text,
      };
    }

    throw new Error('Email body must include html or text content');
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown email delivery error';
  }

  private getFromAddress(): string {
    const fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ??
      'noreply@yeupet.com';
    const fromName = this.configService.get<string>('RESEND_FROM_NAME');

    if (!fromName) return fromEmail;

    return `${fromName} <${fromEmail}>`;
  }

  private toIdempotencyKey(
    subject: string,
    accountId: string | undefined,
    to: string,
  ): string {
    const key = `${subject}/${accountId ?? to}`.toLowerCase();

    return key.replace(/[^a-z0-9._/-]+/g, '-').slice(0, 256);
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
