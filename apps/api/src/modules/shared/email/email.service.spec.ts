import { EmailJobData } from '@app/interfaces/email-jobs.interface';
import { ConfigService } from '@nestjs/config';
import { EmailLogsRepository } from './email-logs.repository';
import { EMAIL_LOG_STATUS, EmailService } from './email.service';
import { ResendClient } from './resend.client';
import { LocalizationService } from '../localization/localization.service';

interface EmailRepositoryMock {
  createLog: jest.Mock;
  findSuppression: jest.Mock;
  updateStatus: jest.Mock;
  suppressEmail: jest.Mock;
}

const createRepository = () =>
  ({
    createLog: jest.fn().mockResolvedValue({ id: 'log-1' }),
    findSuppression: jest.fn().mockResolvedValue(null),
    updateStatus: jest.fn((id: string, input: Record<string, unknown>) =>
      Promise.resolve({ id, ...input }),
    ),
    suppressEmail: jest.fn(),
  }) satisfies EmailRepositoryMock;

const createLocalizationService = () =>
  ({
    normalizeLanguage: jest.fn((language?: string | null) =>
      language === 'en' ? 'en' : 'vi',
    ),
    translate: jest.fn(
      (
        key: string,
        language: string,
        params?: Record<string, string | number | boolean | null | undefined>,
      ) => {
        const translations: Record<string, Record<string, string>> = {
          en: {
            'emails.otp.expiry':
              'Please enter this code within the next {minutes} minutes.',
            'emails.otp.greeting': 'Hello {userName},',
            'emails.otp.heading': 'Welcome to YeuPet',
            'emails.otp.ignore':
              'If you did not register for a YeuPet account, you can ignore this email.',
            'emails.otp.intro':
              'Thank you for registering with YeuPet. To activate your account, use this code:',
            'emails.otp.subject': 'Your YeuPet verification code',
            'emails.otp.support':
              'If you have any questions, please contact YeuPet.',
            'emails.emailChange.expiry':
              'This code expires in {minutes} minutes.',
            'emails.emailChange.greeting': 'Hi {name},',
            'emails.emailChange.heading': 'Verify your new email',
            'emails.emailChange.ignore':
              'If you did not request this email change, you can ignore this email.',
            'emails.emailChange.intro':
              'Use this code to finish changing your YeuPet account email:',
            'emails.emailChange.subject': 'Verify your new email for YeuPet',
          },
          vi: {
            'emails.otp.expiry':
              'Vui lòng nhập mã này trong vòng {minutes} phút.',
            'emails.otp.greeting': 'Xin chào {userName},',
            'emails.otp.heading': 'Chào mừng đến với YeuPet',
            'emails.otp.ignore':
              'Nếu bạn không đăng ký tài khoản YeuPet, bạn có thể bỏ qua email này.',
            'emails.otp.intro':
              'Cảm ơn bạn đã đăng ký YeuPet. Hãy dùng mã sau để kích hoạt tài khoản:',
            'emails.otp.subject': 'Mã xác minh YeuPet của bạn',
            'emails.otp.support':
              'Nếu cần hỗ trợ, bạn có thể liên hệ với YeuPet.',
            'emails.emailChange.expiry':
              'Mã này sẽ hết hạn sau {minutes} phút.',
            'emails.emailChange.greeting': 'Xin chào {name},',
            'emails.emailChange.heading': 'Xác minh email mới',
            'emails.emailChange.ignore':
              'Nếu bạn không yêu cầu thay đổi email, bạn có thể bỏ qua email này.',
            'emails.emailChange.intro':
              'Dùng mã này để hoàn tất thay đổi email tài khoản YeuPet:',
            'emails.emailChange.subject': 'Xác minh email mới cho YeuPet',
          },
        };

        return (translations[language]?.[key] ?? key).replace(
          /\{(\w+)\}/g,
          (_match, name: string) =>
            params?.[name] === null || params?.[name] === undefined
              ? ''
              : String(params[name]),
        );
      },
    ),
  }) as unknown as jest.Mocked<LocalizationService>;

