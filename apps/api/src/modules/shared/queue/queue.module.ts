import { Global, Module } from '@nestjs/common';
import { BullMQModule } from '../bullmq/bullmq.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { QueueEventBridgeService } from './queue-event-bridge.service';
import { QueueService } from './queue.service';

@Global()
@Module({
  imports: [BullMQModule, EventBusModule],
  providers: [QueueService, QueueEventBridgeService],
  exports: [QueueService],
})
export class QueueModule {}
