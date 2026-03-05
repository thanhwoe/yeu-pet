import { Module } from '@nestjs/common';
import { BullMQModule } from './bullmq/bullmq.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { OtpModule } from './otp/otp.module';
import { CacheModule } from './cache/cache.module';
import { EventBusModule } from './event-bus/event-bus.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    RedisModule,
    BullMQModule,
    FileUploadModule,
    OtpModule,
    CacheModule,
    EventBusModule,
  ],

  exports: [
    BullMQModule,
    FileUploadModule,
    OtpModule,
    CacheModule,
    EventBusModule,
  ],
})
export class SharedModule {}
