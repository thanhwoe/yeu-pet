import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHogClient, posthogFactory } from './posthog.config';

@Global()
@Module({
  providers: [
    {
      provide: PostHogClient,
      useFactory: posthogFactory,
      inject: [ConfigService],
    },
  ],
  exports: [PostHogClient],
})
export class PostHogModule {}
