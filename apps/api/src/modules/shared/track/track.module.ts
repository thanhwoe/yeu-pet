import { Module } from '@nestjs/common';
import { PostHogModule } from './posthog/posthog.module';
import { TrackService } from './track.service';

@Module({
  imports: [PostHogModule],
  providers: [TrackService],
  exports: [TrackService],
})
export class TrackModule {}
