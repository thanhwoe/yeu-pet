import { ConfigService } from '@nestjs/config';
import { CreateEmailOptions, Resend, WebhookEventPayload } from 'resend';

export const RESEND_CLIENT = Symbol('RESEND_CLIENT');

export type ResendEmailPayload = CreateEmailOptions;

export interface ResendEmailResponse {
  id: string;
}

export interface ResendClient {
  sendEmail(
    payload: ResendEmailPayload,
    options?: { idempotencyKey?: string },
  ): Promise<ResendEmailResponse>;
  verifyWebhook(input: {
    payload: string;
    headers: {
      id: string;
      timestamp: string;
      signature: string;
    };
  }): WebhookEventPayload;
}

export class SdkResendClient implements ResendClient {
  private readonly resend: Resend;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

  async sendEmail(
    payload: ResendEmailPayload,
    options?: { idempotencyKey?: string },
  ): Promise<ResendEmailResponse> {
    if (!this.configService.get<string>('RESEND_API_KEY')) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { data, error } = await this.resend.emails.send(payload, {
      idempotencyKey: options?.idempotencyKey,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.id) {
      throw new Error('Resend response did not include an email id');
    }

    return { id: data.id };
  }

  verifyWebhook(input: {
    payload: string;
    headers: {
      id: string;
      timestamp: string;
      signature: string;
    };
  }): WebhookEventPayload {
    return this.resend.webhooks.verify({
      payload: input.payload,
      headers: input.headers,
      webhookSecret: this.configService.getOrThrow<string>(
        'RESEND_WEBHOOK_SECRET',
      ),
    });
  }
}

export const resendClientProvider = {
  provide: RESEND_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): ResendClient =>
    new SdkResendClient(configService),
};
