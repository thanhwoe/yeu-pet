import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RevenueCatSubscriberResponse } from './revenuecat-webhook.interface';

@Injectable()
export class RevenueCatClient {
  constructor(private readonly configService: ConfigService) {}

  async getSubscriber(
    appUserId: string,
  ): Promise<RevenueCatSubscriberResponse> {
    const secretKey = this.configService.get<string>('REVENUECAT_SECRET_KEY');

    if (!secretKey) {
      throw new ServiceUnavailableException(
        'RevenueCat subscription sync is not configured',
      );
    }

    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!response.ok) {
      throw new BadGatewayException(
        `RevenueCat subscriber lookup failed with status ${response.status}`,
      );
    }

    return (await response.json()) as RevenueCatSubscriberResponse;
  }
}
