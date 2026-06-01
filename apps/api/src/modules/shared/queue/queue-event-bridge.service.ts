import { IEventBusService } from '@app/interfaces/event-bus.interface';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { QueueService } from './queue.service';
import { QUEUE_EVENT_CHANNELS } from './queue.events';
import type {
  FileDeleteJobParams,
  UploadJobParams,
} from '@app/interfaces/file-upload.interface';
import type { SendOtpJobParams } from '@app/interfaces/otp.interface';
import type { EmailJobParams } from '@app/interfaces/email-jobs.interface';

@Injectable()
export class QueueEventBridgeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueEventBridgeService.name);
  private readonly unsubscribers: Array<() => Promise<void>> = [];

  constructor(
    @Inject(IEventBusService)
    private readonly eventBusService: IEventBusService,
    private readonly queueService: QueueService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.subscribe(
      QUEUE_EVENT_CHANNELS.FILE_UPLOAD_REQUESTED,
      (payload: UploadJobParams) =>
        this.queueService.dispatchFileUpload(payload),
    );
    await this.subscribe(
      QUEUE_EVENT_CHANNELS.PHOTO_UPLOAD_REQUESTED,
      (payload: UploadJobParams) =>
        this.queueService.dispatchPhotoUpload(payload),
    );
    await this.subscribe(
      QUEUE_EVENT_CHANNELS.FILE_DELETE_REQUESTED,
      (payload: FileDeleteJobParams) =>
        this.queueService.dispatchFileDelete(payload),
    );
    await this.subscribe(QUEUE_EVENT_CHANNELS.OTP_REQUESTED, (payload) =>
      this.queueService.dispatchOtp(payload as SendOtpJobParams),
    );
    await this.subscribe(QUEUE_EVENT_CHANNELS.EMAIL_REQUESTED, (payload) =>
      this.queueService.dispatchEmail(payload as EmailJobParams),
    );
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(
      this.unsubscribers.map((unsubscribe) =>
        unsubscribe().catch((error) =>
          this.logger.error(
            `Failed to unsubscribe queue bridge: ${(error as Error).message}`,
          ),
        ),
      ),
    );
    this.unsubscribers.length = 0;
  }

  private async subscribe<T>(
    channel: string,
    dispatch: (payload: T) => Promise<unknown>,
  ): Promise<void> {
    const unsubscribe = await this.eventBusService.subscribe(
      channel,
      (payload: T) => {
        dispatch(payload).catch((error) =>
          this.logger.error(
            `Failed to dispatch queue event [${channel}]: ${
              (error as Error).message
            }`,
          ),
        );
      },
      (error) =>
        this.logger.error(
          `Queue event subscription error [${channel}]: ${
            (error as Error).message
          }`,
        ),
    );

    this.unsubscribers.push(unsubscribe);
  }
}
