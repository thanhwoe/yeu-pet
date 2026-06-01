import {
  EMAIL_JOBS,
  EmailJobData,
  EmailJobName,
} from '@app/interfaces/email-jobs.interface';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BULLMQ_QUEUES } from '../bullmq/bullmq.queue';
import { EmailService } from './email.service';

@Processor(BULLMQ_QUEUES.EMAIL, { concurrency: 3 })
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData, any, EmailJobName>) {
    await job.updateProgress(10);

    switch (job.name) {
      case EMAIL_JOBS.SEND_EMAIL:
        await this.emailService.sendEmail(job.data);
        break;
      default:
        break;
    }

    await job.updateProgress(100);

    return {
      success: true,
    };
  }
}
