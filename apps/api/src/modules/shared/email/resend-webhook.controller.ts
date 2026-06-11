import { Public } from '@app/decorators/public.decorator';
import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  type RawBodyRequest,
} from '@nestjs/common';
import type { Request } from 'express';
import { ResendWebhookService } from './resend-webhook.service';

@Controller('email')
export class ResendWebhookController {
  constructor(private readonly resendWebhookService: ResendWebhookService) {}

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Headers('svix-id') svixId: string | undefined,
    @Headers('svix-timestamp') svixTimestamp: string | undefined,
    @Headers('svix-signature') svixSignature: string | undefined,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.resendWebhookService.handleWebhook({
      svixId,
      svixTimestamp,
      svixSignature,
      request,
    });
  }
}
