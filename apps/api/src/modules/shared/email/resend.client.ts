import { ConfigService } from '@nestjs/config';

export const RESEND_CLIENT = Symbol('RESEND_CLIENT');

export interface ResendEmailPayload {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface ResendEmailResponse {
  id: string;
}

export interface ResendClient {
  sendEmail(payload: ResendEmailPayload): Promise<ResendEmailResponse>;
}

interface ResendApiResponse {
  id?: string;
  message?: string;
  name?: string;
}

export class HttpResendClient implements ResendClient {
  constructor(private readonly configService: ConfigService) {}

  async sendEmail(payload: ResendEmailPayload): Promise<ResendEmailResponse> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => ({}))) as ResendApiResponse;

    if (!response.ok) {
      throw new Error(
        body.message ??
          body.name ??
          `Resend request failed: ${response.status}`,
      );
    }

    if (!body.id) {
      throw new Error('Resend response did not include an email id');
    }

    return { id: body.id };
  }
}

export const resendClientProvider = {
  provide: RESEND_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): ResendClient =>
    new HttpResendClient(configService),
};
