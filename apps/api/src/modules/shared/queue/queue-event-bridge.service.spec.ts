import type { IEventBusService } from '@app/interfaces/event-bus.interface';
import { QueueEventBridgeService } from './queue-event-bridge.service';
import { QUEUE_EVENT_CHANNELS } from './queue.events';
import type { QueueService } from './queue.service';

type QueueDispatchMocks = Record<
  | 'dispatchFileUpload'
  | 'dispatchPhotoUpload'
  | 'dispatchFileDelete'
  | 'dispatchOtp'
  | 'dispatchEmail',
  jest.Mock<Promise<{ jobId: string; message: string }>, [unknown]>
>;

type EventBusMock = IEventBusService & {
  subscribe: jest.Mock<
    Promise<() => Promise<void>>,
    [string, (payload: unknown) => void, ((error: unknown) => void)?]
  >;
};

const queued = (jobId: string) => Promise.resolve({ jobId, message: 'ok' });

describe('QueueEventBridgeService', () => {
  let handlers: Record<string, (payload: unknown) => void>;
  let unsubscribers: Array<jest.Mock<Promise<void>, []>>;
  let eventBus: EventBusMock;
  let queueService: QueueDispatchMocks;
  let bridge: QueueEventBridgeService;

  beforeEach(() => {
    handlers = {};
    unsubscribers = [];
    eventBus = {
      publish: () => Promise.resolve(undefined),
      subscribe: jest.fn(
        (channel: string, handler: (payload: unknown) => void) => {
          handlers[channel] = handler;
          const unsubscribe = jest.fn(() => Promise.resolve(undefined));
          unsubscribers.push(unsubscribe);
          return Promise.resolve(unsubscribe);
        },
      ),
    };
    queueService = {
      dispatchFileUpload: jest.fn((payload: unknown) => {
        void payload;
        return queued('1');
      }),
      dispatchPhotoUpload: jest.fn((payload: unknown) => {
        void payload;
        return queued('2');
      }),
      dispatchFileDelete: jest.fn((payload: unknown) => {
        void payload;
        return queued('3');
      }),
      dispatchOtp: jest.fn((payload: unknown) => {
        void payload;
        return queued('4');
      }),
      dispatchEmail: jest.fn((payload: unknown) => {
        void payload;
        return queued('5');
      }),
    };
    bridge = new QueueEventBridgeService(
      eventBus,
      queueService as unknown as QueueService,
    );
  });

  it('subscribes to queue event channels and dispatches payloads', async () => {
    await bridge.onModuleInit();

    const subscribedChannels = eventBus.subscribe.mock.calls.map(
      ([channel]) => channel,
    );

    expect(subscribedChannels).toEqual([
      QUEUE_EVENT_CHANNELS.FILE_UPLOAD_REQUESTED,
      QUEUE_EVENT_CHANNELS.PHOTO_UPLOAD_REQUESTED,
      QUEUE_EVENT_CHANNELS.FILE_DELETE_REQUESTED,
      QUEUE_EVENT_CHANNELS.OTP_REQUESTED,
      QUEUE_EVENT_CHANNELS.EMAIL_REQUESTED,
    ]);

    handlers[QUEUE_EVENT_CHANNELS.EMAIL_REQUESTED]({
      to: 'user@example.com',
      subject: 'Welcome',
    });
    await Promise.resolve();

    expect(queueService.dispatchEmail.mock.calls).toEqual([
      [{ to: 'user@example.com', subject: 'Welcome' }],
    ]);
  });

  it('unsubscribes from all channels on shutdown', async () => {
    await bridge.onModuleInit();
    await bridge.onModuleDestroy();

    expect(unsubscribers).toHaveLength(5);
    expect(
      unsubscribers.every((unsubscribe) => unsubscribe.mock.calls.length === 1),
    ).toBe(true);
  });
});
