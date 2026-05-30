import { Module } from '@nestjs/common';
import { BullMQModule } from './bullmq/bullmq.module';
import { CacheModule } from './cache/cache.module';
import { EventBusModule } from './event-bus/event-bus.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { OtpModule } from './otp/otp.module';
import { RedisModule } from './redis/redis.module';
import { TrackModule } from './track/track.module';

@Module({
  imports: [
    RedisModule,
    BullMQModule,
    FileUploadModule,
    OtpModule,
    CacheModule,
    EventBusModule,
    TrackModule,
  ],

  exports: [
    BullMQModule,
    FileUploadModule,
    OtpModule,
    CacheModule,
    EventBusModule,
    TrackModule,
  ],
})
export class SharedModule {}
