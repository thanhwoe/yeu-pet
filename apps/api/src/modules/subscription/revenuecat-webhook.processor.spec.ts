import { Job } from 'bullmq';
import {
  REVENUECAT_WEBHOOK_JOB,
  RevenueCatWebhookPayload,
} from './revenuecat-webhook.interface';
import { RevenueCatWebhookProcessor } from './revenuecat-webhook.processor';
import { SubscriptionService } from './subscription.service';

describe('RevenueCatWebhookProcessor', () => {
  it('delegates RevenueCat jobs to the subscription service', async () => {
    const payload: RevenueCatWebhookPayload = {
      event: {
        event_timestamp_ms: 1,
        id: 'event-1',
        type: 'TEST',
      },
    };
    const processRevenueCatWebhook = jest
      .fn()
      .mockResolvedValue({ processed: false, reason: 'test_event' });
    const processor = new RevenueCatWebhookProcessor({
      processRevenueCatWebhook,
    } as unknown as SubscriptionService);

    await expect(
      processor.process({
        data: payload,
        name: REVENUECAT_WEBHOOK_JOB,
      } as Job<RevenueCatWebhookPayload>),
    ).resolves.toEqual({ processed: false, reason: 'test_event' });

    expect(processRevenueCatWebhook).toHaveBeenCalledWith(payload);
  });
});
