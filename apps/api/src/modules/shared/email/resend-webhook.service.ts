import {
  BadRequestException,
  Inject,
  Injectable,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { EmailService } from './email.service';
import { RESEND_CLIENT } from './resend.client';
import type { ResendClient } from './resend.client';

@Injectable()
export class ResendWebhookService {
  constructor(
    @Inject(RESEND_CLIENT)
    private readonly resendClient: ResendClient,
    private readonly emailService: EmailService,
  ) {}

  async handleWebhook(params: {
    svixId?: string;
    svixTimestamp?: string;
    svixSignature?: string;
    request: RawBodyRequest<Request>;
  }) {
    if (!params.svixId || !params.svixTimestamp || !params.svixSignature) {
      throw new BadRequestException('Missing Resend webhook signature headers');
    }

    const payload =
      params.request.rawBody?.toString('utf8') ??
      JSON.stringify(params.request.body);

    try {
      const event = this.resendClient.verifyWebhook({
        payload,
        headers: {
          id: params.svixId,
          timestamp: params.svixTimestamp,
          signature: params.svixSignature,
        },
      });

      await this.emailService.processResendWebhook(event);

      return { received: true };
    } catch {
      throw new BadRequestException('Invalid Resend webhook signature');
    }
  }
}
