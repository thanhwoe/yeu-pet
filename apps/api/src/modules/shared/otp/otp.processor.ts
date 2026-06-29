import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BULLMQ_QUEUES } from '../bullmq/bullmq.queue';
import { OTP_JOBS } from './otp.job';
import { OtpJobData } from '@app/interfaces/otp.interface';
import { EmailService } from '../email/email.service';
import { InfobipService } from './infobip/infobip.service';

@Processor(BULLMQ_QUEUES.SEND_OTP, { concurrency: 2 })
export class OtpProcessor extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
    private readonly infobipService: InfobipService,
  ) {
    super();
  }

  async process(
    job: Job<OtpJobData, any, keyof typeof OTP_JOBS>,
  ): Promise<any> {
    const { token, email, language, phone, userName } = job.data;

    // Update progress
    await job.updateProgress(10);

    // Handle specific logic by job name
    switch (job.name) {
      case OTP_JOBS.SEND_OTP_PHONE:
        if (phone) {
          await this.infobipService.sendOtp(phone, token);
        }
        break;
      case OTP_JOBS.SEND_OTP_EMAIL:
        if (email && userName !== undefined) {
          await this.emailService.sendOtpEmail({
            to: email,
            otp: token,
            userName,
            language,
            idempotencyKey: this.toEmailOtpIdempotencyKey(job, email),
          });
        }
        break;
      default:
        break;
    }

    await job.updateProgress(100);

    return {
      success: true,
    };
  }

  private toEmailOtpIdempotencyKey(
    job: Job<OtpJobData, any, keyof typeof OTP_JOBS>,
    email: string,
  ) {
    const base = `otp-email/${String(job.id ?? email)}`.toLowerCase();

    return base.replace(/[^a-z0-9._/-]+/g, '-').slice(0, 256);
  }
}
