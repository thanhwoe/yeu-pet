import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PostHog } from 'posthog-node';
import { PostHogClient } from './posthog/posthog.config';

@Injectable()
export class TrackService implements OnModuleDestroy {
  constructor(
    @Inject(PostHogClient)
    private readonly postHogClient: PostHog | null,
  ) {}

  error(
    error: Error,
    event: {
      distinctId: string;
      properties?: Record<string, any>;
    },
  ) {
    if (!this.postHogClient) return;
    this.postHogClient.captureException(
      error,
      event.distinctId,
      event.properties,
    );
  }

  capture(event: {
    distinctId: string;
    event: string;
    properties?: Record<string, any>;
  }) {
    if (!this.postHogClient) return;
    this.postHogClient.capture({
      distinctId: event.distinctId,
      event: event.event,
      properties: event.properties,
    });
  }

  async onModuleDestroy() {
    if (!this.postHogClient) return;
    await this.postHogClient.shutdown();
  }
}
