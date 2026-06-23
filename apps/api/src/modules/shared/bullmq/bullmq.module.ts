import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { getBullMQConfig } from './bullmq.config';
import { BULLMQ_QUEUES } from './bullmq.queue';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: getBullMQConfig,
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: BULLMQ_QUEUES.FILE_UPLOAD,
    }),
    BullModule.registerQueue({
      name: BULLMQ_QUEUES.FILE_DELETE,
    }),
    BullModule.registerQueue({
      name: BULLMQ_QUEUES.PHOTO_UPLOAD,
    }),
    BullModule.registerQueue({
      name: BULLMQ_QUEUES.SEND_OTP,
    }),
    BullModule.registerQueue({
      name: BULLMQ_QUEUES.EMAIL,
    }),
    BullModule.registerQueue({
      name: BULLMQ_QUEUES.REVENUECAT_WEBHOOK,
    }),
  ],
  exports: [BullModule],
})
export class BullMQModule {}
