import { IEventBusService } from '@app/interfaces/event-bus.interface';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { redisFactory } from '../../redis/redis.config';

interface SubscriberEntry {
  client: Redis;
  channel: string;
  handler: (message: any) => void;
}

@Injectable()
export class RedisPubSubService
  implements IEventBusService, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisPubSubService.name);
  readonly publisher: Redis;

  // Tracks all active subscriber connections for lifecycle management
  private readonly subscribers = new Map<string, SubscriberEntry>();

  constructor(private readonly configService: ConfigService) {
    this.publisher = this.createClient('publisher');
  }

  private createClient(name: string): Redis {
    // must create multiple redis instance for pub/sub
    const client = redisFactory(this.configService);

    client.on('error', (err) =>
      this.logger.error(`Redis [${name}] error: ${err.message}`),
    );

    client.on('reconnecting', () =>
      this.logger.warn(`Redis [${name}] reconnecting...`),
    );

    return client;
  }

  async onModuleInit(): Promise<void> {
    await this.publisher.ping();
    this.logger.log('Redis pubsub publisher connected');
  }

  async onModuleDestroy(): Promise<void> {
    // Gracefully close all subscriber connections first, then publisher
    await Promise.all(
      [...this.subscribers.values()].map((entry) =>
        entry.client
          .quit()
          .catch((err) =>
            this.logger.error(
              `Error closing subscriber: ${(err as Error).message}`,
            ),
          ),
      ),
    );
    this.subscribers.clear();
    await this.publisher.quit();
  }

  async publish(channel: string, message: any): Promise<void> {
    const serialized = JSON.stringify(message);
    const receiverCount = await this.publisher.publish(channel, serialized);

    this.logger.debug(
      `Published to [${channel}] — ${receiverCount} receiver(s)`,
    );
  }

  async subscribe(
    channel: string,
    handler: (message: any) => void,
    onError?: (error: unknown) => void,
  ): Promise<() => Promise<void>> {
    const id = randomUUID();
    const client = this.createClient(`subscriber:${id}`);

    await client.subscribe(channel);

    client.on('message', (receivedChannel, raw) => {
      if (receivedChannel !== channel) return;

      try {
        const parsed = JSON.parse(raw) as unknown;
        handler(parsed);
      } catch {
        this.logger.warn(
          `Failed to parse message on channel [${channel}]: ${raw}`,
        );
      }
    });

    if (onError) {
      client.on('error', onError);
    }

    this.subscribers.set(id, { client, channel, handler });
    this.logger.debug(`Subscribed to [${channel}] — subscriber id: ${id}`);

    // cleanup function
    return async () => {
      const entry = this.subscribers.get(id);
      if (!entry) return;

      await entry.client
        .quit()
        .catch((err) =>
          this.logger.error(
            `Error unsubscribing [${channel}]: ${(err as Error).message}`,
          ),
        );

      this.subscribers.delete(id);
      this.logger.debug(`Unsubscribed from [${channel}] — id: ${id}`);
    };
  }
}
