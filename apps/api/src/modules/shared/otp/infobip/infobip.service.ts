import {
  Inject,
  Injectable,
  Provider,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface InfobipSmsPayload {
  messages: Array<{
    sender: string;
    destinations: Array<{
      to: string;
    }>;
    content: {
      text: string;
    };
  }>;
}

interface InfobipSmsResponse {
  messages?: Array<{
    messageId?: string;
    destination?: string;
    status?: {
      groupId?: number;
      groupName?: string;
      id?: number;
      name?: string;
      description?: string;
      action?: string;
    };
  }>;
}

interface InfobipHttpResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
  text(): Promise<string>;
}

export type InfobipHttpClient = (
  url: string,
  init: {
    body: string;
    headers: Record<string, string>;
    method: 'POST';
  },
) => Promise<InfobipHttpResponse>;

export const INFOBIP_HTTP_CLIENT = Symbol('INFOBIP_HTTP_CLIENT');

export const infobipHttpClientProvider: Provider<InfobipHttpClient> = {
  provide: INFOBIP_HTTP_CLIENT,
  useValue: ((url, init) => fetch(url, init)) satisfies InfobipHttpClient,
};

@Injectable()
export class InfobipService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly sender: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(INFOBIP_HTTP_CLIENT)
    private readonly httpClient: InfobipHttpClient,
  ) {
    this.apiKey = this.configService.getOrThrow<string>('INFOBIP_API_KEY');
    this.baseUrl = this.toBaseUrl(
      this.configService.getOrThrow<string>('INFOBIP_BASE_URL'),
    );
    this.sender = this.configService.getOrThrow<string>('INFOBIP_SMS_FROM');
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<string> {
    const expiresInMinutes = this.configService.get<number>(
      'OTP_EXPIRATION_MINUTES',
      5,
    );

    try {
      const response = await this.httpClient(`${this.baseUrl}/sms/3/messages`, {
        body: JSON.stringify(
          this.toSmsPayload(phoneNumber, otp, expiresInMinutes),
        ),
        headers: {
          Accept: 'application/json',
          Authorization: `App ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      const body = await this.toJsonResponse(response);

      this.assertSmsAccepted(body);

      return otp;
    } catch {
      throw new ServiceUnavailableException(
        'Could not send verification SMS. Please try again later.',
      );
    }
  }

  private toSmsPayload(
    phoneNumber: string,
    otp: string,
    expiresInMinutes: number,
  ): InfobipSmsPayload {
    return {
      messages: [
        {
          sender: this.sender,
          destinations: [
            {
              to: this.toInfobipPhoneNumber(phoneNumber),
            },
          ],
          content: {
            text: this.toOtpMessage(otp, expiresInMinutes),
          },
        },
      ],
    };
  }

  private async toJsonResponse(
    response: InfobipHttpResponse,
  ): Promise<InfobipSmsResponse> {
    if (!response.ok) {
      throw new Error(await this.toResponseError(response));
    }

    return (await response.json()) as InfobipSmsResponse;
  }

  private async toResponseError(response: InfobipHttpResponse) {
    const body = await response.text().catch(() => '');

    return `Infobip rejected SMS OTP with HTTP ${response.status}: ${body}`;
  }

  private toOtpMessage(otp: string, expiresInMinutes: number): string {
    return `Your YeuPet verification code is ${otp}. It expires in ${expiresInMinutes} minutes. Do not share this code.`;
  }

  private toInfobipPhoneNumber(phoneNumber: string): string {
    const compact = phoneNumber.trim().replace(/[()\s-]/g, '');

    if (compact.startsWith('+')) {
      return compact.slice(1);
    }

    if (compact.startsWith('00')) {
      return compact.slice(2);
    }

    return compact;
  }

  private toBaseUrl(baseUrl: string): string {
    return baseUrl.trim().replace(/\/+$/, '');
  }

  private assertSmsAccepted(response: InfobipSmsResponse) {
    const status = response.messages?.[0]?.status;
    const acceptedStatuses = new Set(['ACCEPTED', 'PENDING', 'DELIVERED']);

    if (!status?.groupName || !acceptedStatuses.has(status.groupName)) {
      throw new Error(
        status?.description ?? status?.name ?? 'Infobip rejected SMS OTP',
      );
    }
  }
}
