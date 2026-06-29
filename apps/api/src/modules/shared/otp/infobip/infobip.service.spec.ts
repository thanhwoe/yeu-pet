import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfobipHttpClient, InfobipService } from './infobip.service';

const createConfigService = () =>
  ({
    get: jest.fn((key: string, fallback?: unknown) =>
      key === 'OTP_EXPIRATION_MINUTES' ? 10 : fallback,
    ),
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        INFOBIP_API_KEY: 'api-key',
        INFOBIP_BASE_URL: 'https://abc123.api.infobip.com/',
        INFOBIP_SMS_FROM: 'YeuPet',
      };

      return values[key];
    }),
  }) as unknown as jest.Mocked<ConfigService>;

const createResponse = (input: {
  body: unknown;
  ok?: boolean;
  status?: number;
}): Awaited<ReturnType<InfobipHttpClient>> => ({
  ok: input.ok ?? true,
  status: input.status ?? 200,
  json: jest.fn().mockResolvedValue(input.body),
  text: jest.fn().mockResolvedValue(JSON.stringify(input.body)),
});

describe('InfobipService', () => {
  it('sends an OTP SMS through Infobip v3 SMS API', async () => {
    const httpClient = jest.fn().mockResolvedValue(
      createResponse({
        body: {
          messages: [
            {
              messageId: 'message-1',
              status: {
                groupId: 1,
                groupName: 'PENDING',
                id: 26,
                name: 'PENDING_ACCEPTED',
                description: 'Message sent to next instance',
              },
              destination: '84901234567',
            },
          ],
        },
      }),
    );
    const service = new InfobipService(createConfigService(), httpClient);

    await expect(service.sendOtp('+84 901 234 567', '123456')).resolves.toBe(
      '123456',
    );

    expect(httpClient.mock.calls).toEqual([
      [
        'https://abc123.api.infobip.com/sms/3/messages',
        {
          body: JSON.stringify({
            messages: [
              {
                sender: 'YeuPet',
                destinations: [{ to: '84901234567' }],
                content: {
                  text: 'Your YeuPet verification code is 123456. It expires in 10 minutes. Do not share this code.',
                },
              },
            ],
          }),
          headers: {
            Accept: 'application/json',
            Authorization: 'App api-key',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      ],
    ]);
  });

  it('fails when Infobip rejects the HTTP request', async () => {
    const httpClient = jest.fn().mockResolvedValue(
      createResponse({
        body: { requestError: { serviceException: { messageId: 'BAD' } } },
        ok: false,
        status: 400,
      }),
    );
    const service = new InfobipService(createConfigService(), httpClient);

    await expect(service.sendOtp('+84901234567', '123456')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('fails when Infobip returns a rejected message status', async () => {
    const httpClient = jest.fn().mockResolvedValue(
      createResponse({
        body: {
          messages: [
            {
              status: {
                groupName: 'REJECTED',
                name: 'REJECTED_DESTINATION',
                description: 'Destination rejected',
              },
            },
          ],
        },
      }),
    );
    const service = new InfobipService(createConfigService(), httpClient);

    await expect(service.sendOtp('+84901234567', '123456')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
