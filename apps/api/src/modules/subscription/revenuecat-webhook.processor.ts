import { BULLMQ_QUEUES } from '@app/modules/shared/bullmq/bullmq.queue';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  REVENUECAT_WEBHOOK_JOB,
  RevenueCatWebhookPayload,
} from './revenuecat-webhook.interface';
import { SubscriptionService } from './subscription.service';

@Processor(BULLMQ_QUEUES.REVENUECAT_WEBHOOK, { concurrency: 5 })
export class RevenueCatWebhookProcessor extends WorkerHost {
  constructor(private readonly subscriptionService: SubscriptionService) {
    super();
  }

  async process(job: Job<RevenueCatWebhookPayload>) {
    if (job.name !== REVENUECAT_WEBHOOK_JOB) {
      return { ignored: true };
    }

    return this.subscriptionService.processRevenueCatWebhook(job.data);
  }
}
