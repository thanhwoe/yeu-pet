import {
  EMAIL_JOBS,
  EmailJobData,
  EmailJobName,
} from '@app/interfaces/email-jobs.interface';
import { Job } from 'bullmq';
import { EmailProcessor } from './email.processor';
import { EmailService } from './email.service';

describe('EmailProcessor', () => {
  it('sends email jobs through EmailService', async () => {
    const sendEmail = jest.fn().mockResolvedValue({ id: 'log-1' });
    const updateProgress = jest.fn();
    const emailService = {
      sendEmail,
    } as unknown as EmailService;
    const processor = new EmailProcessor(emailService);
    const data: EmailJobData = {
      to: 'user@example.com',
      subject: 'Welcome',
      text: 'Hello',
    };
    const job = {
      name: EMAIL_JOBS.SEND_EMAIL,
      data,
      updateProgress,
    } as unknown as Job<EmailJobData, any, EmailJobName>;

    await expect(processor.process(job)).resolves.toEqual({ success: true });

    expect(updateProgress.mock.calls).toEqual([[10], [100]]);
    expect(sendEmail.mock.calls).toEqual([[data]]);
  });
});