describe('EmailService', () => {
  let repository: ReturnType<typeof createRepository>;
  let resendClient: jest.Mocked<ResendClient>;
  let localizationService: ReturnType<typeof createLocalizationService>;
  let service: EmailService;

  const email: EmailJobData = {
    to: 'user@example.com',
    subject: 'Welcome',
    text: 'Hello',
    accountId: 'account-1',
    bookingId: 'booking-1',
  };

  beforeEach(() => {
    repository = createRepository();
    resendClient = {
      sendEmail: jest.fn().mockResolvedValue({ id: 'resend-1' }),
      verifyWebhook: jest.fn(),
    };
    localizationService = createLocalizationService();
    service = new EmailService(
      repository as unknown as EmailLogsRepository,
      {
        get: jest.fn((key: string) =>
          key === 'RESEND_FROM_EMAIL' ? 'YeuPet <mail@example.com>' : undefined,
        ),
      } as unknown as ConfigService,
      resendClient,
      localizationService,
    );
  });

  it('creates an email log and marks it sent after Resend accepts it', async () => {
    await service.sendEmail(email);

    expect(repository.createLog.mock.calls).toEqual([[email]]);
    expect(repository.findSuppression.mock.calls).toEqual([[email.to]]);
    expect(resendClient.sendEmail.mock.calls).toEqual([
      [
        expect.objectContaining({
          from: 'YeuPet <mail@example.com>',
          to: email.to,
          subject: email.subject,
          text: email.text,
        }),
        {
          idempotencyKey: 'welcome/account-1',
        },
      ],
    ]);
    expect(repository.updateStatus.mock.calls).toContainEqual([
      'log-1',
      {
        resendEmailId: 'resend-1',
        status: EMAIL_LOG_STATUS.SENT,
      },
    ]);
  });

  it('marks suppressed email attempts without calling Resend', async () => {
    repository.findSuppression.mockResolvedValue({
      id: 'suppression-1',
      email: email.to,
      reason: 'bounce',
      created_at: new Date(),
    });

    await service.sendEmail(email);

    expect(resendClient.sendEmail.mock.calls).toHaveLength(0);
    expect(repository.updateStatus.mock.calls).toContainEqual([
      'log-1',
      {
        status: EMAIL_LOG_STATUS.SUPPRESSED,
        error: 'Email suppressed: bounce',
      },
    ]);
  });

  it('marks email attempts failed when Resend rejects the request', async () => {
    resendClient.sendEmail.mockRejectedValue(new Error('invalid api key'));

    await service.sendEmail(email);

    expect(repository.updateStatus.mock.calls).toContainEqual([
      'log-1',
      {
        status: EMAIL_LOG_STATUS.FAILED,
        error: 'invalid api key',
      },
    ]);
  });

  it('sends email change OTP email with expiry copy', async () => {
    await service.sendEmailChangeOtpEmail({
      to: 'new@example.com',
      otp: '123456',
      expiresInMinutes: 10,
      language: 'en',
      userName: 'Thanh',
      idempotencyKey: 'email-change-otp/request-1/initial',
    });

    expect(resendClient.sendEmail.mock.calls).toHaveLength(1);
    const payload = resendClient.sendEmail.mock.calls[0][0];
    const options = resendClient.sendEmail.mock.calls[0][1];

    expect(payload).toMatchObject({
      to: 'new@example.com',
      subject: 'Verify your new email for YeuPet',
    });
    expect('text' in payload ? payload.text : '').toContain('123456');
    expect(options).toEqual({
      idempotencyKey: 'email-change-otp/request-1/initial',
    });
  });

  it('sends registration OTP email through Resend', async () => {
    await service.sendOtpEmail({
      to: 'user@example.com',
      otp: '654321',
      language: 'en',
      userName: 'Thanh',
      idempotencyKey: 'otp-email/job-1',
    });

    expect(resendClient.sendEmail.mock.calls).toHaveLength(1);
    const payload = resendClient.sendEmail.mock.calls[0][0];
    const options = resendClient.sendEmail.mock.calls[0][1];

    expect(payload).toMatchObject({
      to: 'user@example.com',
      subject: 'Your YeuPet verification code',
    });
    expect('text' in payload ? payload.text : '').toContain('654321');
    expect(options).toEqual({
      idempotencyKey: 'otp-email/job-1',
    });
  });

  it('rejects email change OTP email when delivery is suppressed', async () => {
    repository.findSuppression.mockResolvedValue({
      id: 'suppression-1',
      email: 'new@example.com',
      reason: 'bounce',
      created_at: new Date(),
    });

    await expect(
      service.sendEmailChangeOtpEmail({
        to: 'new@example.com',
        otp: '123456',
        expiresInMinutes: 10,
        language: 'en',
        idempotencyKey: 'email-change-otp/request-1/initial',
      }),
    ).rejects.toThrow('Could not send verification email');
  });
});
