import { Module } from '@nestjs/common';
import { RedisPubSubService } from './redis/redis-pub-sub.service';
import { IEventBusService } from '@app/interfaces/event-bus.interface';

@Module({
  providers: [
    RedisPubSubService,
    {
      provide: IEventBusService,
      useExisting: RedisPubSubService,
    },
  ],
  exports: [IEventBusService],
})
export class EventBusModule {}
