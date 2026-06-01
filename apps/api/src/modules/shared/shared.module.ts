import { Global, Module } from '@nestjs/common';
import { HttpCacheEvictInterceptor } from '@app/interceptors/http-cache-evict.interceptor';
import { HttpCacheInterceptor } from '@app/interceptors/http-cache.interceptor';
import { BullMQModule } from './bullmq/bullmq.module';
import { CacheModule } from './cache/cache.module';
import { EmailModule } from './email/email.module';
import { EventBusModule } from './event-bus/event-bus.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { OtpModule } from './otp/otp.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { TrackModule } from './track/track.module';

@Global()
@Module({
  imports: [
    RedisModule,
    BullMQModule,
    FileUploadModule,
    OtpModule,
    QueueModule,
    EmailModule,
    CacheModule,
    EventBusModule,
    TrackModule,
  ],
  providers: [HttpCacheInterceptor, HttpCacheEvictInterceptor],

  exports: [
    BullMQModule,
    FileUploadModule,
    OtpModule,
    QueueModule,
    EmailModule,
    CacheModule,
    EventBusModule,
    TrackModule,
    HttpCacheInterceptor,
    HttpCacheEvictInterceptor,
  ],
})
export class SharedModule {}
