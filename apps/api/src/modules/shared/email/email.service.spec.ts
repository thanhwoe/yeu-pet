import { EmailJobData } from '@app/interfaces/email-jobs.interface';
import { ConfigService } from '@nestjs/config';
import { EmailLogsRepository } from './email-logs.repository';
import { EMAIL_LOG_STATUS, EmailService } from './email.service';
import { ResendClient } from './resend.client';

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

describe('EmailService', () => {
  let repository: ReturnType<typeof createRepository>;
  let resendClient: jest.Mocked<ResendClient>;
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
    };
    service = new EmailService(
      repository as unknown as EmailLogsRepository,
      {
        get: jest.fn((key: string) =>
          key === 'RESEND_FROM_EMAIL' ? 'YeuPet <mail@example.com>' : undefined,
        ),
      } as unknown as ConfigService,
      resendClient,
    );
  });

  it('creates an email log and marks it sent after Resend accepts it', async () => {
    await service.sendEmail(email);

    expect(repository.createLog.mock.calls).toEqual([[email]]);
    expect(repository.findSuppression.mock.calls).toEqual([[email.to]]);
    expect(resendClient.sendEmail.mock.calls).toEqual([
      [
        {
          from: 'YeuPet <mail@example.com>',
          to: email.to,
          subject: email.subject,
          html: undefined,
          text: email.text,
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
});
